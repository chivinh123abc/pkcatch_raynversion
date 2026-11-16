import { CaptureFX } from '../../utils/captureFxEngine';

export class TrainerSequence {
  private animations = new Set<Animation>();
  private delays = new Map<ReturnType<typeof setTimeout>, () => void>();
  cancelled = false;
  async animate(element: Element, frames: Keyframe[], options: number | KeyframeAnimationOptions) {
    if (this.cancelled) throw new Error('Trainer sequence cancelled');
    const animation = element.animate(frames,options);this.animations.add(animation);
    await animation.finished;
  }
  wait(ms: number) { return new Promise<void>((resolve,reject)=>{if(this.cancelled){reject(new Error('Trainer sequence cancelled'));return;}const timer=setTimeout(()=>{this.delays.delete(timer);resolve();},ms);this.delays.set(timer,()=>reject(new Error('Trainer sequence cancelled')));}); }
  cancel() { this.cancelled=true;this.animations.forEach(animation=>animation.cancel());this.animations.clear();for(const [timer,reject] of this.delays){clearTimeout(timer);reject();}this.delays.clear(); }
}

export async function playTrainerIntro(sequence: TrainerSequence, root: HTMLElement, speed: () => number, gym: boolean) {
  const get=(selector:string)=>root.querySelector<HTMLElement>(selector)!;
  const flash=()=>{const element=document.createElement('div');element.className='flash-overlay';element.style.background='#fff';root.appendChild(element);void sequence.animate(element,[{opacity:.8},{opacity:0}],300).then(()=>element.remove()).catch(()=>{});};
  const pix=CaptureFX.pix(root),ease='cubic-bezier(.2,.8,.3,1)';
  if(!gym){
    const left=get('.vs-card.left'),right=get('.vs-card.right'),text=get('.vs-text'),distance=root.clientWidth*.5;
    const slide=(node:HTMLElement,d:number)=>sequence.animate(node,[{transform:`translateX(${d}px) scale(.9,1.1)`,opacity:0},{transform:'translateX(0) scale(1.12,.9)',opacity:1,offset:.7},{transform:'scale(.97,1.03)',offset:.85},{transform:'none',opacity:1}],{duration:380,easing:ease,fill:'both'});
    void sequence.animate(root,[{backgroundColor:'rgba(5,7,12,0)'},{backgroundColor:'rgba(5,7,12,.72)'}],{duration:260,fill:'forwards'}).catch(()=>{});
    await Promise.all([slide(left,-distance),slide(right,distance)]);flash();
    await sequence.animate(text,[{transform:'translate(-50%,-50%) scale(3)',opacity:0},{transform:'translate(-50%,-50%) scale(1.35,.7)',opacity:1,offset:.55},{transform:'translate(-50%,-50%) scale(.9,1.12)',offset:.78},{transform:'translate(-50%,-50%) scale(1)',opacity:1}],{duration:360,easing:'ease-out',fill:'both'});
    pix.rays(root.clientWidth/2,root.clientHeight/2,22,pix.PAL.gold,18);
    await sequence.wait(750/speed());
    void sequence.animate(left,[{transform:'none',opacity:1},{transform:`translateX(${-distance}px)`,opacity:0}],{duration:260,fill:'forwards'}).catch(()=>{});
    void sequence.animate(right,[{transform:'none',opacity:1},{transform:`translateX(${distance}px)`,opacity:0}],{duration:260,fill:'forwards'}).catch(()=>{});
    void sequence.animate(text,[{opacity:1},{opacity:0,transform:'translate(-50%,-50%) scale(.2)'}],{duration:240,fill:'forwards'}).catch(()=>{});
    await sequence.animate(root,[{backgroundColor:'rgba(5,7,12,.72)'},{backgroundColor:'rgba(5,7,12,0)'}],{duration:300,fill:'forwards'});
  }else{
    const top=get('.bi-bar.top'),bottom=get('.bi-bar.bot'),who=get('.bi-who'),portrait=get('.bi-trainer'),info=get('.bi-info');
    void sequence.animate(root,[{backgroundColor:'transparent'},{backgroundColor:'rgba(5,7,12,.7)'}],{duration:300,fill:'forwards'}).catch(()=>{});
    void sequence.animate(top,[{transform:'translateY(-100%)'},{transform:'none'}],{duration:300,easing:ease,fill:'forwards'}).catch(()=>{});
    await sequence.animate(bottom,[{transform:'translateY(100%)'},{transform:'none'}],{duration:300,easing:ease,fill:'forwards'});
    await sequence.animate(who,[{transform:'translateX(60%)',opacity:0},{transform:'translateX(-4%)',opacity:1,offset:.8},{transform:'none',opacity:1}],{duration:480,easing:ease,fill:'forwards'});
    await sequence.wait(220/speed());portrait.classList.remove('sil');flash();
    pix.ring(root.clientWidth*.65,root.clientHeight*.5,100,520,pix.PAL.gold);
    await sequence.animate(info,[{transform:'translateX(-40px)',opacity:0},{transform:'translateX(6px)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:380,easing:ease,fill:'forwards'});
    await sequence.wait(1200/speed());
    for(const [node,direction] of [[top,-1],[bottom,1]] as const)void sequence.animate(node,[{transform:'none'},{transform:`translateY(${direction*100}%)`}],{duration:280,fill:'forwards'}).catch(()=>{});
    await sequence.animate(root,[{opacity:1},{opacity:0}],{duration:300,fill:'forwards'});
  }
}

export async function playTrainerSendOut(sequence: TrainerSequence, arena: HTMLElement, fx: HTMLElement, target: HTMLImageElement, enemy: boolean, speed: () => number) {
  await target.decode().catch(()=>{});await sequence.wait(16);
  if(sequence.cancelled)throw new Error('Trainer sequence cancelled');
  const field=arena.getBoundingClientRect(),rect=target.getBoundingClientRect(),trainer=arena.querySelector('.battle-opponent-trainer img')?.getBoundingClientRect();
  const tx=rect.left-field.left+rect.width/2,ty=rect.top-field.top+rect.height/2;
  const sx=enemy?(trainer?trainer.left-field.left+trainer.width/2:field.width*.92):-18,sy=enemy?(trainer?trainer.top-field.top+trainer.height*.45:field.height*.5):field.height*.65;
  const ball=document.createElement('img');ball.src='/assets/items/poke-ball.png';ball.alt='';Object.assign(ball.style,{position:'absolute',left:'0',top:'0',width:'32px',height:'32px',zIndex:'30',imageRendering:'pixelated'});fx.appendChild(ball);
  const frames=Array.from({length:13},(_,i)=>{const t=i/12,u=1-t;return{transform:`translate(${u*u*sx+2*u*t*(sx+tx)/2+t*t*tx-16}px,${u*u*sy+2*u*t*(Math.min(sy,ty)-70)+t*t*ty-16}px) rotate(${-720*t}deg)`};});
  await sequence.animate(ball,frames,{duration:420/speed(),easing:'ease-in'});
  await sequence.animate(ball,[frames[12],{transform:`translate(${tx-16}px,${ty-16}px) scale(1.5)`,filter:'brightness(2)'}],{duration:90/speed(),fill:'forwards'});ball.remove();
  const duration=380/speed(),pix=CaptureFX.pix(fx);pix.ring(tx,ty,70,duration,pix.PAL.ball);pix.burst(tx,ty,14,2.2,{pal:pix.PAL.ball,round:true,grav:.04});
  target.closest<HTMLElement>('.battle-mon')!.style.opacity='';target.style.opacity='';target.style.visibility='visible';const mirror=enemy?'':'scaleX(-1) ';
  await sequence.animate(target,[{transform:mirror+'scale(.6,1.3)',filter:'brightness(0) invert(1)'},{transform:mirror+'scale(1.25,.8)',filter:'brightness(0) invert(1)',offset:.4},{transform:mirror+'scale(.94,1.06)',offset:.65},{transform:mirror+'scale(1)',filter:'none'}],{duration,easing:'ease-out'});
}
