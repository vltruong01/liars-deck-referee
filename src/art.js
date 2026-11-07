import { normalizeAppearance, colors, accessories } from './appearance.js';
export const skins = [
  { id:'wolf', name:'The Wolf', role:'THE OLD HAND', color:'#83958d', coat:'#344a44' },
  { id:'fox', name:'The Fox', role:'THE CARD SHARP', color:'#bd7446', coat:'#633f39' },
  { id:'hare', name:'The Hare', role:'THE QUIET ONE', color:'#c8bbaa', coat:'#4b454e' },
  { id:'bear', name:'The Bear', role:'THE HEAVY', color:'#8b7060', coat:'#484a38' },
  { id:'raven', name:'The Raven', role:'THE WITNESS', color:'#586a7c', coat:'#313d51' },
  { id:'stag', name:'The Stag', role:'THE HIGH ROLLER', color:'#b79b77', coat:'#5b3d3d' },
];
let serial = 0;
export function portrait(id, decorative = true, appearance = {}) {
  const a=normalizeAppearance(appearance), base=skins.find(s=>s.id===id)||skins[0], s={...base,coat:colors[a.suit]||base.coat}, n=`portrait${serial++}`;
  const heads={
    wolf:`<path d="M64 106 48 31 92 66Q120 52 149 66L191 30 176 113 158 159 120 187 82 158Z"/><path d="m52 45 34 36-24 11m115-47-30 34 25 12" fill="#293735"/><path d="m72 120 29 12 19 40 21-40 30-12-20 47-31 20-31-20Z" fill="#b2b7a5"/>`,
    fox:`<path d="M66 111 51 25 100 67Q120 60 142 68L191 26 174 115 156 159 121 187 83 157Z"/><path d="m60 43 29 35-22 19m113-54-29 35 24 17" fill="#382b2b"/><path d="m70 118 42 20 8 37 9-37 43-20-20 43-32 25-30-25Z" fill="#e0c8a4"/>`,
    hare:`<path d="M72 91Q39-5 72 5 99 9 101 83L132 81Q135-5 161 5 190 13 158 96L175 123 164 163 120 190 78 164 63 123Z"/><path d="M74 23 88 82M158 23 146 80" stroke="#816b6a" stroke-width="10"/><path d="m82 146 23-10 15 13 15-13 22 10-16 29-21 15-23-15Z" fill="#e1d5c0"/>`,
    bear:`<circle cx="67" cy="81" r="28"/><circle cx="172" cy="81" r="28"/><circle cx="67" cy="81" r="15" fill="#4b3835"/><circle cx="172" cy="81" r="15" fill="#4b3835"/><path d="M68 88Q120 51 172 88L182 135 164 170 120 191 77 170 58 135Z"/><ellipse cx="120" cy="154" rx="34" ry="28" fill="#bc9b7b"/>`,
    raven:`<path d="m67 104 2-45 23 15 18-29 20 22 27-18 8 35 21 25-16 46-45 35-45-28Z"/><path d="m92 134 28-8 40 24-38 24-29-23Z" fill="#b7a890"/><path d="m120 131 1 34 33-16Z" fill="#696052"/>`,
    stag:`<g fill="none" stroke="#b79b77" stroke-width="9" stroke-linecap="round"><path d="M91 88 62 54 51 12m13 44-29-9-12-22m37 11 17-17m72 69 29-34 10-42m-12 44 29-9 12-22m-36 11-17-17"/></g><path d="m80 90-39-25 10 42 25 10 7 46 37 29 37-29 7-46 25-10 10-42-39 25-19-12-43 0Z"/><path d="m100 134 20 37 20-37-5 40-15 16-16-16Z" fill="#e0c7a2"/>`,
  };
  return `<svg class="portrait" preserveAspectRatio="xMidYMax meet" viewBox="-20 -45 280 365" data-skin="${s.id}" ${decorative?'aria-hidden="true"':`role="img" aria-label="${s.name}"`} xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${n}coat" x2=".8" y2="1"><stop stop-color="${s.coat}"/><stop offset="1" stop-color="#111918"/></linearGradient><linearGradient id="${n}head" x2=".8" y2="1"><stop stop-color="${s.color}"/><stop offset="1" stop-color="#342f2b"/></linearGradient></defs>
  <ellipse cx="120" cy="296" rx="100" ry="12" fill="#000" opacity=".4"/>
  <g class="outfit" data-outfit="${a.outfit}" transform="translate(120 0) scale(${s.id==='bear'?1.13:s.id==='hare'?.88:s.id==='raven'?.92:1} 1) translate(-120 0)">
  ${a.outfit==='western'?`<path d="M18 310 31 220 80 190 157 190 211 223 225 310 147 310 120 274 91 310Z" fill="url(#${n}coat)" stroke="#bba278" stroke-width="2"/><path d="m35 221 43-25 42 31 39-31 46 25-28 21-17-19-40 16-41-16-19 19Z" fill="#aa8a5e"/><path d="M84 235 77 310M156 235l7 75" stroke="#201d17" stroke-width="5"/><path d="M170 250h20v22h-20Z" fill="#26302b"/><path d="m93 294 54 0v14H93Z" fill="#211e1a"/><rect x="111" y="294" width="21" height="14" fill="#bda063"/>`:
  a.outfit==='vest'?`<path d="M23 305 29 225 83 192H156L211 225 219 305Z" fill="#c5bea6" stroke="#424c42" stroke-width="3"/><path d="m31 242 35 4-7 48-34-6m183-46-35 4 7 48 34-6" fill="#ebe1c8"/><path d="m81 193 39 34 37-34 17 112-40 5-14-25-14 25-40-5Z" fill="url(#${n}coat)" stroke="#bba278" stroke-width="2"/><path d="M120 232v52m-35-17h19m35 0h20" stroke="#9e8960" stroke-width="2"/><circle cx="126" cy="250" r="3" fill="#cfb579"/><circle cx="126" cy="272" r="3" fill="#cfb579"/>`:
  `<path d="m26 310 9-80 48-35 75 0 49 35 9 80Z" fill="url(#${n}coat)" stroke="#b69c6d" stroke-opacity=".45"/><path d="m87 193 33 31 32-31 12 117H75Z" fill="#d1c6aa"/><path d="m82 193-18 30 30 3-13 21 39 52-18-82m54-24 19 30-29 3 13 21-39 52 17-82" fill="${s.coat}" stroke="#c5ac7c" stroke-opacity=".55"/>`}
  ${a.bow?`<path d="m120 228-25-12v27l25-10 25 10v-27Z" fill="${colors[a.tie]}"/><circle cx="120" cy="230" r="6" fill="${colors[a.tie]}"/>`:`<path d="m120 224-11 14 11 48 11-48Z" fill="${colors[a.tie]}"/>`}
  ${['left','right'].map(side=>`<g class="idle-arm-${side}"><path d="${side==='left'?'M43 238 38 275 82 288':'M197 238 202 275 158 288'}" fill="none" stroke="#101d18" stroke-width="25" stroke-linecap="round"/><path d="${side==='left'?'M43 238 40 272 84 286':'M197 238 200 272 156 286'}" fill="none" stroke="${a.outfit==='vest'?'#c5bea6':s.coat}" stroke-width="19" stroke-linecap="round"/></g>`).join('')}
  <path class="idle-hand-left" d="m81 278 22 3 6 11-28 2" fill="${s.color}" stroke="#222e27" stroke-width="2"/><path class="idle-hand-right" d="m158 278-22 3-6 11 28 2" fill="${s.color}" stroke="#222e27" stroke-width="2"/>
  </g>
  <g fill="url(#${n}head)" stroke="#151a18" stroke-width="3" stroke-linejoin="round">${heads[s.id]}</g>
  <path d="${s.id==='hare'?'M77 109q12-11 25 1m32 0q15-10 31 0':s.id==='bear'?'M77 109l26 6m31 0 28-6':'M76 109l28 8m31 0 28-8'}" fill="none" stroke="#222d26" stroke-width="5" stroke-linecap="round"/>
  <path d="M74 95 83 85M157 86l8 10" stroke="#e2d6b0" stroke-opacity=".35" stroke-width="3"/>
  <path d="m77 111 24 8-5 7-18-7m85-8-24 8 5 7 18-7" fill="#1b2020"/>
  <path d="m83 118 12 3m62-3-12 3" stroke="#f2d99a" stroke-width="3"/>
  ${s.id==='raven'?'':`<path d="m108 149 24 0-12 12Z" fill="#1d2523"/><path d="M120 160v11m-12 1 12 4 12-4" fill="none" stroke="#222825" stroke-width="2"/>`}
  ${accessories(s.id,a)}
  </svg>`;
}

export function roomArt() {
  let bottles='';
  for(let row=0;row<2;row++) for(let i=0;i<23;i++) {
    const x=70+i*44,y=202+row*78,h=29+(i*13%24),c=['#354b3b','#6e492b','#4c4932','#4d302d'][i%4];
    bottles+=`<path d="M${x} ${y}v-${h-10}l5-5v-12h8v12l5 5v${h-10}Z" fill="${c}" stroke="#b9904d" stroke-opacity=".15"/><rect x="${x+2}" y="${y-18}" width="14" height="9" fill="#ad9362" opacity=".28"/>`;
  }
  return `<svg class="room-art" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="wall"><stop stop-color="#463c29"/><stop offset="1" stop-color="#101815"/></radialGradient><linearGradient id="wood" x2="0" y2="1"><stop stop-color="#4e3928"/><stop offset="1" stop-color="#181c17"/></linearGradient><radialGradient id="light"><stop stop-color="#e5ae55" stop-opacity=".2"/><stop offset="1" stop-color="#e5ae55" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="700" fill="url(#wall)"/>
  <path d="M0 380H1200V700H0Z" fill="url(#wood)"/>
  <g stroke="#a07b4f" opacity=".1"><path d="M0 430H1200M0 510H1200M0 610H1200M600 380 100 700M600 380 1100 700M400 380 0 700M800 380 1200 700"/></g>
  <rect x="48" y="68" width="1104" height="248" rx="120" fill="#121a16" stroke="#75623f" stroke-width="8"/>
  <path d="M60 211H1140M60 289H1140" stroke="#695039" stroke-width="9"/>
  <path d="M320 79V288M878 79V288" stroke="#594a33" stroke-width="12"/>
  ${bottles}
  <rect x="450" y="102" width="300" height="123" rx="3" fill="#17221d" stroke="#79633f" stroke-width="2"/>
  <text x="600" y="151" text-anchor="middle" fill="#be9b61" font-family="Georgia,serif" font-size="31" letter-spacing="6">THE LAST</text><text x="600" y="189" text-anchor="middle" fill="#be9b61" font-family="Georgia,serif" font-size="31" letter-spacing="8">CALL</text>
  <path d="M30 307H1170L1200 347H0Z" fill="#5c4330" stroke="#9b7349" stroke-width="2"/><path d="M20 350H1180V403H20Z" fill="#24281e"/>
  <g stroke="#74603e" stroke-width="3" opacity=".4"><path d="M45 355V394H280V355M320 355V394H560V355M610 355V394H850V355M890 355V394H1150V355"/></g>
  <ellipse cx="244" cy="206" rx="180" ry="225" fill="url(#light)"/><ellipse cx="956" cy="206" rx="180" ry="225" fill="url(#light)"/>
  <g fill="#141c17" stroke="#a1844f" stroke-width="2"><path d="M244 0V99m-36 40 14-39h44l14 39Z"/><path d="M956 0V99m-36 40 14-39h44l14 39Z"/></g>
  <path d="M214 141H274M926 141H986" stroke="#f1c677" stroke-width="5"/>
  <path d="M12 0V700M1188 0V700" stroke="#080f0d" stroke-width="45"/>
  </svg>`;
}

export function revolver() {
 return `<svg class="revolver" viewBox="0 0 640 350" aria-label="Illustrated six chamber revolver" role="img" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="steel" x2=".3" y2="1"><stop stop-color="#b1b6ac"/><stop offset=".28" stop-color="#5d6d67"/><stop offset=".5" stop-color="#9aa396"/><stop offset=".65" stop-color="#32413e"/><stop offset="1" stop-color="#172420"/></linearGradient><linearGradient id="grip"><stop stop-color="#704939"/><stop offset="1" stop-color="#2b2522"/></linearGradient></defs>
 <ellipse cx="320" cy="324" rx="230" ry="14" fill="#000" opacity=".4"/>
 <g class="gun-body" stroke="#111d19" stroke-width="4" stroke-linejoin="round">
 <path d="m93 122 251-7 0-14 203-2 5 10 24 4v38l-233 6-17 29-111 8-26-23-96-7Z" fill="url(#steel)"/>
 <path d="M344 109H563M359 135H559" fill="none" stroke="#d3d3b5" stroke-opacity=".45" stroke-width="3"/>
 <path d="m544 98 0-9 12 0 3 12m-363 18 0-17-15-13-7 6 5 24" fill="#56675c"/>
 <path d="m124 163-22 33-27 95q34 29 93 21l-6-62 34-59-17-21Z" fill="url(#grip)"/>
 <g stroke="#b38e64" stroke-width="2" opacity=".4"><path d="m112 211 45 25m-51-12 48 26m-54-12 51 27m-55-12 53 29m-58-13 57 28"/></g>
 <circle cx="130" cy="274" r="5" fill="#b0a07d"/>
 <path d="m188 188 61 0q22 41-15 51l-60-2 5-14 51 1q13-6 6-23h-49Z" fill="url(#steel)"/>
 <path class="trigger" d="M212 187q-15 20 6 29" fill="none" stroke="#a0a394" stroke-width="8"/>
 <path class="hammer" d="m124 121-13-28-19-5-5 10 15 10 5 24" fill="url(#steel)"/>
 <g class="cylinder"><rect x="210" y="108" width="112" height="83" rx="15" fill="url(#steel)"/><path d="M225 118v62m24-64v65m24-65v65m24-63v62" stroke="#1e302a" stroke-width="9"/><path d="M218 111H309" stroke="#bcbba5" stroke-width="3"/></g>
 <circle cx="183" cy="156" r="9" fill="#405248"/><path d="m179 156h8" stroke="#b6b6a2" stroke-width="2"/>
 </g>
 <path class="muzzle" d="m578 126 35-17-13 19 34 8-35 6 15 20-36-22Z" fill="#ffe3a0" opacity="0"/>
 </svg>`;
}

// Art and gun share a fixed rig coordinate system, so they resize together.
export function executionRig(player) {
 const coat=colors[normalizeAppearance(player.appearance).suit]||skins.find(s=>s.id===player.skin)?.coat||'#344a44';
 return `<svg class="character-rig" viewBox="0 0 480 430" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
 <ellipse class="rig-shadow" cx="245" cy="401" rx="115" ry="14" fill="#000" opacity=".6"/>
 <g class="rig-actor">
 <svg class="portrait" x="105" y="20" width="280" height="365" viewBox="-20 -45 280 365">${portrait(player.skin,true,player.appearance).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>
 <g class="upper-arm weapon-arm">
 <path d="M292 250 370 290" stroke="#111c18" stroke-width="32" stroke-linecap="round"/><path d="M292 250 370 290" stroke="${coat}" stroke-width="25" stroke-linecap="round"/><path d="M296 244 357 275" stroke="#c1b28d" stroke-opacity=".35" stroke-width="3"/>
 <circle cx="370" cy="290" r="14" fill="${coat}" stroke="#1a251e" stroke-width="3"/>
 <g class="forearm">
 <path d="M370 290 409 227" stroke="#14221b" stroke-width="27" stroke-linecap="round"/><path d="M370 287 409 227" stroke="${coat}" stroke-width="20" stroke-linecap="round"/><path d="m401 228 13 8" stroke="#d9ccb1" stroke-width="9"/>
 <g class="hand-rig">
 <svg id="gun" x="258" y="147" width="190" height="104" viewBox="0 0 640 350"><g transform="translate(640 0) scale(-1 1)">${revolver().replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g></svg>
 <path d="m400 221 5-15q3-5 8-2l9 7-2 23q-8 10-18 0Z" fill="#ad9e7d" stroke="#26352b" stroke-width="3"/>
 <path d="m405 218 13 5m-14 1 13 5m-12 1 11 4" stroke="#6b6552" stroke-width="2"/>
 <path d="M409 213q-12-12-18-6l-5 7" fill="none" stroke="#c2b18c" stroke-width="7" stroke-linecap="round"/>
 </g></g></g></g></svg>`;
}
