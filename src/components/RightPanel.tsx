import { currentChapter as getCurrentChapter } from '../game/data/chapterSelectors';
import { runtimeFoundHere } from '../game/presentation/foundHere';
import { Fragment, useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../data/chaptersData';
import { getPokemonSpecies } from '../data/pokemonData';
import { KANTO7_AREAS } from '../data/foundAreas';
import { chapterOneFoundHere, chapterFoundHere, FoundSection } from '../game/presentation/foundHere';
import { Consumables } from './Consumables';
import { PanelSprite } from './PanelSprite';
import { PanelInfo } from './PanelHeading';
import { InventoryDialog } from './InventoryDialog';
import { PokemonDetails } from './PokemonDetails';

export function RightPanel() {
  const { chapterRun, currentChapterId, currentStep, pokedexCaught, pokedexSeen, party, pcBox, berryBuffs, items, balls, newCatchCard } = useGameStore();
  const chapter = getCurrentChapter({currentChapterId,chapterRun});
  const [folded, setFolded] = useState(false), [bagOpen, setBagOpen] = useState(false), [detail, setDetail] = useState<number | null>(null);
  const defaultArea = currentStep <= 5 ? 'Routes 19-20' : currentStep <= 9 ? 'Power Plant' : currentStep <= 16 ? 'Seafoam Islands' : currentStep >= 26 ? 'Cinnabar Gym' : 'Pokémon Mansion';
  const [area, setArea] = useState(defaultArea);
  useEffect(() => setArea(defaultArea), [currentChapterId, defaultArea]);
  useEffect(() => { if (newCatchCard) { setBagOpen(false); setDetail(null); } }, [newCatchCard]);
  const found = runtimeFoundHere({currentChapterId,currentStep,chapterRun},berryBuffs.nanab>0?2:1);
  const species = [...new Set(found.sections.flatMap(section => section.entries.map(entry => entry.speciesId)))];
  const owned = new Set([...party,...pcBox].map(mon => mon.speciesId)), caught = new Set(pokedexCaught), seen = new Set([...pokedexSeen,...pokedexCaught]);
  const count = species.filter(id => caught.has(id) && owned.has(id)).length;
  const inventory = Object.entries({ ...items, ...Object.fromEntries(Object.entries(balls).filter(([,quantity]) => quantity > 0)) }).filter(([,quantity]) => quantity > 0) as [string,number][];
  const renderGroup = (section: FoundSection) => <Fragment key={section.key}>
    {section.label && <div className={`zone-cond${section.active ? ' now' : ' off'}`}><span><span className="zone-cond-ic">{section.icon}</span>{section.label}</span>{section.active && <span className="zone-cond-now">now</span>}</div>}
    <div className={`zone-grid${section.active ? '' : ' off'}`}>{section.entries.map(entry => {
      const known = seen.has(entry.speciesId), isCaught = caught.has(entry.speciesId) && owned.has(entry.speciesId), lost = caught.has(entry.speciesId) && !owned.has(entry.speciesId);
      const name = known ? getPokemonSpecies(entry.speciesId).name : '???';
      const percentage = entry.rate * 100, rate = percentage < 1 ? '<1' : Math.round(percentage);
      return <button key={entry.speciesId} className={`zone-cell ${isCaught ? 'caught' : known ? 'seen' : 'unknown'}${lost ? ' lost' : ''}`} onClick={() => setDetail(entry.speciesId)}
        aria-label={`${name}, ${rate}% of encounters${isCaught ? ', caught' : ''}${section.active ? '' : ', currently unavailable'}`} title={`${name}${entry.minLevel ? ` · Lv. ${entry.minLevel}${entry.maxLevel !== entry.minLevel ? `–${entry.maxLevel}` : ''}` : ''} · ${rate}% of encounters`}>
        <PanelSprite id={entry.speciesId} />
        <span className="zone-pct">{entry.boosted && section.active && <b className="zone-up">▲</b>}{entry.special ? '★' : `${rate}%`}</span>
      </button>;
    })}</div>
  </Fragment>;
  return <aside className="battle-panels" aria-label="Battle sidebar">
    <Consumables hasItems={inventory.length > 0} onOpenBag={() => setBagOpen(true)} />
    <section className={`panel-group found-panel${folded ? ' folded' : ''}`} aria-label="Found here"><div className="zone-box">
      <div className="zone-head">
        <button className="panel-fold-title" onClick={() => setFolded(!folded)} aria-expanded={!folded} aria-controls="found-content"><b>Found here</b></button>
        <PanelInfo title="Found here" text={'Wild Pokémon in this area. Percentages show their share of encounters. “???” means never seen; dim groups require a different time or weather. Tap a Pokémon for its Pokédex card.'} />
        <span className="muted">{found.area}</span>
        <span className={`zone-count${count === species.length ? ' done' : ''}`}>{count}/{species.length}</span>
        <button className="panel-fold" aria-label={folded ? 'Expand Found here' : 'Collapse Found here'} onClick={() => setFolded(!folded)} aria-expanded={!folded}>{folded ? '▸' : '▾'}</button>
      </div>
      <div className="zone-scroll" id="found-content" hidden={folded}>{found.sections.map(renderGroup)}</div>
    </div></section>
    {bagOpen && !newCatchCard && <InventoryDialog entries={inventory} onClose={() => setBagOpen(false)} />}
    {detail !== null && !newCatchCard && <PokemonDetails speciesId={detail} onClose={() => setDetail(null)} />}
  </aside>;
}
