import React, { useEffect, useMemo, useState, memo } from 'react';
import { Circle, Rect, Group, LinearGradient, Blur, vec } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, runOnJS, useDerivedValue } from 'react-native-reanimated';
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
  const progress = useSharedValue(0);
  const trailLength = useMemo(() => Math.floor(Math.random() * (250 - 150 + 1)) + 100, [meteor.active]);
  const [animatedState, setAnimatedState] = useState({
    x: meteor.startX,
    y: meteor.startY,
    opacity: 0.8,
    offsetX: -trailLength * Math.cos(meteor.angle),
    offsetY: -trailLength * Math.sin(meteor.angle),
  });

  // محاسبه مقادیر انیمیشن با useDerivedValue
  useDerivedValue(() => {
    const t = progress.value;
    const distance = width * 0.75;
    const dx = distance * Math.cos(meteor.angle);
    const dy = distance * Math.sin(meteor.angle);
    const x = meteor.startX + t * dx;
    const y = meteor.startY + t * dy;
    const opacity = (1 - t) * 0.8;
    const offsetX = -trailLength * Math.cos(meteor.angle);
    const offsetY = -trailLength * Math.sin(meteor.angle);

    // به‌روزرسانی state در رشته JS
    runOnJS(setAnimatedState)({ x, y, opacity, offsetX, offsetY });
  }, [meteor.active, meteor.angle, meteor.startX, meteor.startY, trailLength]);

  useEffect(() => {
    if (meteor.active) {
      progress.value = 0; // ریست انیمیشن
      progress.value = withTiming(
        1,
        { duration: 4000, easing: Easing.linear }, // افزایش مدت‌زمان به 4000ms
        () => {
          if (onAnimationEnd) {
            runOnJS(onAnimationEnd)();
          }
        }
      );
    }
  }, [meteor.active, onAnimationEnd]);

  if (!meteor.active) return null;

  const { x, y, opacity, offsetX, offsetY } = animatedState;

  return (
    <Group opacity={opacity}>
      <Rect
        x={x + offsetX}
        y={y + offsetY}
        width={trailLength}
        height={2}
        origin={vec(x + offsetX, y + offsetY)}
        transform={[{ rotate: meteor.angle }]}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(trailLength, 0)}
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,1)']}
        />
        <Blur blur={2} />
      </Rect>
      <Circle cx={x} cy={y} r={2.5} color="white">
        <Blur blur={1} />
      </Circle>
    </Group>
  );
};

export default memo(Meteor);