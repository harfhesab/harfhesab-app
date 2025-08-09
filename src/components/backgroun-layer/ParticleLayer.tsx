import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Circle, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, useDerivedValue, Easing, withRepeat } from 'react-native-reanimated';

interface ParticleLayerProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

const ParticleLayer: React.FC<ParticleLayerProps> = ({ width, height, children }) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1
    );
  }, [animationProgress]);

  const particles = Array.from({ length: 20 }, (_, index) => ({
    x: useDerivedValue(() => {
      const t = animationProgress.value + index * 0.1;
      return width * (0.5 + 0.4 * Math.sin(t * Math.PI * 2));
    }, [animationProgress]),
    y: useDerivedValue(() => {
      const t = animationProgress.value + index * 0.1;
      return height * (0.5 + 0.4 * Math.cos(t * Math.PI * 2));
    }, [animationProgress]),
    opacity: useDerivedValue(() => {
      const t = animationProgress.value + index * 0.1;
      return 0.5 + 0.5 * Math.sin(t * Math.PI * 1.5);
    }, [animationProgress]),
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={['#1E3A8A', '#0F766E']}
          />
        </Rect>
        {particles.map((particle, index) => (
          <Circle
            key={index}
            cx={particle.x}
            cy={particle.y}
            r={5}
            color="#FBBF24"
            opacity={particle.opacity}
          />
        ))}
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

export default ParticleLayer;