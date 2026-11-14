/** Native FX can defer sprite work past a cancellation. Keep those callbacks scoped. */
export class EffectTimers {
  private handles = new Set<ReturnType<typeof setTimeout>>();
  private generation = 0;
  schedule = (callback: () => void, milliseconds: number) => {
    const generation = this.generation;
    const handle = setTimeout(() => {
      this.handles.delete(handle);
      if (generation === this.generation) callback();
    }, milliseconds);
    this.handles.add(handle);
    return handle;
  };
  cancel() {
    this.generation++;
    this.handles.forEach(clearTimeout);
    this.handles.clear();
  }
}
