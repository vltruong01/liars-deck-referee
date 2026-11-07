import {describe,it,expect} from 'vitest';
import {createMatch,load,KEY,fire,completeShot,customize,resetMatch} from '../src/engine.js';
import {normalizeAppearance} from '../src/appearance.js';
describe('cosmetics preserve existing matches',()=>{
  const entries=[{name:'Wolf',skin:'wolf'},{name:'Hare',skin:'hare'}];
  it('loads a legacy save without changing cylinders, progress or shot tokens',()=>{
    const state=completeShot(fire(createMatch(entries,()=>5),'p1',1));
    state.players.forEach(p=>delete p.appearance);
    const storage={getItem:key=>key===KEY?JSON.stringify(state):null};
    const restored=load(storage);
    expect(restored.players[0].appearance).toEqual(normalizeAppearance());
    expect(restored.players.map(({appearance,...p})=>p)).toEqual(state.players);
    expect(restored.nextShot).toBe(state.nextShot);expect(restored.revision).toBe(state.revision);
  });
  it('changes exactly one appearance after shooting, and keeps it on reset',()=>{
    const state=completeShot(fire(createMatch(entries,()=>5),'p1',1));
    const next=customize(state,'p1','bear',{hat:'top-hat',eyes:'monocle',mouth:'cigar',outfit:'western',bow:true});
    expect(next.players[1]).toEqual(state.players[1]);
    const {skin,appearance,...progress}=next.players[0];
    const {skin:oldSkin,appearance:oldAppearance,...oldProgress}=state.players[0];
    expect(progress).toEqual(oldProgress);expect(next.nextShot).toBe(state.nextShot);
    expect(next.last).toEqual(state.last);expect(next.pending).toBeNull();
    expect(resetMatch(next,()=>3).players[0].appearance).toEqual(appearance);
    expect(state.players[0].skin).toBe('wolf');
  });
  it('rejects edits during committed shots and restricts untrusted cosmetic values',()=>{
    const pending=fire(createMatch(entries,()=>0),'p1',1);
    expect(()=>customize(pending,'p1','fox',{})).toThrow('Finish the shot');
    const next=customize(createMatch(entries,()=>5),'p1','wolf',{hat:'<script>',suit:'url(evil)',bow:'true'});
    expect(next.players[0].appearance).toEqual(normalizeAppearance());
  });
});
