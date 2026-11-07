import { describe, it, expect } from 'vitest';
import { randomChamber, createMatch, fire, completeShot, resetPlayer, resetMatch, rename, winner, persist, load, KEY, validateState } from '../src/engine.js';
const entries = [0,1,2,3].map((v,i) => ({ name: `Guest ${i}`, skin: ['wolf','fox','hare','bear'][i] }));
const match = (bullet = 5) => createMatch(entries, () => bullet);
function memory() { const map = new Map(); return { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,v) }; }

describe('uniform cryptographic chamber mapping', () => {
  it('maps every residue equally over complete blocks', () => {
    const counts = Array(6).fill(0);
    for (let i = 0; i < 60000; i++) counts[randomChamber(a => { a[0] = i; })]++;
    expect(counts).toEqual(Array(6).fill(10000));
  });
  it('rejects each of the four biased tail samples', () => {
    const values = [4294967292,4294967293,4294967294,4294967295,4294967291]; let calls=0;
    expect(randomChamber(a => { a[0] = values[calls++]; })).toBe(5); expect(calls).toBe(5);
  });
  it('uses the secure browser generator by default', () => { expect(randomChamber()).toBeGreaterThanOrEqual(0); expect(randomChamber()).toBeLessThan(6); });
});

describe('revolver lifecycle', () => {
  for (let bullet=0; bullet<6; bullet++) it(`has exactly one fatal chamber at ${bullet+1}, never reshuffling`, () => {
    let state = match(bullet); let fatalities = 0;
    for (let shot=0; shot<=bullet; shot++) {
      const before = state;
      state = fire(state,'p1',state.nextShot);
      expect(before.players[0].shots).toBe(shot);
      expect(state.players[0].shots).toBe(shot+1);
      expect(state.players[0].bullet).toBe(bullet);
      expect(state.pending.fatal).toBe(shot===bullet);
      fatalities += +state.pending.fatal;
      state = completeShot(state);
    }
    expect(fatalities).toBe(1);
    expect(() => fire(state,'p1',state.nextShot)).toThrow(/Eliminated/);
  });
  it('initializes independently exactly once per player', () => {
    let calls=0; const s=createMatch(entries,()=>calls++);
    expect(calls).toBe(4); expect(s.players.map(p=>p.bullet)).toEqual([0,1,2,3]);
    const n=fire(s,'p2',s.nextShot);
    expect(n.players.filter(p=>p.id!=='p2')).toEqual(s.players.filter(p=>p.id!=='p2'));
  });
  it('rejects double shots and stale tokens after the reveal', () => {
    const s=match(), n=fire(s,'p1',1);
    expect(()=>fire(n,'p1',1)).toThrow(/progress/);
    expect(()=>fire(n,'p2',2)).toThrow(/progress/);
    expect(()=>fire(completeShot(n),'p1',1)).toThrow(/already/);
  });
  it('eliminates correctly and protects the last survivor', () => {
    let s=match(0);
    for(const id of ['p1','p2','p3']) s=completeShot(fire(s,id,s.nextShot));
    expect(winner(s).id).toBe('p4'); expect(()=>fire(s,'p4',s.nextShot)).toThrow(/ended/);
  });
  it('renames without changing progress or RNG', () => {
    const s=completeShot(fire(match(),'p1',1)), n=rename(s,'p1','Alice');
    expect(n.players[0]).toEqual({...s.players[0],name:'Alice'}); expect(n.players.slice(1)).toEqual(s.players.slice(1));
    expect(()=>rename(s,'p1',' ')).toThrow();
  });
  it('resets just one player and restores eliminated players', () => {
    const s=completeShot(fire(match(0),'p1',1)), n=resetPlayer(s,'p1',()=>4);
    expect(n.players[0]).toEqual({...s.players[0],dead:false,shots:0,bullet:4});
    expect(n.players.slice(1)).toEqual(s.players.slice(1)); expect(n.last).toBeNull();
  });
  it('resets the match with fresh cylinders and retained identities', () => {
    const s=completeShot(fire(match(),'p1',1)); let calls=0; const n=resetMatch(s,()=>calls++);
    expect(calls).toBe(4); expect(n.players.map(p=>p.shots)).toEqual([0,0,0,0]);
    expect(n.players.map(p=>p.name)).toEqual(entries.map(p=>p.name)); expect(n.nextShot).toBe(s.nextShot);
  });
  it('does not permit management during a shot', () => {
    const s=fire(match(),'p1',1);
    for(const action of [()=>resetPlayer(s,'p1'),()=>resetMatch(s),()=>rename(s,'p1','a')]) expect(action).toThrow(/Finish/);
  });
  it('validates player counts and defaults', () => {
    expect(()=>createMatch(entries.slice(0,1))).toThrow(); expect(createMatch([{},{}]).players[0].name).toBe('Player 1');
    expect(createMatch(entries.slice(0,2)).players).toHaveLength(2);
    expect(createMatch(entries.slice(0,3)).players).toHaveLength(3);
  });
});

describe('durable state', () => {
  it('restores every cylinder, name, skin, elimination and pending reveal exactly', () => {
    const storage=memory(); let s=persist(storage,match(0));
    s=persist(storage,fire(s,'p1',1),s); const restored=load(storage);
    expect(restored).toEqual(s); expect(restored.pending.fatal).toBe(true);
    expect(()=>fire(restored,'p2',2)).toThrow();
    const ready=completeShot(restored); expect(ready.players).toEqual(s.players);
  });
  it('preserves a blank through refresh and fires the next chamber', () => {
    const storage=memory(); let s=persist(storage,match(1));
    s=persist(storage,fire(s,'p1',1),s); persist(storage,completeShot(load(storage)),s);
    expect(fire(load(storage),'p1',2).pending.fatal).toBe(true);
  });
  it('fails without mutating the old state when storage is full', () => {
    const storage=memory(); const s=persist(storage,match());
    const broken={...storage,setItem(){throw Error('quota');}};
    expect(()=>persist(broken,fire(s,'p1',1),s)).toThrow(/No shot was consumed/);
    expect(load(storage)).toEqual(s); expect(s.players[0].shots).toBe(0);
  });
  it('rejects stale writes', () => {
    const storage=memory(); const s=persist(storage,match());
    persist(storage,rename(s,'p1','Alice'),s);
    expect(()=>persist(storage,fire(s,'p1',1),s)).toThrow(/another tab/);
  });
  it('never silently discards corrupted or future saves', () => {
    const storage=memory(); storage.setItem(KEY,'{'); expect(()=>load(storage)).toThrow(/preserved/); expect(storage.getItem(KEY)).toBe('{');
    storage.setItem(KEY,JSON.stringify({...match(),version:42})); expect(()=>load(storage)).toThrow(/preserved/);
  });
  it('rejects semantically inconsistent progress and pending records', () => {
    const s=match(0); s.players[0].shots=1; expect(()=>validateState(s)).toThrow(/Inconsistent/);
    const n=fire(match(),'p1',1); n.pending.fatal=true; expect(()=>validateState(n)).toThrow();
  });
  it('round-trips individual reset after death and full reset', () => {
    const storage=memory(); let s=persist(storage,match(0));
    for(const action of [s=>fire(s,'p1',s.nextShot),completeShot,s=>resetPlayer(s,'p1',()=>3),s=>resetMatch(s,()=>5)]) {
      const n=action(s); s=persist(storage,n,s); expect(load(storage)).toEqual(n);
    }
  });
});
