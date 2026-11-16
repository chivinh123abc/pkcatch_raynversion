import reference from '../../data/kantoLevelCaps.json';

const badges=['boulder-badge','cascade-badge','thunder-badge','rainbow-badge','soul-badge','marsh-badge','volcano-badge','earth-badge'];
/** Native adv.unlocked is the furthest completed main chapter, independent of replay selection. */
export function currentLevelCap(state:{badges?:string[];completedChapters?:string[]}) {
 let unlocked=0;
 for(let i=0;i<reference.caps.length;i++)if(state.completedChapters?.includes(`kanto-${i+1}`)||i<badges.length&&state.badges?.includes(badges[i]))unlocked=i+1;
 return Math.min(reference.max,reference.caps[unlocked]??reference.leagueDone);
}
