import { CaptureFX } from './captureFxEngine';

export const nativeFxRuntime = {
  CaptureFX,
  onSkip: null as (() => void) | null,
  UI: {
    $: (selector: string, root: ParentNode = document) => root.querySelector(selector),
    $$: (selector: string, root: ParentNode = document) => Array.from(root.querySelectorAll(selector)),
    h: (html: string) => { const template = document.createElement('template'); template.innerHTML = html.trim(); return template.content.firstElementChild; },
    sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    fmt: (value: number) => value.toLocaleString(),
    skippable: (host: HTMLElement) => {
      const skip = nativeFxRuntime.onSkip;
      const button = document.createElement('button');
      button.className = 'fx-skip-btn'; button.textContent = 'SKIP ▸▸';
      const control = { skipped: false, hide: () => button.remove(), end: () => button.remove() };
      button.onclick = () => { control.skipped = true; skip?.(); };
      host.appendChild(button);
      return control;
    },
  },
  Sfx: new Proxy({} as Record<string, (...args: unknown[]) => void>, { get: () => () => {} }),
};
