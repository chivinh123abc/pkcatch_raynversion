import { createPokemonInstance } from '../domain/pokemon';
import { GameplayRuntime } from './GameplayRuntime';

const SAVE_KEY = 'pokecatch_save_v1';
export const RARITY_TEST_MARKER = 'pokecatch_rarity_test_20261116_04';
export const RARITY_TEST_BACKUP = 'pokecatch_backup_before_rarity_test_20261116_04';
// Keep the old specimen UIDs so upgrading an existing eight-mon grant adds only four.
const SPECIMEN_UID_PREFIX = 'pokecatch_rarity_test_20261116_01';
// Three specimens for every rarity available in Kanto; no species has native Unique here.
export const RARITY_TEST_SPECIES = [19, 25, 16, 20, 17, 26, 3, 149, 130, 144, 150, 151] as const;
export const SHINY_TEST_SPECIES = [1, 4, 7, 10, 16, 19, 25, 26, 39, 52, 54, 58, 65, 94, 123, 130, 133, 143, 149, 144, 145, 146, 150, 151] as const;

/** Pending user-requested local fixture; never seed a fresh/unselected starter save. */
export function hasPendingRarityTestGrant(storage: Pick<Storage, 'getItem'>): boolean {
    try {
        return !storage.getItem(RARITY_TEST_MARKER) && JSON.parse(storage.getItem(SAVE_KEY) || 'null')?.starterChosen === true;
    } catch { return false; }
}

/** Patch the saved payload before loading it, preserving all other fields. */
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
    const specimens = [
        ...RARITY_TEST_SPECIES.map(id => ({id, shiny:false, uid:`${SPECIMEN_UID_PREFIX}-${id}`})),
        ...SHINY_TEST_SPECIES.map(id => ({id, shiny:true, uid:`pokecatch_shiny_test_20261116_04-${id}`})),
    ];
    const added = specimens.flatMap(({id, shiny, uid}) => {
        return existing.has(uid) ? [] : [{ ...createPokemonInstance(id, 20, shiny, runtime), uid }];
    });
    if (!storage.getItem(RARITY_TEST_BACKUP)) storage.setItem(RARITY_TEST_BACKUP, raw);
    if (added.length) {
        save.pcBox.push(...added);
        save.pokedexCaught = [...new Set([...save.pokedexCaught, ...added.map(mon => mon.speciesId)])];
        save.pokedexSeen = [...new Set([...save.pokedexSeen, ...added.map(mon => mon.speciesId)])];
        storage.setItem(SAVE_KEY, JSON.stringify(save));
    }
    // Stable specimen UIDs also prevent duplicates if writing this marker fails.
    storage.setItem(RARITY_TEST_MARKER, 'done');
    return added.length;
}
