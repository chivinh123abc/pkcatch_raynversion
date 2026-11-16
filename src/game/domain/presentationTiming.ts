/** Live v0.4.103 labels ×1/×2/×3 store 1/2/4; SPEED_PACE[4] is 2.5. Save/UI keep 1/2/3. */
export const gameplaySpeed = (selection: number) => selection === 3 ? 2.5 : selection === 2 ? 2 : 1;
export const battlePollDelay = (selection: number) => 325 / gameplaySpeed(selection);
/** Native Qn(): reading/recovery after contact, before the loop's separate 325ms wait. */
export function attackRecoveryDelay(roll: { miss: boolean; multiplier: number; crit: boolean }, pace: number) {
  if (roll.miss) return 400 / pace;
  if (roll.multiplier === 0) return 500 / pace;
  return (260 + (roll.crit || roll.multiplier !== 1 ? 450 : 0)) / pace;
}
export const trainerIntroDuration = (kind: 'trainer' | 'gym', speed: number) => kind === 'gym' ? 1460 + 1420 / speed : 1040 + 750 / speed;
