import bounds from '../../data/spriteBounds.json';

/** Native UI.fitScale(id, 96) / UI.tileScale(id, 24, 34) for the compact team. */
export function miniTeamSpriteScale(id:number,mobile:boolean) {
 const box=bounds[`assets/pokemon/${id}.png`];
 const extent=box?Math.max(box[2]-box[0],box[3]-box[1]):mobile?30:40;
 return mobile?Math.min(34,Math.max(24,extent*1.3))/extent:extent*2<=96?2:1;
}
