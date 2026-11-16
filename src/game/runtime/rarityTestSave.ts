import { createPokemonInstance } from '../domain/pokemon';
import { GameplayRuntime } from './GameplayRuntime';

const SAVE_KEY = 'pokecatch_save_v1';
export const RARITY_TEST_MARKER = 'pokecatch_rarity_test_20261116_01';
export const RARITY_TEST_BACKUP = 'pokecatch_backup_before_rarity_test_20261116_01';
// Two specimens for each rarity available in Kanto; native has no Unique here.
export const RARITY_TEST_SPECIES = [19, 25, 20, 17, 3, 149, 144, 150] as const;

/** Explicit dev URL opt-in. Patch the saved payload before loading it, preserving all other fields. */
export function addRarityTestPokemon(storage: Pick<Storage, 'getItem' | 'setItem'>): number {
    if (storage.getItem(RARITY_TEST_MARKER)) return 0;
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) throw new Error('Choose a starter and save the game before adding test Pokémon.');
    const save = JSON.parse(raw);
    if (save.version !== 2 || save.saveVersion !== 4 || save.starterChosen !== true ||
        !Array.isArray(save.party) || !Array.isArray(save.pcBox) ||
        !Array.isArray(save.pokedexCaught) || !Array.isArray(save.pokedexSeen)) {
        throw new Error('The current save is not ready for the rarity test grant.');
    }
    const runtime = new GameplayRuntime();
    const existing = new Set([...save.party, ...save.pcBox].map(mon => mon.uid));
    const added = RARITY_TEST_SPECIES.flatMap(id => {
        const uid = `${RARITY_TEST_MARKER}-${id}`;
        return existing.has(uid) ? [] : [{ ...createPokemonInstance(id, 20, false, runtime), uid }];
    });
    if (!storage.getItem(RARITY_TEST_BACKUP)) storage.setItem(RARITY_TEST_BACKUP, raw);
    if (added.length) {
        save.pcBox.push(...added);
        save.pokedexCaught = [...new Set([...save.pokedexCaught, ...RARITY_TEST_SPECIES])];
        save.pokedexSeen = [...new Set([...save.pokedexSeen, ...RARITY_TEST_SPECIES])];
        storage.setItem(SAVE_KEY, JSON.stringify(save));
    }
    // Stable specimen UIDs also prevent duplicates if writing this marker fails.
    storage.setItem(RARITY_TEST_MARKER, 'done');
    return added.length;
}
