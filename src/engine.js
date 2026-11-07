import { normalizeAppearance } from './appearance.js';
export const KEY = 'liars-deck.match.v1';
export const SKINS = ['wolf', 'fox', 'hare', 'bear', 'raven', 'stag'];
const clone = value => JSON.parse(JSON.stringify(value));
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

// 2^32 = 6 * 715827882 + 4. Reject the final four values to avoid modulo bias.
export function randomChamber(source = array => globalThis.crypto.getRandomValues(array)) {
  const sample = new Uint32Array(1);
  do { source(sample); } while (sample[0] >= 4294967292);
  return sample[0] % 6;
}

export function createMatch(entries, rng = randomChamber) {
  requireThat(Array.isArray(entries) && entries.length >= 2 && entries.length <= 4, 'Choose 2–4 players.');
  return {
    version: 1, revision: 0, nextShot: 1, pending: null, last: null,
    players: entries.map((p, i) => ({
      id: `p${i + 1}`, name: String(p.name || `Player ${i + 1}`).trim().slice(0, 24) || `Player ${i + 1}`,
      skin: SKINS.includes(p.skin) ? p.skin : SKINS[i], appearance: normalizeAppearance(p.appearance), bullet: rng(), shots: 0, dead: false,
    })),
  };
}
export const living = state => state.players.filter(p => !p.dead);
export const winner = state => living(state).length === 1 ? living(state)[0] : null;

function updated(state) { const next = clone(state); next.revision++; return next; }
function playerById(state, id) {
  const p = state.players.find(p => p.id === id);
  requireThat(p, 'Player not found.'); return p;
}

export function fire(state, id, shotId) {
  requireThat(!state.pending, 'A shot is already in progress.');
  requireThat(shotId === state.nextShot, 'This trigger pull has already been used.');
  requireThat(!winner(state), 'The match has ended.');
  const next = updated(state), p = playerById(next, id);
  requireThat(!p.dead && p.shots < 6, 'Eliminated players cannot fire.');
  const fatal = p.shots === p.bullet;
  p.shots++; p.dead = fatal;
  next.pending = { id: shotId, playerId: id, fatal, shot: p.shots };
  next.last = clone(next.pending); next.nextShot++;
  return next;
}
export function completeShot(state) {
  requireThat(state.pending, 'No shot is in progress.');
  const next = updated(state); next.pending = null; return next;
}
export function rename(state, id, name) {
  requireThat(!state.pending, 'Finish the shot first.');
  const next = updated(state);
  requireThat(typeof name === 'string' && name.trim().length > 0, 'Enter a player name.');
  playerById(next, id).name = name.trim().slice(0, 24); return next;
}
export function customize(state, id, skin, appearance) {
  requireThat(!state.pending, 'Finish the shot first.');
  requireThat(SKINS.includes(skin), 'Unknown character.');
  const next=updated(state), p=playerById(next,id);
  p.skin=skin; p.appearance=normalizeAppearance(appearance); return next;
}
export function resetPlayer(state, id, rng = randomChamber) {
  requireThat(!state.pending, 'Finish the shot first.');
  const next = updated(state), p = playerById(next, id);
  p.bullet = rng(); p.shots = 0; p.dead = false; next.last = null; return next;
}
export function resetMatch(state, rng = randomChamber) {
  requireThat(!state.pending, 'Finish the shot first.');
  const next = createMatch(state.players, rng);
  next.revision = state.revision + 1;
  // Never reuse an old trigger token within the persisted match lifecycle.
  next.nextShot = state.nextShot; return next;
}

export function validateState(s) {
  requireThat(s && s.version === 1 && Number.isSafeInteger(s.revision) && s.revision >= 0, 'Unsupported or damaged save.');
  requireThat(Number.isSafeInteger(s.nextShot) && s.nextShot >= 1, 'Invalid shot counter.');
  requireThat(Array.isArray(s.players) && s.players.length >= 2 && s.players.length <= 4, 'Invalid player list.');
  const ids = new Set();
  s.players.forEach(p => {
    requireThat(p && typeof p.id === 'string' && !ids.has(p.id), 'Invalid player ID.'); ids.add(p.id);
    requireThat(typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 24 && SKINS.includes(p.skin), 'Invalid player details.');
    requireThat(Number.isInteger(p.bullet) && p.bullet >= 0 && p.bullet < 6, 'Invalid cylinder.');
    requireThat(Number.isInteger(p.shots) && p.shots >= 0 && p.shots <= 6 && typeof p.dead === 'boolean', 'Invalid progress.');
    requireThat(p.dead ? p.shots === p.bullet + 1 : p.shots <= p.bullet, 'Inconsistent cylinder progress.');
  });
  for (const record of [s.pending, s.last]) {
    if (record === null) continue;
    requireThat(record && Number.isSafeInteger(record.id) && record.id > 0 && record.id < s.nextShot, 'Invalid shot record.');
    const p = playerById(s, record.playerId);
    requireThat(typeof record.fatal === 'boolean' && record.shot === p.shots && record.fatal === p.dead, 'Invalid shot result.');
  }
  requireThat(!s.pending || JSON.stringify(s.pending) === JSON.stringify(s.last), 'Inconsistent pending result.');
  return s;
}

export function load(storage) {
  const raw = storage.getItem(KEY);
  if (raw === null) return null;
  try { const state=validateState(JSON.parse(raw)); state.players.forEach(p=>p.appearance=normalizeAppearance(p.appearance)); return state; }
  catch { throw new Error('Saved match cannot be read. It has been preserved. Use “Replace saved match” to start over.'); }
}

// Write first; callers only replace in-memory state after this returns successfully.
export function persist(storage, next, previous = null) {
  validateState(next);
  if (previous) {
    const current = load(storage);
    requireThat(current && current.revision === previous.revision, 'Match changed in another tab. Reload this page before continuing.');
  }
  try { storage.setItem(KEY, JSON.stringify(next)); }
  catch { throw new Error('Cannot save this match. Allow browser storage and free some space, then try again. No shot was consumed.'); }
  return next;
}
