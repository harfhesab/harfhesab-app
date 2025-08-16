import React, { memo } from 'react';
import { Dimensions } from 'react-native';
import {
  Circle,
  Group,
  RadialGradient,
  Blur,
  vec,
} from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, useFrameCallback } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const MOON_RADIUS = 20;
const MOON_GLOW_RADIUS = 55;

const Moon: React.FC = () => {
  const moonX = useSharedValue(60);
  const moonY = useSharedValue(80);
  useFrameCallback((frameInfo) => {
    const delta = frameInfo.timeSincePreviousFrame ?? 0;
    moonX.value += 0.001 * delta;
    if (moonX.value > width + MOON_GLOW_RADIUS) {
      moonX.value = -MOON_GLOW_RADIUS;
    }
    moonY.value += 0.0005 * delta;
    if (moonY.value > height + MOON_GLOW_RADIUS) {
      moonY.value = -MOON_GLOW_RADIUS;
    }
  });

  const moonTransform = useDerivedValue(
    () => [{translateX: moonX.value}, {translateY: moonY.value} ],
    [moonX, moonY]
  )

  

  return (
    <Group transform={moonTransform}>
        <Circle cx={0} cy={0} r={MOON_GLOW_RADIUS} color="rgba(255,245,200,0.2)">
            <Blur blur={20} />
        </Circle>
        <Circle r={MOON_RADIUS} c={vec(0, 0)} color="rgba(255,245,200,1)">
            <RadialGradient
            c={vec(0, 0)}
            r={MOON_RADIUS}
            colors={['rgba(255,245,200,1)', 'rgba(255,245,200,0.9)', 'rgba(255,245,200,0.75)', 'rgba(255,255,255,0)']}
            positions={[0, 0.8, 0.9, 1]}
            />
        </Circle>
    </Group>
  );
};
const areEqual = () => true;
export default memo(Moon, areEqual);