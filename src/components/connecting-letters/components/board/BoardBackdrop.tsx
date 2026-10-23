import React, { memo, useMemo } from 'react';
import { BlurMask, Group, LinearGradient, RadialGradient, RoundedRect, rect, rrect, vec } from '@shopify/react-native-skia';
import { BOARD_RADIUS } from '../../constants/constants';
import { BOARD_COLORS } from '../../constants/theme';

interface Props {
  width: number;
  height: number;
}

/** «میزی» که کارت‌ها رویش شناورند: صفحه‌ی شیشه‌ای عمیق با درخشش نرم و قاب طلایی. */
function BoardBackdrop({ width, height }: Props) {
  const r = BOARD_RADIUS;
  const clip = useMemo(() => rrect(rect(0, 0, width, height), r, r), [width, height, r]);


  return (
    <Group>
      <RoundedRect x={0} y={0} width={width} height={height} r={r}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[`${BOARD_COLORS.backgroundTop}30`, `${BOARD_COLORS.backgroundBottom}30`]}
        />
      </RoundedRect>
      <Group clip={clip}>
        <RoundedRect x={0} y={0} width={width} height={height} r={r}>
          <RadialGradient
            c={vec(width / 2, height * 0.42)}
            r={Math.max(width, height) * 0.62}
            colors={[BOARD_COLORS.glow, BOARD_COLORS.glowEdge]}
          />
        </RoundedRect>

        <RoundedRect x={0} y={0} width={width} height={height} r={r}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width * 0.55, height * 0.55)}
            colors={['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0)']}
          />
        </RoundedRect>
        {/* سایه‌ی داخلی لبه‌ها به پنل عمق می‌دهد. */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={r}
          style="stroke"
          strokeWidth={16}
          color={BOARD_COLORS.vignette}
        >
          <BlurMask blur={10} style="normal" />
        </RoundedRect>
      </Group>
      <RoundedRect
        x={5}
        y={5}
        width={width - 10}
        height={height - 10}
        r={r - 5}
        style="stroke"
        strokeWidth={1}
        color={BOARD_COLORS.innerLine}
      />
      <RoundedRect x={1.5} y={1.5} width={width - 3} height={height - 3} r={r - 1.5} style="stroke" strokeWidth={3}>
        <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={[...BOARD_COLORS.rim, BOARD_COLORS.rim[0]]} />
      </RoundedRect>
    </Group>
  );
}

export default memo(BoardBackdrop);
