import { RuntimeClock } from './GameplayRuntime';
import { battlePollDelay } from '../domain/presentationTiming';
interface LoopStore {
    runtime: {
        clock: RuntimeClock;
    };
    getState: () => {
        gameSpeed: number;
        isBattling: boolean;
        starterChosen?: boolean;
        tickCombat: () => void;
        tickBerryBuffs: (seconds?: number) => void;
    };
}
/** The app owns this loop; encounter cancellation never cancels real-time buff ticks. */
export function startGameplayLoop(store: LoopStore): () => void {
    const clock = store.runtime.clock;
    let stopped = false;
    let battleTimer: unknown, realTimer: unknown;
    let lastRealTick = clock.now();
    const scheduleBattle = () => {
        battleTimer = clock.setTimeout(() => {
            if (stopped)
                return;
            const state = store.getState();
            try {
                if (state.isBattling && state.starterChosen !== false)
                    state.tickCombat();
            }
            finally {
                if (!stopped)
                    scheduleBattle();
            }
        }, battlePollDelay(store.getState().gameSpeed));
    };
    const scheduleRealTime = () => {
        realTimer = clock.setTimeout(() => {
            if (stopped)
                return;
            const now = clock.now();
            if (now < lastRealTick)
                lastRealTick = now;
            const elapsed = Math.floor((now - lastRealTick) / 1000);
            if (elapsed > 0) {
                lastRealTick += elapsed * 1000;
                store.getState().tickBerryBuffs(elapsed);
            }
            if (!stopped)
                scheduleRealTime();
        }, 1000);
    };
    scheduleBattle();
    scheduleRealTime();
    return () => { stopped = true; clock.clearTimeout(battleTimer); clock.clearTimeout(realTimer); };
}
