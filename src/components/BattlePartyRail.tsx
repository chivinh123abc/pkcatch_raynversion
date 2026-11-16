import { useGameStore } from '../store/useGameStore';
import { getPokemonSpecies } from '../data/pokemonData';
import { PanelSprite } from './PanelSprite';

const status = { sleep: ['SLP','#9aa3b5'], freeze: ['FRZ','#6ad0f0'], paralysis: ['PAR','#e8c41c'], burn: ['BRN','#f0703a'], poison: ['PSN','#b65ad6'] };
export function BattlePartyRail({ tile }: { tile: number }) {
  const { party, activePartyIndex, setActivePartyIndex, movePartyMember, sidebarExpPopups, isCatchSequenceActive } = useGameStore();
  const reorder = (uid: string, index: number) => {
    const from = useGameStore.getState().party.findIndex(mon => mon.uid === uid);
    if (from < 0 || from === index) return;
    const direction = from < index ? 1 : -1;
    for (let i = from; i !== index; i += direction) if (!movePartyMember(uid, direction)) break;
  };
  return <div className="battle-team-rail team-rail" aria-label="Battle send-out order">
    {party.map((mon, index) => {
      const name = getPokemonSpecies(mon.speciesId).name, ko = mon.currentHp <= 0;
      const hp = Math.max(0, Math.min(100, mon.currentHp / mon.maxHp * 100));
      const xp = mon.level >= 100 ? 100 : Math.max(0, Math.min(100, mon.exp / mon.expToNextLevel * 100));
      const tag = mon.status ? status[mon.status] : mon.confusedTurns ? ['CNF','#ff8fd0'] : null;
      const popup = sidebarExpPopups?.[mon.uid];
      return <div className="rail-entry" key={mon.uid} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); reorder(event.dataTransfer.getData('text/plain'), index); }}>
        <button className={`tr-row${index === activePartyIndex ? ' active acting' : ''}${ko ? ' ko' : ''}`} draggable onDragStart={event => event.dataTransfer.setData('text/plain', mon.uid)}
          onClick={() => setActivePartyIndex(index)} aria-label={`${name}, level ${mon.level}, ${ko ? 'fainted' : `${mon.currentHp} of ${mon.maxHp} HP`}`} aria-pressed={index === activePartyIndex} aria-disabled={ko}
          title={`${name} — Lv. ${mon.level} · HP ${mon.currentHp}/${mon.maxHp} · EXP ${mon.level >= 100 ? 'MAX' : `${mon.exp}/${mon.expToNextLevel}`} · tap to send out, drag to reorder`}>
          <PanelSprite id={mon.speciesId} shiny={mon.isShiny} rail tile={tile} />
          {mon.isShiny && <i className="rail-shiny" aria-label="Shiny">✦</i>}
          {tag && <span className="tr-st" style={{ background: tag[1] }}>{tag[0]}</span>}
          <span className="tr-lv">Lv. {mon.level}</span>
          <div className="tr-hp" role="progressbar" aria-label={`${name} HP`} aria-valuemin={0} aria-valuemax={mon.maxHp} aria-valuenow={mon.currentHp}><i style={{ width: `${hp}%`, background: hp > 20 ? '#f0607a' : '#d6334f' }} /></div>
          <div className="tr-xp" role="progressbar" aria-label={`${name} EXP`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(xp)}><i style={{ width: `${xp}%` }} /></div>
        </button>
        {popup && <div className={`xp-pop rail-xp${popup.active ? ' bonus' : ''}`} key={`${mon.uid}-${popup.amount}`} style={{ left: 'calc(100% + 8px)', top: '50%' }}>+{popup.amount.toLocaleString()} <small>XP{popup.active && !isCatchSequenceActive ? ' ×1.1' : ''}</small></div>}
      </div>;
    })}
  </div>;
}
