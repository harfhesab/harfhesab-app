import React, { useMemo } from 'react';
import { Path, LinearGradient, RadialGradient, vec, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { lerp, rightEdgeBetween, edgeXAt, peakYAt } from './sandMath';
import { SandGrainTexture } from './SandTexture';

const SURFACE_POINTS = 9;

/**
 * Top pile: drains from full (surface at topY) to empty (surface at neckY).
 * The side edges trace the actual glass curve (via rightEdgeBetween)
 * instead of a straight line, so there's no gap between sand and glass.
 * The surface is a gentle multi-point wave that fades to zero right at the
 * walls and slowly drifts with `clock`.
 */
export function TopSandPile({ progress, geo, clock, colors }) {
  const phaseOffset = useMemo(() => Math.random() * 10, []);

  const path = useDerivedValue(() => {
    const remaining = 1 - progress.value;
    const surfaceY = lerp(geo.neckY, geo.topY, remaining);
    const edge = rightEdgeBetween(surfaceY, geo.neckY, geo);

    const rightAnchor = edge[0].x;
    const leftAnchor = 2 * geo.cx - rightAnchor;
    const span = rightAnchor - leftAnchor;
    const amplitude = Math.min(3.2, geo.width * 0.018) * Math.min(1, remaining * 4);
    const wavePhase = (clock.value / 1000) * 0.5 + phaseOffset;

    const p = Skia.Path.Make();
    for (let i = 0; i <= SURFACE_POINTS; i++) {
      const u = i / SURFACE_POINTS;
      const x = leftAnchor + u * span;
      const envelope = Math.sin(u * Math.PI); // 0 at the walls, 1 in the middle
      const wave = Math.sin(u * Math.PI * 3.2 + wavePhase) * amplitude * envelope;
      const y = surfaceY + wave;
      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    for (let i = 0; i < edge.length; i++) {
      p.lineTo(edge[i].x, edge[i].y);
    }
    p.lineTo(geo.cx - geo.neckW / 2, geo.neckY);
    for (let i = edge.length - 1; i >= 0; i--) {
      p.lineTo(2 * geo.cx - edge[i].x, edge[i].y);
    }
    p.close();
    return p;
  }, [progress, geo, clock]);

  return (
    <>
      <Path path={path}>
        <LinearGradient
          start={vec(geo.cx, geo.topY)}
          end={vec(geo.cx, geo.neckY)}
          colors={[colors[0], colors[1]]}
        />
      </Path>
      {/* volumetric shading — darker toward the funnel for a sense of depth */}
      <Path path={path} blendMode="multiply" opacity={0.32}>
        <RadialGradient
          c={vec(geo.cx, geo.neckY)}
          r={(geo.neckY - geo.topY) * 0.9}
          colors={['rgba(70,45,15,0.55)', 'rgba(70,45,15,0)']}
        />
      </Path>
      <SandGrainTexture path={path} seed={11} />
    </>
  );
}

/**
 * Bottom pile: fills from bottomY upward as progress goes 0 -> 1.
 *
 * Just like the top pile, the side walls trace the REAL glass curve (same
 * `rightEdgeBetween` helper, just spanning [surfaceY, bottomY] instead of
 * [surfaceY, neckY]) — so, by construction, there is never a gap between
 * the sand and the glass at any fill level. On top of that level surface
 * there's a small wave plus a modest central mound (representing where the
 * stream is actively landing), which fades out as the chamber nears full.
 */
export function BottomSandPile({ progress, geo, clock, colors }) {
  const phaseOffset = useMemo(() => Math.random() * 10, []);

  const path = useDerivedValue(() => {
    const g = progress.value;
    const surfaceY = peakYAt(g, geo); // rises from bottomY (empty) to neckY (full)
    const edge = rightEdgeBetween(surfaceY, geo.bottomY, geo);

    const rightAnchor = edgeXAt(surfaceY, geo).right;
    const leftAnchor = 2 * geo.cx - rightAnchor;
    const span = rightAnchor - leftAnchor;

    const wavePhase = (clock.value / 1000) * 0.4 + phaseOffset;
    const smallAmp = Math.min(2.6, geo.width * 0.015);
    const centerAmp = Math.min(7, (geo.bottomY - geo.neckY) * 0.1) * (1 - g * 0.55);

    const p = Skia.Path.Make();
    for (let i = 0; i <= SURFACE_POINTS; i++) {
      const u = i / SURFACE_POINTS;
      const x = leftAnchor + u * span;
      const envelope = Math.sin(u * Math.PI);
      const wave = Math.sin(u * Math.PI * 3 + wavePhase) * smallAmp * envelope;
      const bumpD = (u - 0.5) * 3.4;
      const centerBump = Math.exp(-(bumpD * bumpD)) * centerAmp;
      let y = surfaceY - wave - centerBump;
      if (y < geo.neckY + 1) y = geo.neckY + 1; // never poke above the neck opening
      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    // down the right wall, following the real glass curve, to the bottom
    for (let i = 1; i < edge.length; i++) {
      p.lineTo(edge[i].x, edge[i].y);
    }
    // straight across the bottom (the actual glass bottom edge is straight too)
    const bottomRight = edge[edge.length - 1];
    p.lineTo(2 * geo.cx - bottomRight.x, bottomRight.y);
    // back up the left wall (mirrored) to the surface
    for (let i = edge.length - 2; i >= 0; i--) {
      p.lineTo(2 * geo.cx - edge[i].x, edge[i].y);
    }
    p.close();
    return p;
  }, [progress, geo, clock]);

  return (
    <>
      <Path path={path}>
        <LinearGradient
          start={vec(geo.cx, geo.neckY)}
          end={vec(geo.cx, geo.bottomY)}
          colors={[colors[1], colors[2]]}
        />
      </Path>
      {/* volumetric shading — soft light near the surface, darker toward the base */}
      <Path path={path} blendMode="multiply" opacity={0.28}>
        <RadialGradient
          c={vec(geo.cx, geo.bottomY)}
          r={(geo.bottomY - geo.neckY) * 1.1}
          colors={['rgba(60,35,10,0.5)', 'rgba(255,235,190,0.18)']}
        />
      </Path>
      <SandGrainTexture path={path} seed={37} />
    </>
  );
}