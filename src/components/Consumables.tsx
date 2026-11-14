import { useGameStore } from '../store/useGameStore';
import { getItemSpriteUrl } from '../data/pokemonData';

export function Consumables() {
  const { berries, berryBuffs, balls, useBerry } = useGameStore();
  const duration = (seconds: number) => {
    const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
  };
  const items = [
    {key:'razz' as const,name:'Razz Berry',sprite:'razz-berry',seconds:berryBuffs.greatBall},
    {key:'nanab' as const,name:'Nanab Berry',sprite:'nanab-berry',seconds:berryBuffs.nanab},
    {key:'pinap' as const,name:'Pinap Berry',sprite:'pinap-berry',seconds:berryBuffs.pinap},
    {key:'goldenRazz' as const,name:'Golden Razz Berry',sprite:'golden-razz-berry',seconds:berryBuffs.ultraBall},
  ];
  return <div className="consumables-panel bg-[#1c2030]">
    <div className="consumables-heading"><span>Consumables <small title="Use a berry to activate its boost">?</small></span><button title={`Bag: ${balls.greatball} Great Balls, ${balls.ultraball} Ultra Balls, ${balls.masterball} Master Balls`}>BAG</button></div>
    <div className="consumables-grid">
      {items.map(item=><button key={item.key} className={`consumable-slot ${item.seconds > 0 ? 'boosted' : ''}`} onClick={()=>useBerry(item.key)} disabled={berries[item.key]<=0} aria-label={`Use ${item.name}`} title={`${item.name} ×${berries[item.key]}`}>
        <img src={getItemSpriteUrl(item.sprite)} alt="" className="pixel-art" />
        {item.seconds > 0 && <span className="consumable-timer">{duration(item.seconds)}</span>}
        <span className="consumable-count">×{berries[item.key]}</span>
      </button>)}
    </div>
  </div>;
}
