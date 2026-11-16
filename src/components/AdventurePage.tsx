import { useEffect, useState } from 'react';
import { ALL_CHAPTERS, ChapterInfo, DEFAULT_CHAPTER, chapterIcon } from '../data/chaptersData';
import { ALL_SPECIES, getPokemonSpecies } from '../data/pokemonData';
import { TYPE_COLORS } from '../data/typeChart';
import { useGameStore } from '../store/useGameStore';
import { PokemonDetails, PokemonSprite } from './PokemonDetails';
import { chapterUnlocked, chapterCompleted, currentChapter as getCurrentChapter } from '../game/data/chapterSelectors';

const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
const badgeColors = ['#9a8b6a', '#48a4d3', '#c9ae39', '#78ad55', '#bd7598', '#9c7bb6', '#d27c48', '#80a578'];
const weather = { day: ['☀️', 'Day'], night: ['🌙', 'Night'], rain: ['🌧️', 'Rain'] };

/** Only the unlocks backed by the current save are exposed here; chapter content remains in chaptersData. */
function lockReason(chapter: ChapterInfo, currentChapterId: string, badges: string[], caught: Set<number>, completedChapters: string[]) {
  if(chapter.runtimeSupported===false) return 'This activity is not implemented yet';
  if(chapterUnlocked(chapter.id,{badges,completedChapters}))return '';
  if (chapter.id === currentChapterId) return '';
  const previous = ALL_CHAPTERS.find(value => value.chapterNumber === chapter.chapterNumber - 1 && !value.isSpecial);
  return `Complete ${previous?.name || 'the previous chapter'}`;
}

export function AdventurePage({ onContinue }: { onContinue: (chapterId: string) => void }) {
  const { currentChapterId, chapterRun, completedChapters, badges, pokedexCaught, pokedexSeen, newCatchCard } = useGameStore();
  const [selectedId, setSelectedId] = useState(currentChapterId);
  const [detail, setDetail] = useState<number | null>(null);
  useEffect(() => { setSelectedId(currentChapterId); }, [currentChapterId]);
  const selected = selectedId===currentChapterId ? getCurrentChapter({currentChapterId,chapterRun}) : ALL_CHAPTERS.find(chapter => chapter.id === selectedId) || DEFAULT_CHAPTER;
  const caught = new Set(pokedexCaught);
  const seen = new Set([...pokedexSeen, ...pokedexCaught]);
  const reason = lockReason(selected, currentChapterId, badges, caught,completedChapters);
  const current = selected.id === currentChapterId;
  const completed = chapterCompleted(selected,{badges,completedChapters});
  const color = selected.themeColor || (selected.isSpecial ? '#8779b5' : badgeColors[Math.max(0, selected.chapterNumber - 1)] || '#9a8b6a');
  const found = [...new Set(Object.values(selected.pokemonFound).flat().map(mon => mon.speciesId))];
  const time = new Date().getHours();
  const condition = selected.weather === 'rain' || selected.weather === 'thunderstorm' ? 'rain' : time >= 6 && time < 18 ? 'day' : 'night';
  const levels = selected.recommendedLevel.match(/\d+/g);
  const maxLevel = levels?.[levels.length - 1];
  const speciesGrid = (list: ChapterInfo['pokemonFound']['base']) => <div className="mp-grid progress-species-grid">
    {list.map(mon => <button key={mon.speciesId} className={`progress-species ${caught.has(mon.speciesId) ? 'caught' : seen.has(mon.speciesId) ? 'seen' : 'unk'}`} aria-label={seen.has(mon.speciesId) ? `View ${getPokemonSpecies(mon.speciesId).name}` : `Unknown Pokémon number ${mon.speciesId}`} title={`${seen.has(mon.speciesId) ? getPokemonSpecies(mon.speciesId).name : '???'} · ${mon.rate}`} onClick={() => setDetail(mon.speciesId)}>
      <PokemonSprite id={mon.speciesId} scale={2} unknown={!seen.has(mon.speciesId)} />
      {caught.has(mon.speciesId) && <img className="progress-owned" src="/assets/items/poke-ball.png" alt="Caught" />}
    </button>)}
  </div>;

  return <section className="progress-page" id="screen-map" aria-label="Adventure">
    <div className="map-region" style={{ '--c': '#00a542' } as React.CSSProperties}>
      <div className="map-head"><img src="/assets/ui/town-map.png" alt="" /><h2>Adventure</h2><span className="replica-help" title="Beat each Gym Leader to earn a badge and unlock the next chapter.">?</span><div className="map-sum">Regions <b>1/9</b></div></div>
      <div className="map-body pg-3">
        <div className="pg-regions" aria-label="Regions">
          {regions.map((name, index) => index === 0 ? <button className="rg open active" key={name} aria-current="true" style={{ '--c': '#e3353b' } as React.CSSProperties}>
            <span className="rg-top"><img src="/assets/ui/town-map.png" alt="" /><b>Kanto</b></span><small className="rg-caught"><img src="/assets/items/poke-ball.png" alt="" />{[...caught].filter(id => id <= 151).length}/151 caught</small>
            <span className="rg-badges">{ALL_CHAPTERS.filter(chapter => chapter.chapterNumber >= 1 && chapter.chapterNumber <= 8).map(chapter => <img key={chapter.id} className={badges.includes(chapter.badgeSprite) ? '' : 'off'} src={chapterIcon(chapter)} alt={chapter.badgeName} />)}</span>
          </button> : <div key={name} className={`rg soon ${index < 4 ? 'lock' : ''}`}><span className="rg-top"><b>{name}</b></span><small>{index < 4 ? <><img className="lock-ic" src="/assets/sidebar/padlock_pixel.svg" alt="" />Finish {regions[index - 1]} to unlock</> : 'Coming soon…'}</small></div>)}
        </div>
        <div className="pg-cols">
          <div className="mp-list" aria-label="Chapters"><h4 className="pg-h">Gyms</h4>
            {ALL_CHAPTERS.map(chapter => {
              const locked = lockReason(chapter, currentChapterId, badges, caught,completedChapters);
              const isCurrent = chapter.id === currentChapterId;
              return <button key={chapter.id} className={`mp-row ${isCurrent ? 'current gym-bg' : ''} ${chapter.id === selected.id ? 'sel' : ''} ${locked ? 'locked' : ''}`} aria-label={`Preview ${chapter.name}`} aria-pressed={chapter.id === selected.id} onClick={() => setSelectedId(chapter.id)} style={{ '--c': badgeColors[Math.max(0, chapter.chapterNumber - 1)] || '#8779b5' } as React.CSSProperties}>
                {isCurrent && <span className="row-scene" style={{ backgroundImage: `url(${chapter.gymBackdrop})` }} />}
                <span className="n">{chapter.isSpecial ? <img className="lock-ic" src="/assets/sidebar/padlock_pixel.svg" alt="" /> : String(chapter.chapterNumber).padStart(2, '0')}</span>
                <span className="bd"><span className={`ch-av ${badges.includes(chapter.badgeSprite) && !chapter.isSpecial ? '' : 'sil'}`}><img className="progress-leader-thumb" src={`/assets/trainers/still/${chapter.leaderSprite}.png`} alt="" /><img className="progress-chapter-badge" src={chapterIcon(chapter)} alt="" /></span></span>
                <span className="t"><b>{chapter.id === 'special-mewtwo' ? 'Cerulean Cave' : chapter.name}</b><small>{locked ? chapter.isSpecial ? locked : 'Locked' : <span className="pg-lv">Recommended {chapter.recommendedLevel}</span>}</small></span>
                {chapterCompleted(chapter,{badges,completedChapters}) && !chapter.isSpecial && <span className="progress-completed" aria-label="Completed">✓</span>}
              </button>;
            })}
          </div>
          <div className="pg-info"><h4>Info</h4>
            <div className="mp-det ch-det" style={{ '--c': color } as React.CSSProperties}>
              <div className="mp-hero" style={{ backgroundImage: `url(${selected.gymBackdrop})` }}><span className={`st ${current ? 'cur' : ''}`}>{current ? '▶ In progress' : reason ? '🔒 Locked' : completed ? '✓ Completed' : 'Ready'}</span><span className={`faces ${completed ? '' : 'sil'}`}><img src={`/assets/trainers/${selected.leaderSprite}.png`} alt={selected.leaderName} /></span></div>
              <div className="mp-in">
                <div className="ttl"><img className="progress-detail-badge" src={chapterIcon(selected)} alt="" /><div className="ttl-t"><span className="ttl-who">{selected.leaderName}<span className="ty" style={{ '--c': TYPE_COLORS[selected.leaderType] || color, '--tc': TYPE_COLORS[selected.leaderType] || color, background:'var(--tc)' } as React.CSSProperties}>{selected.leaderType}</span></span><h3>{selected.name}</h3></div></div>
                <div className="mp-chips"><span className="pg-lv">Recommended <b>{selected.recommendedLevel}</b></span>{maxLevel && <span className="cap-chip">Lv. <b>{maxLevel}</b> cap</span>}<span>Reward <b>{selected.rewardMoneyRange}</b></span><span className="wx">{weather[condition][0]} {selected.weatherLabel || weather[condition][1]}</span></div>
                {reason && <p className="progress-lock-reason">{reason}</p>}
                <div className="mp-pk"><h5>Items found here <small>{selected.items.length} items</small></h5><div className="mp-items">{selected.items.map(item => <span className="mp-it" key={item.name} title={item.name}><img src={item.icon.replace('/assets/ui/poke-ball.png', '/assets/items/poke-ball.png')} alt={item.name} /></span>)}</div></div>
                <div className="mp-pk"><h5>Pokémon found here <small>{found.filter(id => caught.has(id)).length}/{found.length} caught</small></h5>{speciesGrid(selected.pokemonFound.base)}
                  {(['day', 'night', 'rain'] as const).map(group => selected.pokemonFound[group]?.length ? <div key={group}><div className={`zone-cond ${condition === group ? 'now' : ''}`}><span className="zone-cond-ic">{weather[group][0]}</span>{weather[group][1]}{condition === group && <span className="zone-cond-now">now</span>}</div>{speciesGrid(selected.pokemonFound[group])}</div> : null)}
                </div>
              </div>
              <div className="progress-actions"><button className="btn primary lg progress-continue" disabled={!!reason} onClick={() => onContinue(selected.id)}>{reason ? 'Locked' : current && !(completed && selected.chapterNumber===14) ? 'Continue' : completed ? 'Replay the chapter' : 'Start the chapter'}</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {detail !== null && !newCatchCard && <PokemonDetails speciesId={detail} onClose={() => setDetail(null)} />}
  </section>;
}
