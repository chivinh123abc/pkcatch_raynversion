export type RuntimePhase = 'idle' | 'intro' | 'battle' | 'attack' | 'faint' | 'capture' | 'reward' | 'awaiting-continue' | 'recall' | 'heal' | 'item' | 'transition';
export interface RuntimeClock {
    now: () => number;
    setTimeout: (callback: () => void, milliseconds: number) => unknown;
    clearTimeout: (handle: unknown) => void;
}
export interface RuntimeDependencies {
    clock?: RuntimeClock;
    random?: () => number;
}
export interface RuntimeSnapshot {
    encounterId: number;
    phase: RuntimePhase;
    combatKey: number | null;
    captureKey: number | null;
    rewardsCommitted: number;
}
export interface RuntimeEvent {
    at: number;
    encounterId: number;
    event: string;
    key?: number | string;
    phase: RuntimePhase;
}
type OperationKind = 'combat' | 'capture';
interface Operation {
    key: number;
    encounterId: number;
    impacted: boolean;
    impact?: () => void;
    complete: () => void;
    cancelWatchdog: () => void;
}
export const systemClock: RuntimeClock = {
    now: () => Date.now(),
    setTimeout: (callback, milliseconds) => setTimeout(callback, milliseconds),
    clearTimeout: handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
};
/** Test/replay RNG; particles and other presentation noise do not consume this stream. */
export function seededRandom(seed: number): () => number {
    let value = seed >>> 0;
    return () => {
        value += 0x6d2b79f5;
        let n = Math.imul(value ^ value >>> 15, value | 1);
        n ^= n + Math.imul(n ^ n >>> 7, n | 61);
        return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
}
/** Owns encounter lifetime, cancellable work and at-most-once effects; no React/DOM/Zustand imports. */
export class GameplayRuntime {
    readonly clock: RuntimeClock;
    busy = false;
    context = { recoveringParty: false, returnToStartAfterHeal: false };
    private sequence = 0;
    private epoch = 0;
    private currentPhase: RuntimePhase = 'idle';
    private timers = new Map<number, {
        handle: unknown;
        tag?: string;
    }>();
    private operations = new Map<OperationKind, Operation>();
    private rewards = new Set<string>();
    private listeners = new Set<(snapshot: RuntimeSnapshot) => void>();
    private randomSource: () => number;
    private history: RuntimeEvent[] = [];
    constructor(dependencies: RuntimeDependencies = {}) {
        this.clock = dependencies.clock || systemClock;
        this.randomSource = dependencies.random || (() => Math.random());
    }
    now = () => this.clock.now();
    random = () => {
        const value = this.randomSource();
        if (!Number.isFinite(value) || value < 0 || value >= 1)
            throw new RangeError('Gameplay RNG must return a value in [0, 1).');
        return value;
    };
    nextId = () => ++this.sequence;
    get phase() { return this.currentPhase; }
    get encounterId() { return this.epoch; }
    get pendingTimers() { return this.timers.size; }
    events() { return this.history.slice(); }
    snapshot(): RuntimeSnapshot {
        return { encounterId: this.epoch, phase: this.currentPhase, combatKey: this.operations.get('combat')?.key ?? null, captureKey: this.operations.get('capture')?.key ?? null, rewardsCommitted: this.rewards.size };
    }
    subscribe(listener: (snapshot: RuntimeSnapshot) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
    private notify(event: string, key?: number | string) {
        this.history.push({ at: this.now(), encounterId: this.epoch, event, key, phase: this.currentPhase });
        if (this.history.length > 256)
            this.history.shift();
        const snapshot = this.snapshot();
        this.listeners.forEach(listener => listener(snapshot));
    }
    setPhase(phase: RuntimePhase) {
        if (phase !== this.currentPhase) {
            this.currentPhase = phase;
            this.notify('phase');
        }
    }
    beginEncounter(phase: RuntimePhase = 'battle') {
        // The epoch check also rejects a timer already queued when native cancellation races.
        this.epoch++;
        this.timers.forEach(timer => this.clock.clearTimeout(timer.handle));
        this.timers.clear();
        this.operations.clear();
        this.rewards.clear();
        this.context = { recoveringParty: false, returnToStartAfterHeal: false };
        this.busy = false;
        this.currentPhase = phase;
        this.notify('encounter');
        return this.epoch;
    }
    schedule(callback: () => void, milliseconds: number, tag?: string): () => void {
        const epoch = this.epoch, id = this.nextId();
        if (tag)
            this.cancelTag(tag);
        const handle = this.clock.setTimeout(() => {
            if (!this.timers.delete(id) || epoch !== this.epoch)
                return;
            callback();
        }, Math.max(0, milliseconds));
        this.timers.set(id, { handle, tag });
        return () => {
            const task = this.timers.get(id);
            if (task) {
                this.timers.delete(id);
                this.clock.clearTimeout(task.handle);
            }
        };
    }
    cancelTag(tag: string) {
        for (const [id, timer] of this.timers)
            if (timer.tag === tag) {
                this.timers.delete(id);
                this.clock.clearTimeout(timer.handle);
            }
    }
    lockFor(milliseconds: number) {
        this.busy = true;
        this.schedule(() => { this.busy = false; }, milliseconds, 'turn-cooldown');
    }
    hasOperation(kind: OperationKind) { return this.operations.has(kind); }
    beginOperation(kind: OperationKind, options: {
        impact?: () => void;
        complete: () => void;
        watchdogMs: number;
    }) {
        if (this.operations.size > 0)
            throw new Error(`An active ${kind} operation must finish before another begins.`);
        const key = this.nextId();
        const cancelWatchdog = this.schedule(() => { this.notify('watchdog', key); this.finish(kind, key); }, options.watchdogMs);
        this.operations.set(kind, { key, encounterId: this.epoch, impacted: false, impact: options.impact, complete: options.complete, cancelWatchdog });
        this.busy = true;
        this.currentPhase = kind === 'combat' ? 'attack' : 'capture';
        this.notify(`${kind}:begin`, key);
        return key;
    }
    impact(kind: OperationKind, key: number) {
        const operation = this.operations.get(kind);
        if (!operation || operation.key !== key || operation.encounterId !== this.epoch || operation.impacted)
            return false;
        operation.impacted = true;
        this.notify(`${kind}:impact`, key);
        if (operation.encounterId !== this.epoch || this.operations.get(kind) !== operation)
            return false;
        operation.impact?.();
        return true;
    }
    finish(kind: OperationKind, key: number) {
        const operation = this.operations.get(kind);
        if (!operation || operation.key !== key || operation.encounterId !== this.epoch)
            return false;
        this.impact(kind, key);
        // Impact may synchronously change encounter or finish the operation itself.
        if (this.operations.get(kind) !== operation || operation.encounterId !== this.epoch)
            return false;
        this.operations.delete(kind);
        operation.cancelWatchdog();
        this.currentPhase = kind === 'combat' ? 'battle' : 'reward';
        this.notify(`${kind}:finish`, key);
        if (operation.encounterId !== this.epoch)
            return false;
        operation.complete();
        return true;
    }
    commitReward(key: string, apply: () => void) {
        if (this.rewards.has(key))
            return false;
        this.rewards.add(key);
        this.notify('reward', key);
        apply();
        return true;
    }
}
