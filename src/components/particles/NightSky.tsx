import React, { useEffect, useMemo, useState, memo } from 'react';
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  LinearGradient,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import Meteor from './components/Meteor';
import Moon from './components/Moon';

const screenHeight = Dimensions.get("screen").height;
const {width} = Dimensions.get("screen");
const statusBarHeight = StatusBar.currentHeight ?? 0;
const height = screenHeight - statusBarHeight;

const STAR_COUNT = 180;

const generateStars = () =>
  Array.from({ length: STAR_COUNT }, () => {
    const isSmall = Math.random() < 0.8;
    const r = isSmall
      ? Math.random() * 0.7 + 0.5
      : Math.random() * 1.2 + 1.3;

    const colorChoices = [
      'rgba(255,255,255,1)',
      'rgba(255, 251, 234, 0.9)',
      'rgba(235, 243, 255, 0.9)',
      'rgba(255, 255, 251, 0.8)',
    ];

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r,
      baseOpacity: Math.random() * 0.3 + 0.6,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.3 + Math.random() * 0.7,
      twinkleActive: false,
      twinkleStart: 0,
      color: colorChoices[Math.floor(Math.random() * colorChoices.length)],
      id: Math.random().toString(36).substring(2, 11),
    };
  });

type MeteorType = {
  active: boolean;
  startX: number;
  startY: number;
  angle: number;
  id: string;
};

const getRandomAngle = () => {
  let angle = 0;
  while (
    Math.abs(Math.cos(angle)) > 0.95 ||
    Math.abs(Math.sin(angle)) > 0.95
  ) {
    angle = Math.random() * 2 * Math.PI;
  }
  return angle;
};

const NightSky: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const stars = useMemo(generateStars, []);
  const [meteors, setMeteors] = useState<MeteorType[]>([]);
  const [twinklingStars, setTwinklingStars] = useState(stars);

  useEffect(() => {
    let lastMeteorTime = Date.now();

    let animationFrameId: number;

    const loop = () => {
      const now = Date.now();
      const elapsed = now - lastMeteorTime;

      if (elapsed > 5000) {
        lastMeteorTime = now;

        // شهاب اول
        setMeteors((prev) => [
          ...prev,
          {
            active: true,
            startX: Math.random() * width,
            startY: Math.random() * height * 0.5,
            angle: getRandomAngle(),
            id: Math.random().toString(36).substring(2, 11),
          },
        ]);

        // شهاب دوم با تأخیر اختیاری
        if (Math.random() < 0.1) {
          const delay = 1000 + Math.random() * 500;
          setTimeout(() => {
            setMeteors((prev) => [
              ...prev,
              {
                active: true,
                startX: Math.random() * width,
                startY: Math.random() * height * 0.5,
                angle: getRandomAngle(),
                id: Math.random().toString(36).substring(2, 11),
              },
            ]);
          }, delay);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);



  useEffect(() => {
    let rafId: number;
    let twinkleTimeout: ReturnType<typeof setTimeout>;

    const scheduleTwinkle = () => {
      const delay = 1000 + Math.random() * 1000;
      twinkleTimeout = setTimeout(() => {
        setTwinklingStars((prevStars) => {
          const newStars = [...prevStars];
          const twinkleCount = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
          const indices = new Set<number>();
          while (indices.size < twinkleCount && indices.size < STAR_COUNT) {
            indices.add(Math.floor(Math.random() * STAR_COUNT));
          }
          indices.forEach((index) => {
            newStars[index] = {
              ...newStars[index],
              twinkleActive: true,
              twinkleStart: Date.now(),
            };
          });
          return newStars;
        });
        scheduleTwinkle();
      }, delay);
    };

    const animate = () => {
      const now = Date.now();
      setTwinklingStars((prevStars) => {
        const newStars = [...prevStars];
        newStars.forEach((star, index) => {
          if (star.twinkleActive) {
            const elapsed = Date.now() - star.twinkleStart;
            const t = elapsed / 1000;
            if (t > 1) {
              newStars[index] = { ...star, twinkleActive: false };
            }
          }
        });
        return newStars;
      });

      rafId = requestAnimationFrame(animate);
    };

    scheduleTwinkle();
    rafId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(twinkleTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleAnimationEnd = (id: string) => {
    setMeteors((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={['#000000', '#020213']}
          />
        </Rect>

        <Group>
          {twinklingStars.map((s, i) => {
            let opacity = s.baseOpacity;

            if (s.twinkleActive) {
              const elapsed = Date.now() - s.twinkleStart;
              const t = elapsed / 1000;
              opacity = s.baseOpacity * (0.7 + 0.3 * Math.sin(Math.PI * t * s.twinkleSpeed + s.twinklePhase));
            }

            return (
              <Circle
                key={`star-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r * 2.5}
                opacity={opacity}
              >
                <RadialGradient
                  c={vec(s.x, s.y)}
                  r={s.r * 1.2}
                  colors={[s.color, s.color, 'rgba(255,255,255,0)']}
                  positions={[0, 0.4, 1]}
                />
              </Circle>
            );
          })}
          <Moon />
          {meteors.map((meteor) => (
            <Meteor
              key={meteor.id}
              meteor={meteor}
              onAnimationEnd={() => handleAnimationEnd(meteor.id)}
            />
          ))}
        </Group>
      </Canvas>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
    </View>
  );
};
const areEqual = (prevProps:any, nextProps:any) => {
  if (prevProps.children !== nextProps.children) return false;
  return true;
};
export default memo(NightSky, areEqual);