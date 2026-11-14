/** Late native particle callbacks may still run, but can only touch this detached layer. */
export function createEffectLayer(parent: HTMLElement) {
  const element = document.createElement('div');
  element.dataset.effectLayer = '';
  Object.assign(element.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
  parent.appendChild(element);
  return {
    element,
    dispose() {
      element.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      element.remove();
    },
  };
}
