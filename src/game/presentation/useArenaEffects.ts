import { useEffect, RefObject } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getPokemonSpecies } from '../../data/pokemonData';
import type { ChapterInfo } from '../../data/chaptersData';
import { BattleFX } from '../../utils/battleFxEngine';
import { CaptureFX } from '../../utils/captureFxEngine';
import { HealFX } from '../../utils/healFxEngine';
import { ItemFX } from '../../utils/itemFxEngine';
import { nativeFxRuntime } from '../../utils/nativeFxRuntime';
import { createEffectLayer } from './effectLayer';
interface ArenaEffectsProps {
    arenaRef: RefObject<HTMLDivElement>;
    fxContainerRef: RefObject<HTMLDivElement>;
    playerMonRef: RefObject<HTMLDivElement>;
    enemyMonRef: RefObject<HTMLDivElement>;
    enemySpriteRef: RefObject<HTMLImageElement>;
    currentChapter: ChapterInfo;
}
/** Presentation adapter: immutable requests in, keyed completion/contact callbacks out.
 * Speed is sampled by each request; a speed change cannot restart an active effect.
 */
export function useArenaEffects({ arenaRef, fxContainerRef, playerMonRef, enemyMonRef, enemySpriteRef, currentChapter }: ArenaEffectsProps) {
    const { encounter, enemy, party, activeTrainer, activePartyIndex, nodeType, bossIntroActive, allyRecalling, allySendingOut, enemyRecalling, gameSpeed, combatEffect, resolveCombatImpact, finishCombatEffect, capturePresentation, finishCapturePresentation, healPresentation, finishHealPresentation, skipHeal, activeDrop, finishItemDrop } = useGameStore();
    // One animation engine owns movement and reports the actual contact frame.
    useEffect(() => {
        BattleFX.cancel();
        return () => BattleFX.cancel();
    }, [encounter.encounterId]);
    useEffect(() => {
        if (!combatEffect)
            return;
        let cancelled = false;
        const moveKey = combatEffect.moveKey || combatEffect.moveName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const isTargetEnemy = combatEffect.target === 'enemy';
        const attEl = isTargetEnemy ? playerMonRef.current : enemyMonRef.current;
        const defEl = isTargetEnemy ? enemyMonRef.current : playerMonRef.current;
        const effectiveMove = BattleFX.has(moveKey) ? moveKey : (BattleFX.has('tackle') ? 'tackle' : 'pound');
        if (attEl && defEl && fxContainerRef.current) {
            BattleFX.play({
                move: effectiveMove,
                attEl,
                defEl,
                fxEl: fxContainerRef.current,
                shakeEl: arenaRef.current,
                mirror: !isTargetEnemy,
                speed: combatEffect.speed || gameSpeed,
                miss: combatEffect.miss,
                crit: combatEffect.crit,
                onImpact: () => {
                    if (!cancelled)
                        resolveCombatImpact(combatEffect.key);
                },
            }).then(() => {
                if (!cancelled)
                    finishCombatEffect(combatEffect.key);
            })
                .catch(() => {
                if (!cancelled)
                    finishCombatEffect(combatEffect.key);
            });
        }
        else {
            finishCombatEffect(combatEffect.key);
        }
        return () => { cancelled = true; BattleFX.cancel(); };
    }, [combatEffect, resolveCombatImpact, finishCombatEffect]);
    // Keep the ball trajectory, absorption, bounce and shakes on one clock.
    useEffect(() => {
        const target = enemySpriteRef.current || enemyMonRef.current;
        if (!capturePresentation || !arenaRef.current || !fxContainerRef.current || !target)
            return;
        BattleFX.cancel();
        let cancelled = false;
        const arena = arenaRef.current;
        const layer = createEffectLayer(fxContainerRef.current);
        const fx = layer.element;
        const rect = arena.getBoundingClientRect();
        const hero = arena.querySelector('.capture-trainer')?.getBoundingClientRect();
        const present = capturePresentation.success && capturePresentation.duplicate ? CaptureFX.quick : CaptureFX.play;
        present(arena, fx, target, {
            ball: capturePresentation.ball,
            speed: capturePresentation.speed,
            shakes: capturePresentation.shakes,
            success: capturePresentation.success,
            name: enemy ? getPokemonSpecies(enemy.speciesId).name : undefined,
            from: hero ? { x: hero.right - rect.left - hero.width * .2, y: hero.top - rect.top + hero.height * .3 } : undefined,
        }).then(() => {
            if (!cancelled)
                finishCapturePresentation(capturePresentation.key);
        })
            .catch((error) => {
            console.warn('Capture presentation failed:', error);
            if (!cancelled)
                finishCapturePresentation(capturePresentation.key);
        });
        return () => {
            cancelled = true;
            layer.dispose();
            target.getAnimations().forEach(animation => animation.cancel());
            if (!capturePresentation.success) {
                target.style.opacity = '';
                target.style.visibility = '';
            }
        };
    }, [capturePresentation, finishCapturePresentation]);
    // Reset enemy visibility/opacity whenever a new enemy spawns, and animate trainer Pokéball send-out
    useEffect(() => {
        if (enemyMonRef.current) {
            enemyMonRef.current.style.opacity = '';
            enemyMonRef.current.style.visibility = '';
            enemyMonRef.current.style.transform = '';
            enemyMonRef.current.style.filter = '';
        }
        const sprite = enemySpriteRef.current;
        if (sprite) {
            sprite.style.opacity = '';
            sprite.style.visibility = '';
            sprite.style.transform = '';
            sprite.style.filter = '';
            if (activeTrainer && !bossIntroActive && enemy && enemy.currentHp > 0) {
                const bounceDur = Math.max(180, 360 / gameSpeed);
                const revealDur = Math.max(140, 260 / gameSpeed);
                if (arenaRef.current && fxContainerRef.current) {
                    const aRect = arenaRef.current.getBoundingClientRect();
                    const sRect = sprite.getBoundingClientRect();
                    const pix = CaptureFX.pix(fxContainerRef.current);
                    const cx = sRect.left - aRect.left + sRect.width / 2;
                    const cy = sRect.top - aRect.top + sRect.height / 2;
                    pix.ring(cx, cy, 46, bounceDur, pix.PAL.white);
                    pix.burst(cx, cy, 10, 1.8, { pal: pix.PAL.white, grav: 0.03 });
                }
                sprite.animate([
                    { transform: 'translateY(55%) scale(0.7, 0.5)', filter: 'brightness(0)', opacity: 0 },
                    { transform: 'translateY(-24%) scale(0.82, 1.25)', filter: 'brightness(0)', opacity: 1, offset: 0.45 },
                    { transform: 'translateY(0) scale(1.14, 0.88)', filter: 'brightness(0)', opacity: 1, offset: 0.75 },
                    { transform: 'translateY(0) scale(1)', filter: 'brightness(0)', opacity: 1 },
                ], { duration: bounceDur, easing: 'ease-out', fill: 'forwards' }).finished.then(() => {
                    if (!sprite.isConnected)
                        return;
                    sprite.animate([
                        { filter: 'brightness(0)' },
                        { filter: 'brightness(0) invert(1) drop-shadow(0 0 8px #fff)', offset: 0.35 },
                        { filter: 'none' },
                    ], { duration: revealDur, easing: 'ease-out', fill: 'forwards' });
                }).catch(() => { });
            }
        }
    }, [enemy?.uid, nodeType, bossIntroActive, encounter.encounterId]);
    // Recall fainted opponent trainer Pokémon into its Pokéball before sending out the next one
    useEffect(() => {
        if (!enemyRecalling || !enemySpriteRef.current)
            return;
        const sprite = enemySpriteRef.current;
        const dur = Math.max(120, 240 / gameSpeed);
        if (arenaRef.current && fxContainerRef.current) {
            const aRect = arenaRef.current.getBoundingClientRect();
            const sRect = sprite.getBoundingClientRect();
            const pix = CaptureFX.pix(fxContainerRef.current);
            pix.ring(sRect.left - aRect.left + sRect.width / 2, sRect.top - aRect.top + sRect.height / 2, 44, dur, pix.PAL.ball);
        }
        const anim = sprite.animate([
            { transform: 'scale(1)', filter: 'none', opacity: 1 },
            { transform: 'scale(1.1, 0.85)', filter: 'brightness(0) invert(1)', opacity: 1, offset: 0.35 },
            { transform: 'scale(0)', filter: 'brightness(0) invert(1)', opacity: 0 },
        ], { duration: dur, easing: 'ease-in', fill: 'forwards' });
        return () => {
            anim.cancel();
        };
    }, [enemyRecalling, encounter.encounterId]);
    // Recall active ally Pokémon into its Pokéball (Pokéball flies from Red -> ring/burst -> sprite shrinks into ball)
    useEffect(() => {
        if (!allyRecalling || !playerMonRef.current)
            return;
        const sprite = playerMonRef.current.querySelector('img.battle-sprite') as HTMLElement | null;
        if (!sprite)
            return;
        const totalDur = Math.max(200, 380 / gameSpeed);
        const flyDur = Math.round(totalDur * 0.45);
        const shrinkDur = totalDur - flyDur;
        let cancelled = false;
        let ballEl: HTMLImageElement | null = null;
        let spriteAnim: Animation | null = null;
        if (arenaRef.current && fxContainerRef.current) {
            const aRect = arenaRef.current.getBoundingClientRect();
            const sRect = sprite.getBoundingClientRect();
            const tx = sRect.left - aRect.left + sRect.width / 2;
            const ty = sRect.top - aRect.top + sRect.height * 0.55;
            const sx = -18;
            const sy = aRect.height * 0.65;
            const mx = (sx + tx) / 2;
            const my = Math.min(sy, ty) - 42;
            ballEl = document.createElement('img');
            ballEl.src = '/assets/items/poke-ball.png';
            ballEl.alt = '';
            Object.assign(ballEl.style, {
                position: 'absolute',
                left: '0',
                top: '0',
                width: '32px',
                height: '32px',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
                zIndex: '30',
            });
            fxContainerRef.current.appendChild(ballEl);
            const frames = Array.from({ length: 13 }, (_, idx) => {
                const t = idx / 12;
                const u = 1 - t;
                const x = u * u * sx + 2 * u * t * mx + t * t * tx;
                const y = u * u * sy + 2 * u * t * my + t * t * ty;
                return { transform: `translate(${x - 16}px, ${y - 16}px) rotate(${360 * t}deg)` };
            });
            const ballAnim = ballEl.animate(frames, { duration: flyDur, easing: 'linear', fill: 'forwards' });
            ballAnim.finished.then(() => {
                if (cancelled)
                    return;
                if (fxContainerRef.current) {
                    const pix = CaptureFX.pix(fxContainerRef.current);
                    pix.ring(tx, ty, 44, shrinkDur + 100, pix.PAL.ball);
                    pix.burst(tx, ty, 10, 1.9, { pal: pix.PAL.ball, grav: 0.04 });
                }
                spriteAnim = sprite.animate([
                    { transform: 'scaleX(-1) scale(1)', filter: 'brightness(0) invert(1)', opacity: 1 },
                    { transform: 'scaleX(-1) scale(1.12, 0.85)', filter: 'brightness(0) invert(1)', opacity: 1, offset: 0.35 },
                    { transform: 'scaleX(-1) scale(0)', filter: 'brightness(0) invert(1)', opacity: 0 },
                ], { duration: shrinkDur, easing: 'ease-in', fill: 'forwards' });
                if (ballEl) {
                    ballEl.animate([
                        { transform: `translate(${tx - 16}px, ${ty - 16}px) scale(1)`, opacity: 1 },
                        { transform: `translate(${sx - 16}px, ${sy - 16}px) scale(0.7)`, opacity: 0 },
                    ], { duration: shrinkDur, easing: 'ease-in', fill: 'forwards' });
                }
            }).catch(() => { });
        }
        return () => {
            cancelled = true;
            spriteAnim?.cancel();
            ballEl?.remove();
        };
    }, [allyRecalling, encounter.encounterId]);
    // Send out new ally Pokémon (Pokéball flies from Red -> burst -> new Pokémon expands from white flash)
    useEffect(() => {
        if (!allySendingOut || !playerMonRef.current)
            return;
        const sprite = playerMonRef.current.querySelector('img.battle-sprite') as HTMLElement | null;
        if (!sprite)
            return;
        const totalDur = Math.max(200, 400 / gameSpeed);
        const flyDur = Math.round(totalDur * 0.45);
        const popDur = totalDur - flyDur;
        let cancelled = false;
        let ballEl: HTMLImageElement | null = null;
        let spriteAnim: Animation | null = null;
        sprite.style.opacity = '0';
        if (arenaRef.current && fxContainerRef.current) {
            const aRect = arenaRef.current.getBoundingClientRect();
            const sRect = sprite.getBoundingClientRect();
            const tx = sRect.left - aRect.left + sRect.width / 2;
            const ty = sRect.top - aRect.top + sRect.height * 0.6;
            const sx = -18;
            const sy = aRect.height * 0.65;
            const mx = (sx + tx) / 2;
            const my = Math.min(sy, ty) - 46;
            ballEl = document.createElement('img');
            ballEl.src = '/assets/items/poke-ball.png';
            ballEl.alt = '';
            Object.assign(ballEl.style, {
                position: 'absolute',
                left: '0',
                top: '0',
                width: '32px',
                height: '32px',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
                zIndex: '30',
            });
            fxContainerRef.current.appendChild(ballEl);
            const frames = Array.from({ length: 13 }, (_, idx) => {
                const t = idx / 12;
                const u = 1 - t;
                const x = u * u * sx + 2 * u * t * mx + t * t * tx;
                const y = u * u * sy + 2 * u * t * my + t * t * ty;
                return { transform: `translate(${x - 16}px, ${y - 16}px) rotate(${540 * t}deg)` };
            });
            const ballAnim = ballEl.animate(frames, { duration: flyDur, easing: 'linear', fill: 'forwards' });
            ballAnim.finished.then(() => {
                if (cancelled)
                    return;
                ballEl?.remove();
                ballEl = null;
                sprite.style.opacity = '';
                if (fxContainerRef.current) {
                    const pix = CaptureFX.pix(fxContainerRef.current);
                    pix.ring(tx, ty, 48, popDur + 100, pix.PAL.ball);
                    pix.burst(tx, ty, 12, 2.2, { pal: pix.PAL.ball, grav: 0.04 });
                }
                spriteAnim = sprite.animate([
                    { transform: 'scaleX(-1) scale(0)', filter: 'brightness(0) invert(1)', opacity: 0 },
                    { transform: 'scaleX(-1) scale(1.14, 0.86)', filter: 'brightness(0) invert(1)', opacity: 1, offset: 0.55 },
                    { transform: 'scaleX(-1) scale(1)', filter: 'none', opacity: 1 },
                ], { duration: popDur, easing: 'ease-out', fill: 'forwards' });
            }).catch(() => { });
        }
        return () => {
            cancelled = true;
            sprite.style.opacity = '';
            spriteAnim?.cancel();
            ballEl?.remove();
        };
    }, [allySendingOut, encounter.encounterId]);
    // Authentic Pokémon Center HealFX sequence
    useEffect(() => {
        if (!healPresentation || !arenaRef.current || !fxContainerRef.current)
            return;
        BattleFX.cancel();
        let cancelled = false;
        const layer = createEffectLayer(arenaRef.current);
        const arena = layer.element;
        const fxLayer = createEffectLayer(fxContainerRef.current);
        const fx = fxLayer.element;
        nativeFxRuntime.onSkip = () => skipHeal();
        HealFX.play(arena, {
            fx,
            allies: null,
            count: party.length,
            slots: 6,
            title: `${currentChapter.name} Pokémon Center`,
            msg: 'Your team is in great shape!',
            speed: () => healPresentation.speed,
            onHeal: () => { },
        })
            .then(() => {
            if (!cancelled)
                finishHealPresentation(healPresentation.key);
        })
            .catch((error) => {
            console.warn('HealFX failed:', error);
            if (!cancelled)
                finishHealPresentation(healPresentation.key);
        });
        return () => {
            cancelled = true;
            nativeFxRuntime.onSkip = null;
            arena.style.visibility = '';
            arena.querySelectorAll('.heal-fx').forEach((el) => {
                el.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
                el.remove();
            });
            layer.dispose();
            fxLayer.dispose();
        };
    }, [healPresentation, finishHealPresentation, skipHeal]);
    // Authentic ItemFX sequence for '?' nodes, money drops, and item gifts
    useEffect(() => {
        if (!activeDrop || activeDrop.type === 'money-text' || !arenaRef.current)
            return;
        let cancelled = false;
        const layer = createEffectLayer(arenaRef.current);
        const arena = layer.element;
        const speed = activeDrop.speed || useGameStore.getState().gameSpeed;
        const runItemFx = activeDrop.type === 'money'
            ? ItemFX(arena, {
                money: true,
                name: activeDrop.title,
                message: `Found ${activeDrop.title}!`,
                speed,
            })
            : activeDrop.amount && activeDrop.amount > 1
                ? (ItemFX as any).drops(arena, {
                    items: [{
                            name: activeDrop.title,
                            src: activeDrop.iconUrl.replace(/^\//, ''),
                            n: activeDrop.amount,
                        }],
                    message: `Found ${activeDrop.title}!`,
                    speed,
                })
                : ItemFX(arena, {
                    name: activeDrop.title,
                    src: activeDrop.iconUrl.replace(/^\//, ''),
                    message: `Found ${activeDrop.title}!`,
                    speed,
                });
        runItemFx
            .then(() => {
            if (!cancelled)
                finishItemDrop(activeDrop.id);
        })
            .catch((error) => {
            console.warn('ItemFX failed:', error);
            if (!cancelled)
                finishItemDrop(activeDrop.id);
        });
        return () => {
            cancelled = true;
            arena.querySelectorAll('.berry-fx').forEach((el) => {
                el.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
                el.remove();
            });
            layer.dispose();
        };
    }, [activeDrop, finishItemDrop]);
}
