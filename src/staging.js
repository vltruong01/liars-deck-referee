// Percentages in the available scene: x, y, width, height. One map per group size.
const maps={
  4:[['rear',27,0,21,65],['rear',52,0,21,65],['left',1,29,24,68],['right',75,29,24,68]],
  3:[['rear',39.5,0,21,65],['left',1,29,24,68],['right',75,29,24,68]],
  2:[['left',8,18,25,78],['right',67,18,25,78]],
};
export function seatPosition(count,index){
  const [position,x,y,w,h]=maps[count][index];
  return {position,style:`--seat-x:${x}%;--seat-y:${y}%;--seat-w:${w}%;--seat-h:${h}%`};
}
