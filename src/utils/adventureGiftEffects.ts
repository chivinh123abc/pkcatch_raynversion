import {getItemSpriteUrl,getPokemonArtUrl,getPokemonSpecies,getPokemonSpriteUrl} from '../data/pokemonData';
import sprites from '../data/showdownSprites.json';
import translations from '../data/giftTranslations.json';
import {TYPE_COLORS} from '../data/typeChart';
import type {AdventureGift} from '../types/game';
import {nativeFxRuntime} from './nativeFxRuntime';
import {createLinkFx} from './giftLinkFxEngine';
import {createItemFX} from './giftItemFXEngine';
import {giftSpriteGlow} from './giftSpriteGlow';

const esc=(text:unknown)=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const t=(key:string,values:Record<string,unknown>={})=>(translations[key]||key).replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??`{${name}}`));
const types=(id:number)=>getPokemonSpecies(id).types.map(type=>`<span class="type sm" style="--tc:${TYPE_COLORS[type]};background:var(--tc)">${type}</span>`).join(' ');
const itemName=(id:string)=>id.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');

/** One presentation owns its roots, timers, RAFs and input listeners. Speed is captured by the caller. */
export function adventureGiftEffects(signal:AbortSignal) {
 const roots=new Set<HTMLElement>(),timers=new Set<number>(),frames=new Set<number>(),cleanups=new Set<()=>void>();
 const active=()=>{if(signal.aborted)throw new DOMException('Gift presentation cancelled','AbortError');};
 const Ut=(callback:()=>void,ms:number)=>{active();const id=window.setTimeout(()=>{timers.delete(id);if(!signal.aborted)callback();},ms);timers.add(id);return id;};
 const nn=(callback:FrameRequestCallback)=>{if(signal.aborted)return 0;const id=requestAnimationFrame(time=>{frames.delete(id);if(!signal.aborted)callback(time);});frames.add(id);return id;};
 const decorate=(root:HTMLElement)=>{
  roots.add(root);root.classList.add('native-gift');
  const shell=document.querySelector<HTMLElement>('.game-shell');
  if(shell){const style=getComputedStyle(shell);for(let i=0;i<style.length;i++){const key=style[i];if(key.startsWith('--'))root.style.setProperty(key,style.getPropertyValue(key));}}
  return root;
 };
 const artImg=(id:number,shiny=false,{still=false,k=2,fit=128}={})=>{
  const meta=sprites[id]?.[shiny?'gen5ani-shiny':'gen5ani'];
  const width=meta?.width||68,height=meta?.height||56,scale=Math.min(k,fit/Math.max(width,height));
  return `<img class="art" data-art-id="${id}" data-shiny="${shiny?'1':'0'}" data-still="${still?'1':'0'}" src="${esc(getPokemonArtUrl(id,shiny))}" alt="" style="width:${width*scale}px;height:${height*scale}px;image-rendering:pixelated">`;
 };
 const setArtAnim=(img:HTMLImageElement,id:number,shiny:boolean,animate:boolean)=>{
  img.dataset.still=animate?'0':'1';
  if(animate){img.src=getPokemonArtUrl(id,shiny);return;}
  const freeze=()=>{if(signal.aborted||img.dataset.still!=='1'||!img.naturalWidth||img.src.startsWith('data:'))return;const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d')?.drawImage(img,0,0);img.src=canvas.toDataURL();};
  if(img.complete)freeze();else img.addEventListener('load',freeze,{once:true});
 };
 const observer=new MutationObserver(()=>{for(const root of roots)for(const img of root.querySelectorAll<HTMLImageElement>('img[data-still="1"]'))if(!img.src.startsWith('data:'))setArtAnim(img,Number(img.dataset.artId),img.dataset.shiny==='1',false);});
 const skippable=(host:HTMLElement)=>{
  const button=document.createElement('button');button.className='btn ghost fx-skip';button.textContent=t('Passer')+' ⏭';host.appendChild(button);
  const waiters=new Set<()=>void>();
  const control={skipped:false,hide:()=>{button.dataset.gone='1';button.disabled=true;},tap:(node:HTMLElement,ms?:number)=>{control.hide();if(control.skipped)return Promise.resolve();return new Promise<void>(resolve=>{const done=()=>{node.removeEventListener('pointerdown',done);waiters.delete(done);resolve();};waiters.add(done);node.addEventListener('pointerdown',done,{once:true});cleanups.add(()=>node.removeEventListener('pointerdown',done));if(ms)Ut(done,ms);});},end:()=>{document.removeEventListener('keydown',key,true);button.remove();}};
  button.onpointerdown=event=>event.stopPropagation();button.onclick=event=>{event.stopPropagation();control.skipped=true;control.hide();waiters.forEach(done=>done());};
  const key=(event:KeyboardEvent)=>{if(event.key!=='Escape'||!button.isConnected)return;event.preventDefault();event.stopImmediatePropagation();if(button.dataset.gone)waiters.forEach(done=>done());else button.click();};
  document.addEventListener('keydown',key,true);cleanups.add(control.end);return control;
 };
 const h=(html:string)=>{active();const template=document.createElement('template');template.innerHTML=html.trim();const node=template.content.firstElementChild as HTMLElement;if(node.matches('.rc-fx,.hatch-fx')){decorate(node);observer.observe(node,{childList:true,subtree:true});}return node;};
 const a={UI:{...nativeFxRuntime.UI,h,esc,skippable,artImg,types,setArtAnim,spriteGlow:giftSpriteGlow,artSrc:getPokemonArtUrl,monSrc:getPokemonSpriteUrl},CaptureFX:nativeFxRuntime.CaptureFX,Sfx:nativeFxRuntime.Sfx,Game:{DEX:Object.fromEntries(Array.from({length:151},(_,i)=>[i+1,getPokemonSpecies(i+1)]))},I18n:{lang:'en'}};
 const context={a,e:t,Ut,nn,Ys:performance};
 const cleanup=()=>{timers.forEach(clearTimeout);frames.forEach(cancelAnimationFrame);cleanups.forEach(fn=>fn());observer.disconnect();for(const root of roots){root.getAnimations({subtree:true}).forEach(animation=>animation.cancel());root.remove();}roots.clear();};
 signal.addEventListener('abort',cleanup,{once:true});
 return {
  async play(gift:AdventureGift,speed:number):Promise<number|string>{
   active();
   if(gift.items?.length){
    const arena=document.querySelector<HTMLElement>('.battle-stage');if(!arena)throw Error('Gift arena is not mounted');
    const engine: any=createItemFX(context),promise=engine.choose(arena,{ask:gift.items.every(item=>/fossil/.test(item))?'Pick a fossil!':'Pick an item!',items:gift.items.map(id=>({id,name:itemName(id),src:getItemSpriteUrl(id)})),speed});
    const root=arena.querySelector<HTMLElement>('.item-choice');if(root)decorate(root);
    const choice=await promise;active();return choice;
   }
   const engine: any=createLinkFx(context),choices=gift.choices||[];
   if(choices.length>1){const choice=await engine.choose({title:esc(gift.text),choices,level:gift.level,onEscape:null});active();return choice;}
   const id=choices[0],stage=engine.open({title:esc(gift.text)});
   try{
    await engine.enter(stage);active();await engine.land(stage,{cable:false});active();await engine.reveal(stage,artImg(id,false,{k:2,fit:160}),false);active();stage.skip.hide();await engine.say(stage,t('Tu reçois <b>{name}</b> Nv. {n} !',{name:esc(getPokemonSpecies(id).name),n:gift.level}));await engine.finish(stage);active();
   }finally{if(!signal.aborted)await engine.close(stage);}
   return id;
  },
  dispose(){signal.removeEventListener('abort',cleanup);cleanup();},
 };
}
