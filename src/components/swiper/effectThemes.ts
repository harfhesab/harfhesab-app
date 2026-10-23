/**
 * Art direction for each living-image effect (not tied to seasons).
 * Sizes / speeds are authored for a 340px-wide image and scaled automatically.
 *
 * Rule of thumb: NO full-image color washes. Light is only allowed where it
 * belongs (a small glow in a corner, thin beams), so the original art keeps its colors.
 */

export type EffectKind = 'leaves' | 'petals' | 'sunlight' | 'fireflies';

export const EFFECT_KINDS: readonly EffectKind[] = ['leaves', 'petals', 'sunlight', 'fireflies'];

export type ParticleKind = 'dot' | 'leaf' | 'petal' | 'bokeh';

type Range = [number, number];

export interface ParticleLayerSpec {
    kind: ParticleKind;
    count: number;
    size: Range; // radius, px
    speed: Range; // px/s, positive = falls, negative = rises
    sway: Range; // horizontal sway amplitude, px
    swayFreq: Range; // rad/s
    wind: Range; // horizontal drift, px/s
    alpha: Range;
    colors: string[];
    spin?: Range; // rad/s (leaf / petal tumbling)
    twinkle?: number; // 0..1 depth of the alpha pulsing
    glow?: number; // halo radius multiplier for 'dot' (default 2.4)
}

export interface EffectTheme {
    layers: ParticleLayerSpec[]; // far → near
    vignette: { color: string; alpha: number };
    sun: { color: string; x: number; y: number; radius: number; alpha: number } | null;
    beams: { color: string; alpha: number; count: number } | null;
    camera: { zoom: number; duration: number };
    /** Thin wisps of air that glide across the picture with the gusts. */
    airflow: { count: number; alpha: number; color: string };
}

export const REF_WIDTH = 340;

export function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex: string, a: number): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}

export function parseEffect(value?: string | null): EffectKind | undefined {
    const v = value?.trim().toLowerCase() ?? '';
    return (EFFECT_KINDS as readonly string[]).includes(v) ? (v as EffectKind) : undefined;
}

export const EFFECT_THEMES: Record<EffectKind, EffectTheme> = {
    /* ------------------------ Green leaves, tumbling down ------------------------ */
    leaves: {
        layers: [
            { kind: 'leaf', count: 8, size: [3, 4.5], speed: [24, 40], sway: [14, 26], swayFreq: [0.9, 1.7], wind: [8, 16], alpha: [0.55, 0.75], colors: ['#4CAF3F', '#2E8B3A', '#6CC24A'], spin: [0.9, 2.4] },
            { kind: 'leaf', count: 10, size: [5, 8], speed: [32, 55], sway: [20, 38], swayFreq: [0.8, 1.6], wind: [10, 22], alpha: [0.85, 1], colors: ['#6CC24A', '#4CAF3F', '#8FD14F', '#2E8B3A', '#A3D93F', '#3F9E4A'], spin: [0.8, 2.2] },
            { kind: 'leaf', count: 3, size: [9, 13], speed: [60, 90], sway: [28, 46], swayFreq: [0.6, 1.2], wind: [16, 30], alpha: [0.92, 1], colors: ['#6CC24A', '#4CAF3F', '#8FD14F'], spin: [0.6, 1.6] },
        ],
        vignette: { color: '#000000', alpha: 0.16 },
        sun: null,
        beams: null,
        camera: { zoom: 0.22, duration: 17000 },
        airflow: { count: 14, alpha: 0.3, color: '#FFFFFF' },
    },

    /* ---------------------- Petals, bokeh and a little pollen --------------------- */
    petals: {
        layers: [
            { kind: 'bokeh', count: 6, size: [14, 26], speed: [-6, -2], sway: [6, 14], swayFreq: [0.3, 0.7], wind: [1, 4], alpha: [0.06, 0.13], colors: ['#FFFFFF', '#FFE6F0'], twinkle: 0.6 },
            { kind: 'dot', count: 28, size: [1.2, 2.2], speed: [-9, -3], sway: [4, 10], swayFreq: [0.5, 1.1], wind: [2, 6], alpha: [0.45, 0.8], colors: ['#FFFFFF', '#FFF3C4'], twinkle: 0.6 },
            { kind: 'petal', count: 20, size: [3, 4.8], speed: [16, 30], sway: [12, 22], swayFreq: [0.6, 1.2], wind: [8, 16], alpha: [0.7, 0.92], colors: ['#FFC8DD', '#FFE3EC', '#FFFFFF'], spin: [0.8, 2] },
            { kind: 'petal', count: 9, size: [5.5, 8.5], speed: [34, 54], sway: [18, 30], swayFreq: [0.5, 1], wind: [12, 22], alpha: [0.9, 1], colors: ['#FFB3D1', '#FFD6E6', '#FFFFFF'], spin: [0.6, 1.6] },
        ],
        vignette: { color: '#000000', alpha: 0.14 },
        sun: null,
        beams: null,
        camera: { zoom: 0.2, duration: 16000 },
        airflow: { count: 13, alpha: 0.28, color: '#FFFFFF' },
    },

    /* ----------------- Golden dust drifting up through soft light ------------------ */
    sunlight: {
        layers: [
            { kind: 'bokeh', count: 9, size: [12, 28], speed: [-5, -1], sway: [6, 14], swayFreq: [0.3, 0.7], wind: [1, 4], alpha: [0.06, 0.14], colors: ['#FFF2B8', '#FFFFFF', '#FFE08A'], twinkle: 0.5 },
            { kind: 'dot', count: 46, size: [1.2, 2.6], speed: [-16, -5], sway: [5, 12], swayFreq: [0.5, 1.3], wind: [2, 7], alpha: [0.45, 0.85], colors: ['#FFE9A0', '#FFF6CC', '#FFD36B'], twinkle: 0.7 },
            { kind: 'dot', count: 12, size: [2.2, 3.6], speed: [-20, -8], sway: [8, 18], swayFreq: [0.4, 1], wind: [3, 8], alpha: [0.6, 0.95], colors: ['#FFF1B0', '#FFFFFF'], twinkle: 0.6, glow: 3.4 },
        ],
        vignette: { color: '#000000', alpha: 0.14 },
        sun: { color: '#FFF4D6', x: 0.86, y: -0.05, radius: 0.5, alpha: 0.16 },
        beams: { color: '#FFF6DA', alpha: 0.11, count: 3 },
        camera: { zoom: 0.2, duration: 15000 },
        airflow: { count: 12, alpha: 0.26, color: '#FFF6DA' },
    },

    /* ---------------------- Fireflies wandering and glowing ------------------------ */
    fireflies: {
        layers: [
            { kind: 'dot', count: 18, size: [0.8, 1.4], speed: [-3, 3], sway: [6, 14], swayFreq: [0.4, 0.9], wind: [0, 2], alpha: [0.18, 0.34], colors: ['#FFFFFF'], twinkle: 0.4 },
            { kind: 'dot', count: 30, size: [1.8, 3.2], speed: [-6, 6], sway: [20, 40], swayFreq: [0.4, 0.9], wind: [0, 3], alpha: [0.8, 1], colors: ['#E6FF7A', '#C8F560', '#FFF59A'], twinkle: 0.85, glow: 4.5 },
            { kind: 'dot', count: 6, size: [3, 4.2], speed: [-5, 5], sway: [26, 46], swayFreq: [0.3, 0.7], wind: [0, 3], alpha: [0.85, 1], colors: ['#E6FF7A', '#FFF59A'], twinkle: 0.9, glow: 5.5 },
        ],
        vignette: { color: '#000000', alpha: 0.2 },
        sun: null,
        beams: null,
        camera: { zoom: 0.24, duration: 18000 },
        airflow: { count: 10, alpha: 0.2, color: '#DFF5C8' },
    },
};