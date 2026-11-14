import React, { useCallback, useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { Arena } from './components/Arena';
import { RightPanel } from './components/RightPanel';
import { AdventureModal } from './components/AdventureModal';
import { CollectionModal } from './components/CollectionModal';

export function App() {
  const [collectionTab, setCollectionTab] = useState<'team' | 'pokedex' | null>(null);
  const closeCollection = useCallback(() => setCollectionTab(null), []);
  const {
    isBattling,
    tickCombat,
    tickBerryBuffs,
    gameSpeed,
    loadGame,
    isAdventureModalOpen,
    closeAdventureModal,
    selectChapter,
  } = useGameStore();

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
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
  }, []);

  // Tick countdown for Berry buffs every second
  useEffect(() => {
    const berryTimer = setInterval(() => {
      tickBerryBuffs();
    }, 1000);
    return () => clearInterval(berryTimer);
  }, [tickBerryBuffs]);

  // Combat loop
  useEffect(() => {
    if (!isBattling) return;
    const interval = Math.max(250, Math.floor(1200 / gameSpeed));
    const timer = setInterval(() => {
      tickCombat();
    }, interval);
    return () => clearInterval(timer);
  }, [isBattling, tickCombat, gameSpeed]);

  return (
    <div className="game-shell min-h-screen w-full flex flex-col font-game select-none text-[#e8ecf4]">
      {/* 1. Header Bar matching original gameplay video */}
      <TopBar />

      {/* 2. Main 3-Column Layout matching original gameplay video */}
      <main className="mx-auto w-full max-w-[1580px] flex-1 px-4 py-3 flex gap-4 min-w-[1100px] items-start">
        {/* Left Column: Chapter progress, Navigation, Activities, Social */}
        <LeftSidebar onOpenCollection={setCollectionTab} />

        {/* Center Column: Route indicator, Battle field arena, RPG dialog, Community feats */}
        <Arena />

        {/* Right Column: Consumables (Berries) & Found here encounters */}
        <RightPanel />
      </main>

      {/* 3. Adventure Map / Chapter Selector Modal (matching frame 03s, 06s) */}
      <AdventureModal
        isOpen={isAdventureModalOpen}
        onClose={closeAdventureModal}
        onSelectChapter={selectChapter}
      />
      {collectionTab && <CollectionModal tab={collectionTab} onTabChange={setCollectionTab} onClose={closeCollection} />}
    </div>
  );
}

export default App;
