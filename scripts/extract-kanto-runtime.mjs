import fs from 'node:fs';
import {createHash} from 'node:crypto';
const input='scratch/r04/reference-extra.json',r=JSON.parse(fs.readFileSync(input));
const catalog=JSON.parse(fs.readFileSync('src/data/kantoChapterReference.json'));
const original=JSON.parse(fs.readFileSync('scratch/r03/reference-runtime.json'));
if(r.chapters.length!==14||r.chapters[1].steps.at(-1).team.at(-1)[1]!==24)throw Error('Unexpected Kanto runtime reference');
const data={schemaVersion:1,source:{...catalog.source,runtimeSnapshot:input,runtimeSha256:createHash('sha256').update(fs.readFileSync(input)).digest('hex')},
  rules:{itemChance:original.config.ITEM_EVENT_CHANCE,stageOdds:original.config.STAGE_ODDS,gym:original.config.GYM_TRAINERS,trainerBonus:original.config.TRAINER_LEVEL_BONUS,trainerEvolveChance:original.config.TRAINER_EVOLVED_CHANCE,trainerItemLevel:original.config.TRAINER_ITEM_EVO_LEVEL,moneyGain:original.config.MONEY_GAIN,
    league:original.config.LEAGUE_TRAINERS,leaderReplayMoney:original.config.LEADER_REPLAY_MONEY,berryBadges:original.config.BERRY_BADGES,
    itemTable:original.story.ITEM_TABLE,stoneSpentMoney:original.config.STONE_SPENT_MONEY,kantoStones:original.config.SHOP.filter(s=>s.id.endsWith('-stone')&&!s.once&&!s.region).map(s=>s.id)},
  classes:r.classes,classTypes:r.story.CLASS_TYPES,names:r.story.TRAINER_NAMES,namesF:r.story.TRAINER_NAMES_F,
  evolutions:Object.fromEntries(Object.entries(r.evolutions).filter(([id])=>+id<=151).map(([id,list])=>[id,list.filter(e=>e.to<=151)])),
  chapters:r.chapters.map(c=>({...c,steps:c.steps.map(s=>({...s,scene:s.scene?{src:'/'+s.scene.src,indoor:!!s.scene.indoor}:null,townScene:s.townScene?{src:'/'+s.townScene.src,indoor:!!s.townScene.indoor}:null}))}))};
for(const c of data.chapters)for(const s of c.steps){
 if(s.scene&&!fs.existsSync('public'+s.scene.src))throw Error('Missing scene '+s.scene.src);
 for(const pool of Object.values(s.pools))for(const mon of pool)if(mon.id<1||mon.id>151||mon.min<1||mon.max>100)throw Error('Invalid encounter '+JSON.stringify(mon));
}
fs.writeFileSync('src/data/kantoRuntimeReference.json',JSON.stringify(data)+'\n');
console.log({chapters:data.chapters.length,routeContexts:data.chapters.reduce((n,c)=>n+c.steps.reduce((sum,s)=>sum+Object.keys(s.pools).length,0),0),source:data.source.runtimeSha256});
