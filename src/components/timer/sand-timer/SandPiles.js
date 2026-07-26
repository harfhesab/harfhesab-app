import React from 'react';
import { Path, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { lerp, rightEdgeBetween, peakYAt } from './sandMath';

/**
 * Top pile: drains from full (surface at topY) to empty (surface at neckY).
 * Its side edges trace the actual glass curve (via rightEdgeBetween) rather
 * than a straight line, so there's no visible gap between the sand and the
 * glass wall as it drains.
 */
export function TopSandPile({ progress, geo, colors }) {
  const path = useDerivedValue(() => {
    const remaining = 1 - progress.value;
    const surfaceY = lerp(geo.neckY, geo.topY, remaining);
    const edge = rightEdgeBetween(surfaceY, geo.neckY, geo);

    const p = Skia.Path.Make();
    const start = edge[0];
    p.moveTo(2 * geo.cx - start.x, start.y); // flat poured-sand surface, left point
    p.lineTo(start.x, start.y); // ...to right point
    for (let i = 1; i < edge.length; i++) {
      p.lineTo(edge[i].x, edge[i].y); // down the right wall, following the curve
    }
    p.lineTo(geo.cx - geo.neckW / 2, geo.neckY); // across the neck
    for (let i = edge.length - 1; i >= 0; i--) {
      p.lineTo(2 * geo.cx - edge[i].x, edge[i].y); // back up the left wall
    }
    p.close();
    return p;
  }, [progress, geo]);

  return (
    <Path path={path}>
      <LinearGradient
        start={vec(geo.cx, geo.topY)}
        end={vec(geo.cx, geo.neckY)}
        colors={[colors[0], colors[1]]}
      />
    </Path>
  );
}

/**
 * Bottom pile: a rounded heap that grows upward and widens with progress.
 * It's deliberately allowed to grow slightly wider than the chamber — the
 * parent's `<Group clip={geo.outer}>` then trims it to the real glass
 * silhouette for free, which is cheaper and more accurate than manually
 * intersecting the heap shape with the curve.
 */
export function BottomSandPile({ progress, geo, colors }) {
  const path = useDerivedValue(() => {
    const g = progress.value;
    const peakY = peakYAt(g, geo);
    const maxHalf = (geo.width / 2 - geo.bodyInset) * 1.15;
    const baseHalf = lerp(geo.neckW * 0.55, maxHalf, g);

    const p = Skia.Path.Make();
    p.moveTo(geo.cx - baseHalf, geo.bottomY);
    p.quadTo(
      geo.cx - baseHalf * 0.35, peakY + (geo.bottomY - peakY) * 0.22,
      geo.cx, peakY
    );
    p.quadTo(
      geo.cx + baseHalf * 0.35, peakY + (geo.bottomY - peakY) * 0.22,
      geo.cx + baseHalf, geo.bottomY
    );
    p.close();
    return p;
  }, [progress, geo]);

  return (
    <Path path={path}>
      <LinearGradient
        start={vec(geo.cx, geo.neckY)}
        end={vec(geo.cx, geo.bottomY)}
        colors={[colors[1], colors[2]]}
      />
    </Path>
  );
}
