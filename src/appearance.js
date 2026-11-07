export const choices = {
  hat: ['none','fedora','cowboy','top-hat','cap','mafia'],
  eyes: ['none','sunglasses','round','monocle','eyepatch'],
  mouth: ['none','cigarette','cigar','toothpick'],
  suit: ['original','forest','wine','navy','ivory','charcoal'],
  tie: ['wine','gold','teal','ivory','black'],
};
export const colors = {forest:'#304d41',wine:'#713e45',navy:'#354c68',ivory:'#d5c8a8',charcoal:'#343638',gold:'#c8a366',teal:'#4c8983',black:'#24282b'};
export function normalizeAppearance(value) {
  const a=value&&typeof value==='object'?value:{};
  return Object.fromEntries([...Object.entries(choices).map(([key,values])=>[key,values.includes(a[key])?a[key]:values[0]]),['bow',a.bow===true]]);
}
export function randomAppearance(random=Math.random) {
  return {...Object.fromEntries(Object.entries(choices).map(([key,values])=>[key,values[Math.min(values.length-1,Math.floor(random()*values.length))]])),bow:random()>.5};
}
export const label = value => value.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');

// Anchors stay in the same local coordinate system as the animal's head.
const anchors={wolf:{hat:67,mouth:173},fox:{hat:67,mouth:173},hare:{hat:87,mouth:175},bear:{hat:79,mouth:174},raven:{hat:70,mouth:158},stag:{hat:88,mouth:177}};
export function accessories(skin, appearance) {
  const a=normalizeAppearance(appearance),anchor=anchors[skin]||anchors.wolf;
  const hats={
    none:'',
    fedora:'<path d="M67 0 78-51 105-59 122-48 148-58 165 0Z" fill="#594536"/><path d="M73-14H161V-4H71Z" fill="#a6885b"/><path d="M44 0Q120-14 197 0L185 10H57Z" fill="#786044"/>',
    cowboy:'<path d="M75 0 83-48Q106-61 120-43 141-60 158-47L165 0Z" fill="#9c7848"/><path d="M43-13Q46 8 76-2H165Q191 7 198-14L196 9Q121 29 44 9Z" fill="#c09a62"/><path d="M78-9H164" stroke="#433529" stroke-width="9"/>',
    'top-hat':'<path d="M76-77H164L157-3H83Z" fill="#232e30" stroke="#7e8d80" stroke-width="2"/><path d="M82-20H158V-5H83Z" fill="#873d3e"/><ellipse cx="120" cy="0" rx="75" ry="10" fill="#354345"/>',
    cap:'<path d="M66-2Q70-60 120-58 169-56 171-2Z" fill="#465b6d"/><path d="M120-56V-5M70-5H171" fill="none" stroke="#9da58e" stroke-width="3"/><path d="M119-5H174L206 10Q159 20 119 4Z" fill="#2e3d4c"/>',
    mafia:'<path d="M72-3 80-48 111-57 133-50 159-47 168-3Z" fill="#d2c3a2"/><path d="M77-18H165V-5H74Z" fill="#282e2c"/><path d="M42 1Q120-13 199 1L186 12H55Z" fill="#b7aa8b"/>',
  };
  const eyes={none:'',sunglasses:'<path d="M72 112H106L103 137H80ZM134 112H169L161 137H136Z" fill="#101c20" stroke="#d3ba83" stroke-width="3"/><path d="M106 119H134M66 115H74M169 115H175" stroke="#d3ba83" stroke-width="3"/><path d="m80 117 18 0m42 0h18" stroke="#728a85" stroke-width="2"/>',round:'<g fill="#9bb5b522" stroke="#d4c599" stroke-width="3"><circle cx="91" cy="124" r="18"/><circle cx="150" cy="124" r="18"/><path d="M109 121Q120 115 132 121M64 119H73M168 119H176"/></g>',monocle:'<circle cx="150" cy="124" r="19" fill="#d2e4d922" stroke="#d4b575" stroke-width="4"/><path d="M167 135Q183 170 166 206" fill="none" stroke="#bd9758" stroke-width="2"/>',eyepatch:'<path d="M68 102 175 137" stroke="#272c29" stroke-width="7"/><path d="M132 112Q152 105 170 117L165 138Q146 149 134 133Z" fill="#1b2423" stroke="#857960" stroke-width="2"/>'};
  const mouths={none:'',cigarette:'<path d="M133 0 190 8" stroke="#d4cdb6" stroke-width="8"/><path d="m177 6 14 2" stroke="#c47148" stroke-width="8"/>',cigar:'<path d="m132 0 61 10" stroke="#6c4130" stroke-width="14" stroke-linecap="round"/><path d="m165 5 9 2" stroke="#c4a25f" stroke-width="15"/><path d="m190 9 6 1" stroke="#c56b40" stroke-width="12"/>',toothpick:'<path d="m132 0 62-12" stroke="#d0bd83" stroke-width="3"/>'};
  return `<g class="accessory eyewear" data-eyes="${a.eyes}">${eyes[a.eyes]}</g><g class="accessory headwear" data-hat="${a.hat}" transform="translate(0 ${anchor.hat})" stroke="#18231d" stroke-width="2" stroke-linejoin="round">${hats[a.hat]}</g><g class="accessory mouthwear" data-mouth="${a.mouth}" transform="translate(0 ${anchor.mouth})">${mouths[a.mouth]}</g>`;
}
