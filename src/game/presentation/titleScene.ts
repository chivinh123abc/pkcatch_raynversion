import BOUNDS from '../../data/spriteBounds.json';
import { getPokemonSpriteUrl } from '../../data/pokemonData';
import TITLE from '../../data/titlePresentation.json';

// Latest region with available regular/shiny box sprites, excluding native legends.
const POOL = TITLE.pool;
const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Decorative DOM/clock/RNG belong to this scene, independently of gameplay. */
export function startTitleScene(field: HTMLElement, count: number, reduced: boolean) {
  let stopped = false;
  const timers = new Map<number, () => void>(), animations = new Set<Animation>(), used = new Set<number>();
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => { timers.delete(id); if (!stopped) fn(); }, ms);
    timers.set(id, () => {}); return id;
  };
  const wait = (ms: number) => new Promise<boolean>(resolve => {
    const id = schedule(() => resolve(true), ms); timers.set(id, () => resolve(false));
  });
  const animate = async (el: HTMLElement, frames: Keyframe[], options: number | KeyframeAnimationOptions) => {
    if (stopped) return false;
    const a = el.animate(frames, options); animations.add(a);
    try { await a.finished; return !stopped; } catch { return false; }
    finally { animations.delete(a); }
  };
  const node = (cls: string, parent = field) => {
    const el = document.createElement('span'); el.className = cls; parent.append(el); return el;
  };
  const burst = (x: number, y: number, amount = 8) => {
    if (stopped) return;
    const ring = node('title-ring'); ring.style.left = `${x}px`; ring.style.top = `${y}px`;
    void animate(ring, [{ scale: '.15', opacity: 1 }, { scale: '2', opacity: 0 }], 550).then(() => ring.remove());
    for (let i = 0; i < amount; i++) {
      const spark = node('title-spark'), angle = Math.PI * 2 * i / amount, distance = random(18, 45);
      spark.style.left = `${x}px`; spark.style.top = `${y}px`;
      void animate(spark, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px),calc(-50% + ${Math.sin(angle) * distance}px)) scale(.2)`, opacity: 0 }], random(320, 440)).then(() => spark.remove());
    }
  };
  const dust = (parent: HTMLElement) => {
    const d = node('title-dust', parent); for (let i = 0; i < 4; i++) node('dust-bit', d);
    schedule(() => d.remove(), 700);
  };
  const spawn = (shiny: boolean, index = 0, falling = false) => {
    if (stopped) return;
    const available = POOL.filter(id => !used.has(id)), id = available[Math.floor(Math.random() * available.length)]; used.add(id);
    const b = BOUNDS[`assets/pokemon/${shiny ? 'shiny/' : ''}${id}.png`] || [0, 0, 68, 56];
    const w = (b[2] - b[0]) * 2, h = (b[3] - b[1]) * 2;
    const walker = node(`title-walker${shiny ? ' ti-shiny' : ''}`);
    walker.dataset.species = String(id); walker.dataset.shiny = String(shiny);
    walker.style.width = `${w}px`; walker.style.height = `${h}px`;
    const shadow = node('title-shadow', walker), body = node('title-body', walker), sprite = node('title-sprite', body);
    sprite.style.width = `${w}px`; sprite.style.height = `${h}px`;
    const img = document.createElement('img'); img.src = getPokemonSpriteUrl(id, shiny); img.alt = ''; img.draggable = false;
    Object.assign(img.style, { width: '136px', height: '112px', left: `${-b[0] * 2}px`, top: `${-b[1] * 2}px` }); sprite.append(img);
    if (shiny) { node('title-glint one', walker); node('title-glint two', walker); }
    let x = random(3, 97), y = random(12, 98);
    const place = () => { walker.style.left = `${x}%`; walker.style.top = `${y}%`; walker.style.zIndex = String(Math.round(y)); };
    place(); if (reduced) return;
    if (falling) {
      void animate(sprite, [{ translate: '0 -420px', scale: '.9 1.15' }, { translate: '0 0', scale: '1.35 .65', offset: .42 }, { translate: '0 -40px', scale: '.9 1.12', offset: .6 }, { translate: '0 0', scale: '1.18 .82', offset: .74 }, { translate: '0 -12px', offset: .85 }, { translate: '0 0', scale: '1' }], { duration: 1300, easing: 'ease-out' });
      schedule(() => dust(walker), 546);
    } else void animate(walker, [{ opacity: 0, scale: '.4' }, { opacity: 1, scale: '1' }], { duration: 400, delay: index * 60, fill: 'backwards', easing: 'cubic-bezier(.2,1.4,.4,1)' });
    const act = () => {
      if (stopped || !walker.isConnected || walker.classList.contains('caught')) return;
      if (document.hidden) { schedule(act, 1000); return; }
      const choice = Math.random();
      if (choice < .6) {
        const nx = Math.min(97, Math.max(3, x + random(-20, 20))), ny = Math.min(98, Math.max(12, y + random(-15, 15)));
        const duration = Math.max(2, Math.round(Math.hypot((nx - x) * 12, (ny - y) * 8) / 40)) * 300;
        body.classList.toggle('flip', nx > x); walker.classList.add('walk'); walker.style.transitionDuration = `${duration}ms`;
        x = nx; y = ny; place(); schedule(() => { walker.classList.remove('walk'); schedule(act, random(800, 3300)); }, duration);
      } else if (choice < .75) {
        walker.classList.add('hop'); schedule(() => { walker.classList.remove('hop'); dust(walker); schedule(act, 500); }, 1300);
      } else schedule(act, random(1500, 4500));
    };
    schedule(act, index * 60 + random(600, 3600));
    walker.dataset.ready = 'true'; shadow.style.setProperty('--shadow-width', `${Math.max(22, w * .6)}px`);
  };
  const capture = async (walker: HTMLElement) => {
    walker.classList.add('caught'); walker.dataset.ready = 'false';
    const area = field.getBoundingClientRect(), rect = walker.getBoundingClientRect();
    const x = rect.left - area.left + rect.width / 2, y = rect.bottom - area.top - 26, ground = y + 14;
    const body = walker.querySelector<HTMLElement>('.title-sprite')!, shadow = walker.querySelector<HTMLElement>('.title-shadow')!;
    const side = Math.floor(random(0, 3)), sx = side === 0 ? -40 : side === 1 ? area.width + 40 : x + random(-150, 150), sy = side === 2 ? area.height + 40 : random(y + 40, Math.max(y + 41, area.height));
    const ball = document.createElement('img'); ball.className = 'title-ball'; ball.src = `/assets/items/${Math.random() < .15 ? 'ultra-ball' : 'poke-ball'}.png`; ball.alt = ''; field.append(ball);
    const t = (bx: number, by: number, angle = 0, scale = '1') => `translate(${bx - 16}px,${by - 16}px) rotate(${angle}deg) scale(${scale})`;
    const direction = sx < x ? 1 : -1, peak = Math.max(-40, Math.min(sy, y) - random(120, 200));
    const curve = Array.from({ length: 25 }, (_, i) => { const k = i / 24, j = 1 - k; return { transform: t(j*j*sx+2*j*k*(sx+x)/2+k*k*x, j*j*sy+2*j*k*peak+k*k*y, direction*720*k) }; });
    if (!await animate(ball, curve, { duration: 650 + Math.hypot(x-sx, y-sy)*.5, easing: 'linear', fill: 'forwards' })) return;
    burst(x, y, 6);
    if (!await animate(ball, [{ transform: t(x,y) }, { transform: t(x,y,0,'1.35,.65') }, { transform: t(x,y) }], { duration: 140, fill: 'forwards' })) return;
    const bx = x - direction*22, high = y - 70;
    void animate(ball, [{ transform: t(x,y) }, { transform: t(bx,high,-direction*40) }], { duration: 320, fill: 'forwards', easing: 'ease-out' });
    if (!await wait(200)) return; ball.classList.add('open');
    const facing = walker.querySelector('.title-body')!.classList.contains('flip') ? -1 : 1;
    if (!await animate(body, [{ scale: '1', filter: 'brightness(1)', translate: '0 0' }, { scale: '1.15 .9', filter: 'brightness(0) invert(1) drop-shadow(0 0 6px #fff)', offset: .3 }, { scale: '0', filter: 'brightness(0) invert(1)', translate: `${(bx-x)*facing}px ${high-y-26}px` }], { duration: 560, fill: 'forwards' })) return;
    shadow.style.opacity = '0'; ball.classList.remove('open');
    if (!await animate(ball, [{ transform: t(bx,high) }, { transform: t(bx,ground,0,'1.3,.7'), offset: .38 }, { transform: t(bx,ground-26), offset: .65 }, { transform: t(bx,ground) }], { duration: 780, fill: 'forwards', easing: 'ease-out' })) return;
    dust(walker);
    for (let i = 0, n = Math.floor(random(1,4)); i < n; i++) {
      if (!await wait(380)) return;
      if (!await animate(ball, [{ transform: t(bx,ground) }, { transform: t(bx-2,ground,8), offset: .15 }, { transform: t(bx+6,ground-2,-32), offset: .45 }, { transform: t(bx-3,ground,16), offset: .75 }, { transform: t(bx,ground) }], { duration: 520, fill: 'forwards', easing: 'ease-in-out' })) return;
    }
    if (!await wait(320)) return; ball.classList.add('click'); burst(bx,ground,10);
    if (!await wait(900)) return;
    if (!await animate(ball, [{ transform: t(bx,ground), opacity: 1 }, { transform: t(bx,ground-6,0,'1.25'), opacity: 1, offset: .3 }, { transform: t(bx,ground-10,180,'0'), opacity: 0 }], { duration: 380, fill: 'forwards' })) return;
    ball.remove(); used.delete(Number(walker.dataset.species)); const shiny = walker.dataset.shiny === 'true'; walker.remove();
    schedule(() => spawn(shiny, 0, true), 500);
  };
  for (let i = 0; i < count; i++) spawn(i === 0, i);
  const catchNext = () => {
    if (!document.hidden && field.querySelectorAll('.title-ball').length < 3) {
      const idle = [...field.querySelectorAll<HTMLElement>('.title-walker[data-ready="true"]:not(.walk):not(.hop):not(.caught)')];
      if (idle.length) void capture(idle[Math.floor(Math.random()*idle.length)]);
    }
    schedule(catchNext, random(600,1500));
  };
  if (!reduced) schedule(catchNext,1200);
  return () => { stopped=true; timers.forEach((resolve,id)=>{clearTimeout(id);resolve();});timers.clear();animations.forEach(a=>a.cancel());animations.clear();field.replaceChildren(); };
}
