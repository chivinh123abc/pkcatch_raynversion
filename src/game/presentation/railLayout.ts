/** Native Ct(): size six possible slots, then vertically center the rows actually present. */
export function railLayout(width: number, height: number, count: number, viewportWidth: number) {
  const gap = viewportWidth <= 640 ? 3 : 5;
  const top = width < 500 ? 32 : 38;
  const slots = Math.max(6,count), rows = Math.max(1,count), stageHeight = Math.round(height);
  const tile = Math.max(28,Math.min(60,Math.floor((stageHeight-20-top-gap*(slots-1))/slots)));
  const padding = Math.max(top,(stageHeight-(rows*tile+(rows-1)*gap))/2-10);
  return { tile,padding,gap };
}
