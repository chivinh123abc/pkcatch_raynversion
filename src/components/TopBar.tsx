import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemSpriteUrl, getPokemonSpriteUrl } from '../data/pokemonData';

export const TopBar: React.FC = () => {
  const {
    trainerName,
    trainerSprite,
    trainerTag,
    pokedexCaught,
    money,
    tokens,
    saveGame,
    topToastBanner,
  } = useGameStore();

  return (
    <header className="topbar replica-topbar">
      <div className="tb-prof has-new">
        <span className="tr-face side-av"><span className="tr-win"><img src={`/assets/trainers/${trainerSprite}.png`} alt={`Trainer ${trainerSprite === 'leaf' ? 'Leaf' : 'Red'}`} /></span></span>
        <span className="tb-who"><b>{trainerName}<small className="tag">{trainerTag}</small></b><small>Pokédex <em>{new Set(pokedexCaught).size} / 151</em></small></span>
      </div>
      <div className="side-wallet"><div className="side-money"><b>{money.toLocaleString()} ₽</b></div><div className="side-money tb-cur" title="Coins"><img src="/assets/ui/coin-case.png" alt="Coins" /><b>{tokens.toLocaleString()}</b></div></div>
      <span className="tb-sep" />
      <div className="tb-acts">
        <button className="tb-save" onClick={() => saveGame()} title="Save game" aria-label="Save game"><img src="/assets/ui/floppy.svg" alt="" /><span>Save</span><i className="replica-save-dot" /></button>
        <button className="tb-opt" title="Settings" aria-label="Settings">⚙</button>
      </div>
      {topToastBanner && <div className="top-toast-banner replica-toast" role="status">{topToastBanner.iconSpeciesId && <img src={getPokemonSpriteUrl(topToastBanner.iconSpeciesId)} alt="" />}<span>{topToastBanner.text}</span></div>}
    </header>
  );
};
