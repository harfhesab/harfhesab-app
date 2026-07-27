import React, { useMemo } from 'react';
import { Circle } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { peakYAt } from './sandMath';

// Darker, earthier tones — the previous pale-gold palette had too little
// contrast against the light glass tint (especially in the empty top
// chamber) and read as washed-out/blurry rather than distinct grains.
const PALETTE = ['#7c4a1e', '#8f5726', '#6b3c16', '#59300f'];

function Grain({ seed, clock, progress, geo, baseRadius, colorIndex }) {
  const speed = 0.55 + seed * 0.6; // loops/sec, varied so grains don't sync up
  const xJitter = (seed - 0.5) * geo.neckW * 0.6;

  const phase = (clockValue) => {
    'worklet';
    return ((clockValue / 1000) * speed + seed) % 1;
  };

  // Falls from the neck all the way down to the CURRENT top of the bottom
  // pile — not a fixed distance — so grains always visibly land on the
  // heap instead of vanishing partway down.
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
    const t = phase(clock.value);
    const fadeIn = Math.min(1, t / 0.12);
    const fadeOut = Math.min(1, (1 - t) / 0.15);
    return Math.min(fadeIn, fadeOut);
  }, [clock, progress]);

  const r = useMemo(() => baseRadius * (0.8 + seed * 0.4), [baseRadius, seed]);

  return <Circle cx={cx} cy={cy} r={r} color={PALETTE[colorIndex]} opacity={opacity} />;
}

export function SandStream({ count = 14, clock, progress, geo, baseRadius }) {
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
    />
  ));
}