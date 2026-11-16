import reference from '../../data/kantoRuntimeReference.json';

/** Payout multipliers from native Adventure's trainer/gym resolution. */
export function kantoTrainerPayout(base: number, chapter: number, leader: boolean, replay: boolean, leagueDone: boolean): number {
  const league=chapter>=10;
  const multiplier=leader
    ? (league?reference.rules.league.reward:1)*(replay?(league&&!leagueDone?reference.rules.league.replayMoney:reference.rules.leaderReplayMoney):1)
    : league?(leagueDone?reference.rules.league.moneyWon:reference.rules.league.money):1;
  return Math.round(base*reference.rules.moneyGain*multiplier);
}
type LootEntry={item?:string;n?:number;money?:number[];stone?:boolean};
export interface ChapterLoot {item?:string;amount:number;money?:number;discoveredStone?:string;}
/** Native berry gates depend on chapter ordinal within Kanto, not inventory/badges owned. */
export function chapterLootTable(chapter: number) {
  const before=Math.min(8,Math.max(0,chapter-1));
  return (reference.rules.itemTable as unknown as [number,LootEntry][]).map(([weight,entry])=>({
    ...entry,w:before<((reference.rules.berryBadges as Record<string,number>)[entry.item||'']||0)?0:weight,
  }));
}
export function rollChapterLoot(chapter: number, stonesSeen: string[], random:()=>number): ChapterLoot {
  const table=chapterLootTable(chapter),total=table.reduce((sum,e)=>sum+e.w,0);
  let roll=random()*total,entry=table[table.length-1];
  for(const candidate of table)if((roll-=candidate.w)<0){entry=candidate;break;}
  const integer=(min:number,max:number)=>min+Math.floor(random()*(max-min+1));
  if(entry.money)return {money:Math.round(integer(entry.money[0],entry.money[1])*reference.rules.moneyGain),amount:1};
  if(entry.stone){
    const stones=reference.rules.kantoStones,item=stones[Math.floor(random()*stones.length)];
    if(stonesSeen.includes(item))return {money:Math.round(integer(reference.rules.stoneSpentMoney[0],reference.rules.stoneSpentMoney[1])*reference.rules.moneyGain),amount:1};
    return {item,amount:1,discoveredStone:item};
  }
  return {item:entry.item,amount:entry.n||1};
}
export const kantoLeagueXp = reference.rules.league.xp.kanto;
