import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
const sources=[];
for(let id=1;id<=151;id++)for(const prefix of ['', 'shiny/']){
 const key=`assets/pokemon/${prefix}${id}.png`,bytes=await fs.readFile('public/'+key);
 sources.push({key,url:'data:image/png;base64,'+bytes.toString('base64')});
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 const bounds=await page.evaluate(async sources=>{
  const result={};
  await Promise.all(sources.map(async({key,url})=>{
   const image=new Image();image.src=url;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
   const context=canvas.getContext('2d');context.drawImage(image,0,0);const pixels=context.getImageData(0,0,image.width,image.height).data;
   let x0=image.width,y0=image.height,x1=-1,y1=-1;
   for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>10){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
   if(x1<0)throw Error('Empty sprite '+key);
   result[key]=[x0,y0,x1+1,y1+1];
  }));return Object.fromEntries(Object.entries(result).sort(([a],[b])=>a.localeCompare(b)));
 },sources);
 const declared=JSON.parse(await fs.readFile('src/data/spriteBounds.json','utf8'));
 const differences=Object.entries(bounds).filter(([key,value])=>JSON.stringify(value)!==JSON.stringify(declared[key])).map(([key,actual])=>({key,actual,declared:declared[key]}));
 await fs.mkdir('docs/sprite-evidence',{recursive:true});
 await fs.writeFile('docs/sprite-evidence/box-bounds-check.json',JSON.stringify({inspected:Object.keys(bounds).length,alphaThreshold:10,differences},null,2)+'\n');
 console.log(`Measured actual alpha bounds of ${Object.keys(bounds).length} local box sprites.`);
}finally{await browser.close();}
