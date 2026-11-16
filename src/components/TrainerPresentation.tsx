import { RefObject, useLayoutEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ALL_CHAPTERS, DEFAULT_CHAPTER, chapterIcon } from '../data/chaptersData';
import { createEffectLayer } from '../game/presentation/effectLayer';
import { TrainerSequence, playTrainerIntro, playTrainerSendOut } from '../game/presentation/trainerFx';
import { gameplaySpeed } from '../game/domain/presentationTiming';

const gymColors:Record<string,string>={brock:'#9a8b6a',misty:'#4aa3df',ltsurge:'#f7d02c',erika:'#7ac74c',koga:'#a33ea1',sabrina:'#f95587',blaine:'#ee8130',giovanni:'#e2bf65'};

export function TrainerPresentation({arena,fx}: {arena:RefObject<HTMLDivElement>;fx:RefObject<HTMLDivElement>}) {
  const {trainerPresentation:request,activeTrainer,currentChapterId,trainerName,trainerSprite,finishTrainerIntro,finishTrainerPresentation}=useGameStore();
  const root=useRef<HTMLDivElement>(null),chapter=ALL_CHAPTERS.find(c=>c.id===currentChapterId)||DEFAULT_CHAPTER;
  useLayoutEffect(()=>{
    if(!request||!arena.current||!fx.current)return;
    const sequence=new TrainerSequence(),layer=createEffectLayer(fx.current),field=arena.current;let complete=false;
    const targets=[...field.querySelectorAll<HTMLImageElement>('.battle-sprite')];
    const speed=()=>gameplaySpeed(useGameStore.getState().gameSpeed);
    if(request.stage==='sendout')for(const target of targets)if(request.sendAlly||target.closest('.enemy')){target.style.opacity='0';target.closest<HTMLElement>('.battle-mon')!.style.opacity='0';}
    const run=async()=>{
      if(request.stage==='intro'&&root.current){
        const portrait=root.current.querySelector<HTMLImageElement>('.bi-trainer');
        if(portrait){await portrait.decode().catch(()=>{});const h=portrait.naturalHeight||59,k=Math.max(2,Math.floor(field.clientHeight*.6/h));portrait.style.width=`${portrait.naturalWidth*k}px`;portrait.style.height=`${h*k}px`;root.current.querySelector<HTMLElement>('.bi-who')!.style.bottom=`${Math.max(0,(field.clientHeight-h*k)/2)}px`;}
        await playTrainerIntro(sequence,root.current,speed,request.kind==='gym');
        if(!sequence.cancelled)finishTrainerIntro(request.key);
      }else{
        const enemy=field.querySelector<HTMLImageElement>('.enemy .battle-sprite'),ally=field.querySelector<HTMLImageElement>('.ally .battle-sprite');
        const trainer=field.querySelector<HTMLElement>('.battle-opponent-trainer');
        if(trainer&&request.enterTrainer)await sequence.animate(trainer,[{transform:'translateX(140%)',opacity:0},{transform:'translateX(-6%) scale(1.05,.95)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:520/speed(),easing:'cubic-bezier(.2,.8,.3,1)'});
        if(enemy)await playTrainerSendOut(sequence,field,layer.element,enemy,true,speed);
        if(request.sendAlly&&ally)await playTrainerSendOut(sequence,field,layer.element,ally,false,speed);
        complete=true;if(!sequence.cancelled)finishTrainerPresentation(request.key);
      }
    };
    void run().catch(error=>{if(!sequence.cancelled){console.warn('Trainer presentation failed:',error);finishTrainerPresentation(request.key);}});
    return()=>{sequence.cancel();for(const target of targets){target.style.opacity='';target.style.visibility='';const mon=target.closest<HTMLElement>('.battle-mon');if(mon)mon.style.opacity='';}if(complete)setTimeout(()=>layer.dispose(),700);else layer.dispose();};
  },[request,finishTrainerIntro,finishTrainerPresentation]);
  if(!request||request.stage!=='intro'||!activeTrainer)return null;
  const face=(sprite:string)=><span className="tr-face vs-face" data-frame="base"><span className="tr-win"><img src={`/assets/trainers/still/${sprite}.png`} alt="" /></span><i className="fr" /></span>;
  return request.kind==='gym'?<div ref={root} className="boss-intro" data-trainer-intro="gym" style={{'--c':chapter.themeColor||gymColors[activeTrainer.sprite]||'#6b5bd6'} as React.CSSProperties}>
    <i className="bi-bar top"/><i className="bi-bar bot"/><div className="bi-who"><img className="bi-trainer sil" src={`/assets/trainers/${activeTrainer.sprite}.png`} alt={activeTrainer.name}/></div>
    <div className="bi-info"><small>{chapter.chapterNumber===14?'Champion':chapter.chapterNumber>=10?'Elite Four':chapter.chapterNumber===9?'Rival':'Gym Leader'}</small><b>{chapter.leaderName}</b><span className="bi-tags"><img src={chapterIcon(chapter)} alt=""/><em>{chapter.leaderType}</em><em>{chapter.badgeName}</em></span></div>
  </div>:<div ref={root} className="vs-intro" data-trainer-intro="trainer"><div className="vs-card left">{face(trainerSprite)}<span className="vs-name">{trainerName}</span></div><div className="vs-card right">{face(activeTrainer.sprite)}<span className="vs-name">{activeTrainer.name}</span></div><div className="vs-text">VS</div></div>;
}
