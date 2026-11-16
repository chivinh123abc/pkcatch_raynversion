import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemSpriteUrl } from '../data/pokemonData';
import { PanelInfo } from './PanelHeading';
export function Consumables({ onOpenBag, hasItems }: { onOpenBag: () => void; hasItems: boolean }) {
  const { berries, berryBuffs, useBerry } = useGameStore();
  const [folded, setFolded] = useState(false);
  const duration = (seconds: number) => {
    const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
  };
  const entries = [
    { key:'razz' as const,name:'Razz Berry',sprite:'razz-berry',seconds:berryBuffs.greatBall },
    { key:'nanab' as const,name:'Nanab Berry',sprite:'nanab-berry',seconds:berryBuffs.nanab },
    { key:'pinap' as const,name:'Pinap Berry',sprite:'pinap-berry',seconds:berryBuffs.pinap },
    { key:'goldenRazz' as const,name:'Golden Razz Berry',sprite:'golden-razz-berry',seconds:berryBuffs.ultraBall },
  ].filter(entry => berries[entry.key] > 0);
  if (!entries.length && !hasItems) return null;
  return <section className={`panel-group${folded ? ' folded' : ''}`} aria-label="Consumables"><div className="zone-box bag-box">
    <div className="zone-head">
      <button className="panel-fold-title" onClick={() => setFolded(!folded)} aria-expanded={!folded} aria-controls="consumables-content"><b>Consumables</b></button>
      <PanelInfo title="Consumables" text="Tap a Berry to activate its boost. Active boosts show their remaining time. Other items are stored in the Bag." />
      {hasItems && <button className="btn outline small bag-open" onClick={onOpenBag}>Bag</button>}
      <button className="panel-fold" aria-label={folded ? 'Expand Consumables' : 'Collapse Consumables'} onClick={() => setFolded(!folded)} aria-expanded={!folded}>{folded ? '▸' : '▾'}</button>
    </div>
    <div id="consumables-content" hidden={folded}>{entries.length ? <div className="bag-grid">{entries.map(entry => <button key={entry.key} className={`bag-cell berry${entry.seconds > 0 ? ' on' : ''}`} onClick={() => useBerry(entry.key)} aria-label={`Use ${entry.name}`} title={`${entry.name} ×${berries[entry.key]}`}>
      <img src={getItemSpriteUrl(entry.sprite)} alt="" />{entry.seconds > 0 && <span className="bag-timer">{duration(entry.seconds)}</span>}<span className="bag-qty">×{berries[entry.key]}</span>
    </button>)}</div> : <p className="bag-none">No Berries for now.</p>}</div>
  </div></section>;
}
