import { useEffect, useRef } from 'react';
import { startTitleScene } from '../game/presentation/titleScene';
import '../styles/title-scene.css';

export function TitleField() {
  const field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mobile=matchMedia('(max-width: 640px)'), motion=matchMedia('(prefers-reduced-motion: reduce)');
    let stop=()=>{};
    const start=()=>{stop();if(field.current)stop=startTitleScene(field.current,mobile.matches?14:30,motion.matches);};
    start();mobile.addEventListener('change',start);motion.addEventListener('change',start);
    return()=>{stop();mobile.removeEventListener('change',start);motion.removeEventListener('change',start);};
  },[]);
  return <div className="ti-field" aria-hidden="true" ref={field}/>;
}
