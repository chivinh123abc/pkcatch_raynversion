import React, { useCallback, useEffect, useRef, useState } from 'react';
import { startGameplayLoop } from './game/runtime/gameLoop';
import { applyRequestedSaveReset } from './game/runtime/resetLocalSave';
import { addRarityTestPokemon, hasPendingRarityTestGrant } from './game/runtime/rarityTestSave';
import { useGameStore } from './store/useGameStore';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { Arena } from './components/Arena';
import { RightPanel } from './components/RightPanel';
import { AdventurePage } from './components/AdventurePage';
import { CollectionPage } from './components/CollectionPage';
import { PokemonDetails } from './components/PokemonDetails';
import { StarterSelection } from './components/StarterSelection';
import { AdventureGiftDialog } from './components/AdventureGiftDialog';
import './styles/starter.css';

export function App() {
  const [collectionTab, setCollectionTab] = useState<'team' | 'pokedex' | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [sessionEntered, setSessionEntered] = useState(false);
  const loadedWithStarter = useRef(false);
  const closeCollection = useCallback(() => { setCollectionTab(null); setMobileMenu(false); useGameStore.getState().closeAdventureModal(); }, []);
  const openCollection = useCallback((tab: 'team' | 'pokedex') => { useGameStore.getState().markCollectionVisited(tab); setCollectionTab(tab); setMobileMenu(false); useGameStore.getState().closeAdventureModal(); }, []);
  const showProgress = useCallback(() => { setCollectionTab(null); setMobileMenu(false); useGameStore.getState().openAdventureModal(); }, []);
  const {
    loadGame,
    starterChosen,
    isAdventureModalOpen,
    selectChapter,
    newCatchCard,
    dismissNewCatchCard,
  } = useGameStore();
  const pageOpen = isAdventureModalOpen || !!collectionTab;

  useEffect(() => {
    if (!sessionEntered || isAdventureModalOpen || !collectionTab) return;
    const syncVisited = () => {
      const s = useGameStore.getState();
      if (collectionTab === 'team') {
        if ([...s.party, ...s.pcBox].some((mon) => !s.teamReviewedUids.includes(mon.uid))) {
          s.markCollectionVisited('team');
        }
      } else if (s.pokedexCaught.some((id) => !s.dexNotifiedSpecies.includes(id))) {
        s.markCollectionVisited('pokedex');
      }
    };
    syncVisited();
    return useGameStore.subscribe(syncVisited);
  }, [collectionTab, isAdventureModalOpen, sessionEntered]);

  useEffect(() => {
    try {
      if (applyRequestedSaveReset(localStorage)) {
        useGameStore.runtime.beginEncounter();
        useGameStore.setState(useGameStore.getInitialState(), true);
      }
    } catch (error) { console.warn('Unable to reset local save:', error); }
    const url = new URL(window.location.href);
    let rarityTestReady = false;
    // User requested this local-save fixture. Support local preview as well as Vite DEV.
    const localTesting = import.meta.env.DEV || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (localTesting && (url.searchParams.get('rarity-test') === '1' || hasPendingRarityTestGrant(localStorage))) {
      try {
        addRarityTestPokemon(localStorage);
        rarityTestReady = true;
        url.searchParams.delete('rarity-test');
        window.history.replaceState(window.history.state, '', url);
      } catch (error) { console.warn('Unable to add rarity test Pokémon:', error); }
    }
    loadGame({ deferEncounter: true });
    loadedWithStarter.current = useGameStore.getState().starterChosen;
    setSaveLoaded(true);
    if (rarityTestReady) setCollectionTab('team');
  }, [loadGame, openCollection]);

  useEffect(() => {
    if (!sessionEntered) return;
    const save = () => useGameStore.getState().saveGame(true);
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); };
    const timer = window.setInterval(save, 15000);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sessionEntered]);

  // A newly chosen starter enters this session; an existing save waits for Continue.
  useEffect(() => {
    if (saveLoaded && starterChosen && !loadedWithStarter.current) setSessionEntered(true);
  }, [saveLoaded, starterChosen]);
  useEffect(() => {
    if (sessionEntered && starterChosen) return startGameplayLoop(useGameStore);
  }, [sessionEntered, starterChosen]);

  return (
    <div className={`game-shell min-h-screen w-full flex flex-col font-game select-none text-[#e8ecf4] ${mobileMenu ? 'mobile-menu-open' : ''}`}>
      {/* 1. Header Bar matching original gameplay video */}
      <TopBar />

      {/* 2. Main 3-Column Layout matching original gameplay video */}
      <main className="mx-auto w-full max-w-[1580px] flex-1 px-4 py-3 flex gap-4 min-w-[1100px] items-start">
        {/* Left Column: Chapter progress, Navigation, Activities, Social */}
        <LeftSidebar onOpenCollection={openCollection} activeView={isAdventureModalOpen ? 'progress' : collectionTab || 'adventure'} onShowAdventure={showProgress} onResumeAdventure={closeCollection} />

        {/* Center Column: Route indicator, Battle field arena, RPG dialog, Community feats */}
        <div className="adventure-view" hidden={pageOpen} aria-hidden={pageOpen} ref={element => { if (element) element.inert = pageOpen; }}>
          <Arena />

        {/* Right Column: Consumables (Berries) & Found here encounters */}
          <RightPanel />
        </div>
        {isAdventureModalOpen ? <AdventurePage onContinue={chapterId => { const state=useGameStore.getState();if (chapterId !== state.currentChapterId || chapterId==='kanto-14'&&state.completedChapters.includes(chapterId)) {selectChapter(chapterId);useGameStore.setState({isBattling:true});} closeCollection(); }} /> : collectionTab && <CollectionPage key={collectionTab} tab={collectionTab} />}
      </main>
      {mobileMenu && <button className="mobile-menu-backdrop" aria-label="Close navigation menu" onClick={() => setMobileMenu(false)} />}
      <nav className="mobile-navigation" aria-label="Mobile navigation">
        <button aria-current={isAdventureModalOpen || !collectionTab ? 'page' : undefined} onClick={showProgress}><img src="/assets/sidebar/progress.png" alt="" /><span>Progress</span></button>
        <button aria-current={collectionTab === 'team' ? 'page' : undefined} onClick={() => openCollection('team')}><img src="/assets/sidebar/team_pc.png" alt="" /><span>Team/PC</span></button>
        <button aria-current={collectionTab === 'pokedex' ? 'page' : undefined} onClick={() => openCollection('pokedex')}><img src="/assets/sidebar/pok_dex.png" alt="" /><span>Pokédex</span></button>
        <button aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><span className="mobile-menu-icon">☰</span><span>Menu</span></button>
      </nav>
      {saveLoaded && (!starterChosen || !sessionEntered) && <StarterSelection hasSave={starterChosen} onContinue={() => { loadGame(); setSessionEntered(true); }} />}
      {sessionEntered && <AdventureGiftDialog />}

      {sessionEntered && newCatchCard && <PokemonDetails speciesId={newCatchCard.speciesId} level={newCatchCard.level} shiny={newCatchCard.isShiny} isNew={newCatchCard.isNew} gift={newCatchCard.source==='gift'} capture onClose={dismissNewCatchCard} />}
    </div>
  );
}

export default App;
