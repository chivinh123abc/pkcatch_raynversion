// Explicit reset requested on 15/11/2026. Run once per browser origin, not on every reload.
const RESET_KEY = 'pokecatch_reset_20261115_01';
const SAVE_KEY = 'pokecatch_save_v1';
export function applyRequestedSaveReset(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): boolean {
  if (storage.getItem(RESET_KEY)) return false;
  const previous = storage.getItem(SAVE_KEY);
  if (previous) storage.setItem('pokecatch_backup_before_reset_20261115_01', previous);
  storage.removeItem(SAVE_KEY);
  storage.setItem(RESET_KEY, 'done');
  return true;
}
