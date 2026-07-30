import React, { useMemo } from 'react';
import { Circle, Path, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { peakYAt } from './sandMath';

// Darker, earthier tones — the previous pale-gold palette had too little
// contrast against the light glass tint (especially in the empty top
// chamber) and read as washed-out/blurry rather than distinct grains.
const PALETTE = ['#7c4a1e', '#8f5726', '#6b3c16', '#59300f'];

/**
 * A thin, continuous sand-colored thread from the neck down to the current
 * pile surface. Real hourglasses read as a near-solid line of sand, not
 * sparse individual grains — this fills that gap cheaply (one path + one
 * gradient, recomputed every frame just like everything else here) while
 * the individual grains on top still sell the motion/texture.
 */
export function SandStreamLine({ geo, progress, pausedSV, color = '#8f5726' }) {
  // Static shape — computed once, not every frame. It intentionally
  // extends all the way down to bottomY; it doesn't need to track the
  // mound's wavy surface at all, because it's drawn BEHIND the bottom pile
  // (see SandTimer.js render order) — the pile simply paints over whatever
  // portion of the line falls "inside" it. This is exact by construction,
  // regardless of the wave's phase, with zero extra math.
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    const half = Math.max(0.8, geo.neckW * 0.16);
    const taperY = geo.neckY + geo.neckW * 1.1;

    p.moveTo(geo.cx - geo.neckW / 2, geo.neckY);
    p.lineTo(geo.cx + geo.neckW / 2, geo.neckY);
    p.lineTo(geo.cx + half, taperY);
    p.lineTo(geo.cx + half, geo.bottomY);
    p.lineTo(geo.cx - half, geo.bottomY);
    p.lineTo(geo.cx - half, taperY);
    p.close(); // tapers the left side back up to the start automatically
    return p;
  }, [geo]);

  const opacity = useDerivedValue(() => {
    if (progress.value >= 1) return 0; // finished
    if (pausedSV && pausedSV.value) return 0; // flow stops while paused
    return 1;
  }, [progress, pausedSV]);

  return (
    <Path path={path} opacity={opacity}>
      <LinearGradient
        start={vec(geo.cx, geo.neckY)}
        end={vec(geo.cx, geo.bottomY)}
        colors={[`${color}CC`, `${color}66`]}
      />
    </Path>
  );
}

function Grain({ seed, clock, progress, geo, baseRadius, colorIndex, pausedSV }) {
  const speed = 0.55 + seed * 0.6; // loops/sec, varied so grains don't sync up
  const xJitter = (seed - 0.5) * geo.neckW * 0.6;

  const phase = (clockValue) => {
    'worklet';
    return ((clockValue / 1000) * speed + seed) % 1;
  };

  // Falls from the neck all the way down to the CURRENT top of the bottom
  // pile — not a fixed distance — so grains always visibly land on the
  // heap instead of vanishing partway down. Any residual mismatch (e.g.
  // from the mound's wave) is also covered for free since the bottom pile
  // is drawn AFTER the grains (see SandTimer.js render order).
  const cy = useDerivedValue(() => {
    if (progress.value >= 1) return -1000; // park off-screen once finished
    const peakY = peakYAt(progress.value, geo);
    const dist = Math.max(1, peakY - geo.neckY);
    const t = phase(clock.value);
    return geo.neckY + t * dist;
  }, [clock, progress, geo]);

  const cx = useDerivedValue(() => {
    const t = phase(clock.value);
    // slight sideways scatter as it nears the pile, like a real landing spread
    return geo.cx + xJitter * Math.min(1, t * 1.4);
  }, [clock, geo]);

  const opacity = useDerivedValue(() => {
    if (progress.value >= 1) return 0;
    if (pausedSV && pausedSV.value) return 0; // flow stops while paused
    const t = phase(clock.value);
    const fadeIn = Math.min(1, t / 0.12);
    const fadeOut = Math.min(1, (1 - t) / 0.15);
    return Math.min(fadeIn, fadeOut);
  }, [clock, progress, pausedSV]);

  const r = useMemo(() => baseRadius * (0.8 + seed * 0.4), [baseRadius, seed]);

  return <Circle cx={cx} cy={cy} r={r} color={PALETTE[colorIndex]} opacity={opacity} />;
}

export function SandStream({ count = 14, clock, progress, geo, baseRadius, pausedSV }) {
  const seeds = useMemo(() => Array.from({ length: count }, () => Math.random()), [count]);

  return seeds.map((seed, i) => (
    <Grain
      key={i}
      seed={seed}
      clock={clock}
      progress={progress}
      geo={geo}
      baseRadius={baseRadius}
      colorIndex={i % PALETTE.length}
      pausedSV={pausedSV}
    />
  ));
}