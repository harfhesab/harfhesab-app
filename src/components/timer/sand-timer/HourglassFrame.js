import React from 'react';
import { Group, Path, RoundedRect, LinearGradient, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';

/**
 * Everything here is a STATIC shape (no per-frame recomputation) — the
 * wood caps, rods, and shadow never move, so drawing them costs nothing
 * beyond Skia's normal (very cheap) repaint of unchanged layers.
 */

export function HourglassBase({ geo, frameColor, frameColorDark }) {
  const { width, height, cx, bodyInset, topY, bottomY, capH } = geo;
  const rodW = Math.max(2, width * 0.022);
  const capOverhang = bodyInset * 0.5;
  const capLeft = cx - width / 2 + bodyInset * 0.4;
  const capWidth = width - bodyInset * 0.8;

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
        y={topY}
        width={rodW}
        height={bottomY - topY}
        r={rodW / 2}
        color={frameColorDark}
      />
      <RoundedRect
        x={width - bodyInset + capOverhang * 0.55}
        y={topY}
        width={rodW}
        height={bottomY - topY}
        r={rodW / 2}
        color={frameColorDark}
      />

      {/* bottom wood cap */}
      <RoundedRect x={capLeft} y={bottomY} width={capWidth} height={capH} r={capH * 0.4}>
        <LinearGradient
          start={vec(cx, bottomY )}
          end={vec(cx, bottomY + capH)}
          colors={[frameColor, frameColorDark]}
        />
      </RoundedRect>

      {/* top wood cap */}
      <RoundedRect x={capLeft} y={topY - capH} width={capWidth} height={capH} r={capH * 0.4}>
        <LinearGradient
          start={vec(cx, topY - capH)}
          end={vec(cx, topY - capH + capH)}
          colors={[frameColorDark, frameColor]}
        />
      </RoundedRect>
    </Group>
  );
}

export function HourglassGlass({ geo, glassTint }) {
  const { cx, topY, bottomY, neckY, width } = geo;
  return (
    <Group>
      {/* base translucent tint */}
      <Path path={geo.outer} color={glassTint} />

      {/* per-bulb radial shading, so each rounded chamber reads as a
          sphere/cylinder rather than a flat tinted shape */}
      <Path path={geo.outer}>
        <RadialGradient
          c={vec(cx, lerp(topY, neckY, 0.5))}
          r={(neckY - topY) * 0.95}
          colors={['rgba(255,255,255,0.22)', 'rgba(90,130,150,0.04)']}
        />
      </Path>
      <Path path={geo.outer}>
        <RadialGradient
          c={vec(cx, lerp(neckY, bottomY, 0.5))}
          r={(bottomY - neckY) * 0.95}
          colors={['rgba(255,255,255,0.16)', 'rgba(70,100,120,0.05)']}
        />
      </Path>

      {/* wide diagonal glossy highlight */}
      <Path path={geo.outer}>
        <LinearGradient
          start={vec(cx - width * 0.32, topY)}
          end={vec(cx + width * 0.38, bottomY)}
          colors={[
            'rgba(255,255,255,0.42)',
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0)',
          ]}
          positions={[0, 0.28, 0.5, 1]}
        />
      </Path>

      {/* thin secondary highlight streak — real glass usually shows two */}
      <Path path={geo.outer}>
        <LinearGradient
          start={vec(cx + width * 0.06, topY)}
          end={vec(cx + width * 0.14, bottomY)}
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
          positions={[0.55, 0.62, 0.7]}
        />
      </Path>

      {/* outer rim: soft dark edge suggesting glass thickness */}
      <Path
        path={geo.outer}
        style="stroke"
        strokeWidth={Math.max(2.2, width * 0.02)}
        color="rgba(35,65,80,0.3)"
      />
      {/* inner bright rim */}
      <Path
        path={geo.outer}
        style="stroke"
        strokeWidth={Math.max(1, width * 0.008)}
        color="rgba(255,255,255,0.55)"
      />
    </Group>
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
