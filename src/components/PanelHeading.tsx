import { useState } from 'react';
export function PanelInfo({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const place = (element: HTMLElement) => {
    const box = element.getBoundingClientRect();
    setPosition({ left: Math.max(12, Math.min(box.left, window.innerWidth - 292)), top: Math.max(12, Math.min(box.bottom + 8, window.innerHeight - 150)) });
  };
  return <button type="button" className={`info-tip${open ? ' open' : ''}`} aria-label={`About ${title}`} aria-expanded={open} onMouseEnter={event => place(event.currentTarget)} onFocus={event => place(event.currentTarget)} onBlur={() => setOpen(false)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }} onClick={event => {
    const box = event.currentTarget.getBoundingClientRect(); setPosition({ left: Math.max(12, Math.min(box.left, window.innerWidth - 292)), top: Math.min(box.bottom + 8, window.innerHeight - 150) }); setOpen(!open);
  }}>?<span className="info-tip-box" role="tooltip" style={{ left: position.left, top: position.top }}><b>{title}</b><p>{text}</p></span></button>;
}
