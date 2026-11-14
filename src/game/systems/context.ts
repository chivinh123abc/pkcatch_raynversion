import type { StoreApi } from 'zustand';
import type { GameState } from '../domain/GameState';
import type { GameplayRuntime } from '../runtime/GameplayRuntime';
import type { PokemonInstance } from '../../types/game';
export interface SystemContext {
    set: StoreApi<GameState>['setState'];
    get: StoreApi<GameState>['getState'];
    runtime: GameplayRuntime;
    createInstance: (speciesId: number, level: number, shiny?: boolean) => PokemonInstance;
}
