import React, { useMemo } from 'react';
import { Path, Skia, Shader } from '@shopify/react-native-skia';

/**
 * A tiny hash-noise fragment shader that outputs a near-1.0 grayscale
 * multiplier per pixel (roughly 0.82–1.1), i.e. "grain". It's meant to be
 * multiplied over an already gradient-filled sand shape to fake a granular
 * texture WITHOUT drawing thousands of individual particles.
 *
 * Cost-wise this is effectively free: it's evaluated per-pixel on the GPU
 * at raster time, completely separate from the JS/UI-thread work that
 * drives the countdown — it doesn't scale with grainCount or frame rate
 * the way more particles would.
 */
const GRAIN_SKSL = `
uniform float u_seed;

half4 main(float2 pos) {
  float2 p = floor(pos / 1.6);
  float n = fract(sin(dot(p, float2(12.9898, 78.233)) + u_seed) * 43758.5453);
  float grain = mix(0.82, 1.1, n);
  return half4(grain, grain, grain, 1.0);
}
`;

// Cached lazily, once, across all instances.
let cachedEffect; // undefined = not attempted yet, null = attempted & failed

function getGrainEffect() {
  if (cachedEffect !== undefined) return cachedEffect;
  try {
    cachedEffect = Skia.RuntimeEffect.Make(GRAIN_SKSL) || null;
  } catch (e) {
    cachedEffect = null;
  }
  return cachedEffect;
}

/**
 * Draws an extra multiply-blended noise layer over `path`.
 *
 * IMPORTANT — honesty note: this shader was written carefully but has not
 * been run/tested (no RN device available in this environment). It's
 * designed to fail SAFELY: if `Skia.RuntimeEffect.Make` throws or returns
 * null for any reason (e.g. an older Skia build), this component simply
 * renders nothing and the sand pile still looks correct with its normal
 * gradient fill — nothing crashes. If you see it not appear at all, that's
 * this fallback working as intended; let me know and I'll adjust the SkSL.
 */
export function SandGrainTexture({ path, seed = 1, opacity = 0.45 }) {
  const effect = useMemo(() => getGrainEffect(), []);
  if (!effect) return null;

  return (
    <Path path={path} blendMode="multiply" opacity={opacity}>
      <Shader source={effect} uniforms={{ u_seed: seed }} />
    </Path>
  );
}
