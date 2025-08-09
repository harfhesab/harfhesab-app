import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Rect, LinearGradient, vec, Shadow } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, useDerivedValue, Easing, withRepeat } from 'react-native-reanimated';

interface RotatingGradientLayerProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

const RotatingGradientLayer: React.FC<RotatingGradientLayerProps> = ({ width, height, children }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1
    );
  }, [rotation]);

  const gradientStart = useDerivedValue(() => {
    const angle = (rotation.value * Math.PI) / 180;
    return vec(width / 2 + (width / 2) * Math.cos(angle), height / 2 + (height / 2) * Math.sin(angle));
  }, [rotation, width, height]);

  const gradientEnd = useDerivedValue(() => {
    const angle = (rotation.value * Math.PI) / 180;
    return vec(width / 2 - (width / 2) * Math.cos(angle), height / 2 - (height / 2) * Math.sin(angle));
  }, [rotation, width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={['#EF4444', '#F97316', '#FBBF24', '#10B981']}
          />
          <Shadow dx={0} dy={0} blur={20} color="rgba(0, 0, 0, 0.3)" />
        </Rect>
      </Canvas>
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  childrenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RotatingGradientLayer;