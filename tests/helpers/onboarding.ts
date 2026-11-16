import {expect,Page} from '@playwright/test';
export async function reachStarter(page:Page,avatar='Red',name='Audit'){
 await page.getByRole('button',{name:'New game',exact:true}).click();
 await page.getByRole('button',{name:'Skip ⏭',exact:true}).click();
 await page.getByRole('button',{name:avatar,exact:true}).click();
 await page.getByRole('button',{name:'Confirm',exact:true}).click();
 await page.getByRole('textbox',{name:'Your name'}).fill(name);
 await page.getByRole('button',{name:'Confirm',exact:true}).click();
 for(let line=0;line<2;line++){
  await page.getByRole('button',{name:'Next dialogue'}).click();
  await page.getByRole('button',{name:'Next dialogue'}).click();
 }
 await expect(page.getByRole('dialog',{name:'Choose your first Pokémon'})).toBeVisible();
}
export async function chooseStarter(page:Page,name='Squirtle'){
 await reachStarter(page);
 await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:`Choose ${name}`,exact:true}).click();
 await expect(page.locator('.onboarding-root')).toHaveCount(0);
}
