import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  BlendMode,
  LinearGradient,
  RadialGradient,
  Blur,
  vec,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

const STAR_COUNT = 80;
const MOON_RADIUS = 40;
const MOON_GLOW_RADIUS = 50;

type Star = {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinklePhase: number;
};

const generateStars = (): Star[] =>
  Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + 0.5,
    baseOpacity: Math.random() * 0.5 + 0.5,
    twinklePhase: Math.random() * Math.PI * 2,
  }));

const NightSky = ({ children }: { children?: React.ReactNode }) => {
  const stars = generateStars();
  const [moon, setMoon] = useState({ x: width / 2, y: height / 4 });
  const [meteorX, setMeteorX] = useState(-100);
  const [meteorOpacity, setMeteorOpacity] = useState(0);
  const [clock, setClock] = useState(0);

  useEffect(() => {
    let meteorStart = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - meteorStart;

      // Moon movement
      const angle = now / 30000;
      setMoon({
        x: (width / 2) + Math.cos(angle) * (width / 3),
        y: (height / 4) + Math.sin(angle) * (height / 6),
      });

      // Meteor animation
      if (elapsed > 6000) {
        meteorStart = now;
        setMeteorX(-100);
        setMeteorOpacity(1);
      } else {
        setMeteorX(-100 + (elapsed / 3000) * (width + 200));
        setMeteorOpacity(Math.max(0, 1 - elapsed / 3000));
      }

      // Star twinkling
      setClock(now / 1000);

      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height} color="#000015" />
        <Group>
          {stars.map((s, i) => (
            <Circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              color="white"
              opacity={s.baseOpacity * (0.7 + 0.3 * Math.sin(clock + s.twinklePhase))}
            />
          ))}
          <Group transform={[{ translateX: moon.x }, { translateY: moon.y }]}>
            <Circle
              cx={0}
              cy={0}
              r={MOON_GLOW_RADIUS}
              color="rgba(255,255,200,0.1)"
              style="fill"
            >
              <Blur blur={10} />
            </Circle>
            <Group blendMode={BlendMode.Difference}>
              <Circle
                cx={0}
                cy={0}
                r={MOON_RADIUS}
                color="rgba(255,255,200,0.9)"
              >
                <RadialGradient
                  c={vec(0, 0)}
                  r={MOON_RADIUS}
                  colors={['#FFFFC8', '#E0E0A0']}
                />
              </Circle>
              <Circle
                cx={MOON_RADIUS * 0.4}
                cy={0}
                r={MOON_RADIUS * 0.8}
                color="black"
              />
            </Group>
          </Group>
          <Group opacity={meteorOpacity}>
            <Rect
              x={meteorX}
              y={height / 5}
              width={100}
              height={3}
              transform={[{ rotate: Math.PI / 4 }]}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(100, 0)}
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)']}
              />
            </Rect>
            <Circle cx={meteorX} cy={height / 5} r={3} color="white" />
          </Group>
        </Group>
      </Canvas>
      {children}
    </>
  );
};

export default NightSky;