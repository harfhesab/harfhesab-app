import React, { memo, useEffect } from 'react';
import {
  Circle,
  Rect,
  Group,
  LinearGradient,
  Blur,
  vec,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface MeteorProps {
  meteor: {
    active: boolean;
    startX: number;
    startY: number;
    angle: number;
    id: string;
  };
  onAnimationEnd?: () => void;
}

const Meteor: React.FC<MeteorProps> = ({ meteor, onAnimationEnd }) => {
  // طول نهایی دنباله (رندوم بین 150 تا 250)
  const maxTrailLength = useSharedValue(
    Math.floor(Math.random() * (250 - 150 + 1)) + 150
  );

  const progress = useSharedValue(0);
  const opacity = useDerivedValue(() => (1 - progress.value) * 0.8);

  // طول دنباله به‌مرور با progress افزایش پیدا می‌کنه
  const trailLength = useDerivedValue(() => {
    // تا progress به 0.3 برسه، طول دنباله از 0 به maxTrailLength می‌رسه
    const lengthProgress = Math.min(progress.value / 0.3, 1);
    return maxTrailLength.value * lengthProgress;
  });

  const distance = width * 0.75;
  const dx = distance * Math.cos(meteor.angle);
  const dy = distance * Math.sin(meteor.angle);

  const x = useDerivedValue(() => meteor.startX + dx * progress.value);
  const y = useDerivedValue(() => meteor.startY + dy * progress.value);

  const headX = useDerivedValue(() => x.value + trailLength.value * Math.cos(meteor.angle));
  const headY = useDerivedValue(() => y.value + trailLength.value * Math.sin(meteor.angle));

  useEffect(() => {
    if (meteor.active) {
      progress.value = 0;
      progress.value = withTiming(
        1,
        { duration: 4000, easing: Easing.linear },
        (finished) => {
          if (finished && onAnimationEnd) {
            runOnJS(onAnimationEnd)();
          }
        }
      );
    }
  }, [meteor.active, meteor.id]);

  if (!meteor.active) return null;

  return (
    <Group opacity={opacity}>
      <Rect
        x={x}
        y={y}
        origin={useDerivedValue(() => vec(x.value, y.value))}
        width={trailLength}
        height={2}
        transform={[{ rotate: meteor.angle }]}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={useDerivedValue(() => vec(trailLength.value, 0))}
          colors={[
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.5)',
            'rgba(255,255,255,1)',
          ]}
        />
        <Blur blur={2} />
      </Rect>

      <Circle cx={headX} cy={headY} r={2.5} color="white">
        <Blur blur={1} />
      </Circle>
    </Group>
  );
};

const areEqual = () => true;
export default memo(Meteor, areEqual);