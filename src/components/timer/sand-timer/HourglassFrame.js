import React from 'react';
import { Group, Path, RoundedRect, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';

/**
 * Everything here is a STATIC shape (no per-frame recomputation) — the
 * wood caps, rods, and shadow never move, so drawing them costs nothing
 * beyond Skia's normal (very cheap) repaint of unchanged layers.
 */

export function HourglassBase({ geo, frameColor, frameColorDark }) {
  const { width, height, cx, bodyInset, topY, bottomY, capH } = geo;
  const rodW = Math.max(2, width * 0.022);
  const capOverhang = bodyInset * 0.5;
  const capLeft = cx - width / 2 + bodyInset * 0.12;
  const capWidth = width - bodyInset * 0.24;

  return (
    <Group>
      {/* soft ground shadow */}
      <RoundedRect
        x={cx - width * 0.3}
        y={bottomY + capH * 0.75}
        width={width * 0.6}
        height={height * 0.055}
        r={height * 0.025}
        color="rgba(0,0,0,0.25)"
      >
        <BlurMask blur={height * 0.02} style="normal" />
      </RoundedRect>

      {/* support rods */}
      <RoundedRect
        x={bodyInset - capOverhang * 0.55 - rodW}
        y={topY + capH * 0.2}
        width={rodW}
        height={bottomY - topY - capH * 0.4}
        r={rodW / 2}
        color={frameColorDark}
      />
      <RoundedRect
        x={width - bodyInset + capOverhang * 0.55}
        y={topY + capH * 0.2}
        width={rodW}
        height={bottomY - topY - capH * 0.4}
        r={rodW / 2}
        color={frameColorDark}
      />

      {/* bottom wood cap */}
      <RoundedRect x={capLeft} y={bottomY - capH * 0.2} width={capWidth} height={capH} r={capH * 0.4}>
        <LinearGradient
          start={vec(cx, bottomY - capH * 0.2)}
          end={vec(cx, bottomY - capH * 0.2 + capH)}
          colors={[frameColor, frameColorDark]}
        />
      </RoundedRect>

      {/* top wood cap */}
      <RoundedRect x={capLeft} y={topY - capH * 0.8} width={capWidth} height={capH} r={capH * 0.4}>
        <LinearGradient
          start={vec(cx, topY - capH * 0.8)}
          end={vec(cx, topY - capH * 0.8 + capH)}
          colors={[frameColorDark, frameColor]}
        />
      </RoundedRect>
    </Group>
  );
}

export function HourglassGlass({ geo, glassTint }) {
  const { cx, topY, bottomY, width } = geo;
  return (
    <Group>
      <Path path={geo.outer} color={glassTint} />
      {/* diagonal glossy highlight for a "glass" feel */}
      <Path path={geo.outer}>
        <LinearGradient
          start={vec(cx - width * 0.32, topY)}
          end={vec(cx + width * 0.38, bottomY)}
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
          positions={[0, 0.4, 1]}
        />
      </Path>
      <Path
        path={geo.outer}
        style="stroke"
        strokeWidth={Math.max(1.4, width * 0.013)}
        color="rgba(255,255,255,0.5)"
      />
    </Group>
  );
}
