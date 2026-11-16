import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getItemSpriteUrl } from '../data/pokemonData';
export const inventoryName = (key: string) => ({ pokeball:'Poké Ball',greatball:'Great Ball',ultraball:'Ultra Ball',masterball:'Master Ball','exp-candy-s':'Exp. Candy S','exp-candy-m':'Exp. Candy M','old-amber':'Old Amber','berry-oran':'Oran Berry','berry-pecha':'Pecha Berry','berry-sitrus':'Sitrus Berry' })[key] || key.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
export function InventoryDialog({ entries, onClose }: { entries: [string, number][]; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null), close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    const background = [...(document.querySelector('.game-shell')?.children || [])].filter(element => !element.classList.contains('replica-modal-backdrop')).map(element => ({ element: element as HTMLElement, inert: (element as HTMLElement).inert }));
    background.forEach(({ element }) => { element.inert = true; }); document.body.style.overflow = 'hidden'; dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key === 'Tab') { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('button')?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { background.forEach(({ element,inert }) => { element.inert = inert; }); document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, []);
  return createPortal(<div className="replica-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal dexcard-modal inventory-dialog battle-panels" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="inventory-heading" tabIndex={-1}>
      <header><h2 id="inventory-heading">Bag</h2><span>{entries.length} items</span><button className="dc-x" aria-label="Close Bag" onClick={onClose}>✕</button></header>
      <div className="inventory-body">{entries.length ? <div className="bag-grid">{entries.map(([key,quantity]) => <div className="bag-cell inventory-cell" key={key} title={`${inventoryName(key)} ×${quantity}`}><img src={getItemSpriteUrl(key)} alt={inventoryName(key)} /><span className="bag-qty">×{quantity}</span><span className="inventory-name">{inventoryName(key)}</span></div>)}</div> : <p>Your Bag is empty.</p>}</div>
    </div>
  </div>, document.querySelector('.game-shell') || document.body);
}
