/**
 * Retro 4x4 Bayer Dither Transition
 * Trích xuất 100% từ engine nguyên bản app.f9da276408.js (function Me)
 * Tạo hiệu ứng dither ô cờ pixel art quét chéo chuyển cảnh cực mượt
 */
const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export interface DitherOptions {
  color?: string;
  sweep?: 'diag' | 'iris' | 'none';
  cell?: number;
  durationMs?: number;
  onMidpoint?: () => void;
}

export function runDitherTransition(
  container: HTMLElement,
  options: DitherOptions = {}
): Promise<void> {
  const {
    color = '#0b0d14',
    sweep = 'diag',
    cell = 4,
    durationMs = 450,
    onMidpoint,
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.dataset.transition = 'dither';
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (onMidpoint) onMidpoint();
      resolve();
      return;
    }

    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.ceil(rect.width / cell));
    const h = Math.max(1, Math.ceil(rect.height / cell));
    canvas.width = w;
    canvas.height = h;

    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      imageRendering: 'pixelated',
      pointerEvents: 'none',
      zIndex: '45',
    });

    container.appendChild(canvas);

    const matrix = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const b = (BAYER_4X4[(y & 3) * 4 + (x & 3)] + Math.random()) / 16;
        matrix[y * w + x] =
          sweep === 'diag'
            ? b * 0.3 + ((x / w + y / h) / 2) * 0.7
            : sweep === 'iris'
            ? b * 0.3 + (1 - Math.min(1, Math.hypot((x / w - 0.5) * 1.6, y / h - 0.5) / 0.8)) * 0.7
            : b;
      }
    }

    const render = (threshold: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (matrix[y * w + x] < threshold) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    };

    const startTime = performance.now();
    const halfDuration = durationMs / 2;
    let midpointFired = false;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < halfDuration) {
        // Phase 1: Wipe into black
        const progress = Math.min(1, elapsed / halfDuration);
        render(progress);
        requestAnimationFrame(tick);
      } else if (elapsed < durationMs) {
        // Midpoint: switch state/content behind the black veil
        if (!midpointFired) {
          midpointFired = true;
          if (onMidpoint) onMidpoint();
        }
        // Phase 2: Wipe out from black back to clear
        const progress = Math.max(0, 1 - (elapsed - halfDuration) / halfDuration);
        render(progress);
        requestAnimationFrame(tick);
      } else {
        if (!midpointFired && onMidpoint) onMidpoint();
        canvas.remove();
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}
