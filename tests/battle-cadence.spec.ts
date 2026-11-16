import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

for (const speed of [1,2,3]) for (const resisted of [false,true]) {
  test(`each attack keeps native recovery and queue delay at x${speed}, resisted=${resisted}`, async ({page}) => {
    await page.goto('/',{waitUntil:'domcontentloaded'});
    await page.locator('.battle-stage').waitFor();
    const result=await page.evaluate(async ({speed,resisted})=>{
      const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/store/useGameStore.ts'))!.name;
      const {useGameStore:store}=await import(/* @vite-ignore */url);
      store.getState().loadStepNode(1);
      const base=store.getState().party[0],enemy=store.getState().enemy;
      store.setState({starterChosen:true,isBattling:false,autoCatch:false,gameSpeed:speed,activePartyIndex:0,
        party:[{...base,uid:'cadence-ally',speciesId:19,level:1,currentHp:999,maxHp:999,stats:{...base.stats,speed:999}}],
        enemy:{...enemy,uid:'cadence-enemy',speciesId:resisted?74:19,level:1,currentHp:999,maxHp:999,stats:{...enemy.stats,speed:1}}});
      store.runtime.random=()=>.5;
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      return await new Promise<{speed:number;resisted:boolean;contactMs:number;nextAttackMs:number;gapMs:number;move:string}>(resolve=>{
        let start=0,contact=0,key=0,move='';
        const unsubscribe=store.subscribe((state:any)=>{
          const now=performance.now();
          if(state.combatEffect&&!key){key=state.combatEffect.key;start=now;move=state.combatEffect.moveKey;}
          if(!contact&&state.enemy.currentHp<999)contact=now;
          if(state.combatEffect&&key&&state.combatEffect.key!==key){clearInterval(poll);unsubscribe();resolve({speed,resisted,contactMs:contact-start,nextAttackMs:now-start,gapMs:now-contact,move});}
        });
        // Frequent polling exposes an accidentally unlocked recovery window.
        const poll=setInterval(()=>store.getState().tickCombat(),10);
        store.getState().tickCombat();
      });
    },{speed,resisted});
    const output='docs/battle-cadence-2026-11-16';await fs.mkdir(output,{recursive:true});
    await fs.writeFile(`${output}/${process.env.CADENCE_BASELINE?'before':'after'}-x${speed}-${resisted?'resisted':'normal'}.json`,JSON.stringify(result,null,2));
    expect(result.move).toBe('tackle');
    if(!process.env.CADENCE_BASELINE){
      const pace=speed===3?2.5:speed;
      const minimum=(260+325+(resisted?450:0))/pace;
      expect(result.gapMs).toBeGreaterThanOrEqual(minimum-25);
      expect(result.gapMs).toBeLessThan(minimum+250);
    }
  });
}
