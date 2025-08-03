import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  LinearGradient,
  RadialGradient,
  Blur,
  vec,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

const STAR_COUNT = 100;
const MOON_RADIUS = 20;
const MOON_GLOW_RADIUS = 55;

const generateStars = () =>
  Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.2 + 0.6,
    baseOpacity: Math.random() * 0.3 + 0.7,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.5 + Math.random() * 0.5,
    twinkleActive: false,
    twinkleStart: 0,
    color: Math.random() < 0.3
      ? 'rgba(255,245,200,1)'
      : Math.random() < 0.6
      ? 'rgba(255,255,255,1)'
      : 'rgba(200,220,255,1)',
  }));

type Meteor = {
  active: boolean;
  startTime: number;
  startX: number;
  startY: number;
  angle: number;
};

const getRandomAngle = () => {
  // زاویه بین 0 تا 2π به جز زوایای خیلی صاف مثل 0, π, π/2, 3π/2
  let angle = 0;
  while (
    Math.abs(Math.cos(angle)) > 0.95 || // نزدیک به افقی کامل
    Math.abs(Math.sin(angle)) > 0.95    // نزدیک به عمودی کامل
  ) {
    angle = Math.random() * 2 * Math.PI;
  }
  return angle;
};

const NightSky = ({ children }: { children?: React.ReactNode }) => {
  const stars = useMemo(generateStars, []);
  const [moonX, setMoonX] = useState(width * 0.1);
  const [moonY, setMoonY] = useState(height / 20);
  const [clock, setClock] = useState(0);
  const [meteor, setMeteor] = useState<Meteor>({
    active: false,
    startTime: 0,
    startX: 0,
    startY: 0,
    angle: Math.PI / 4,
  });
  const [twinklingStars, setTwinklingStars] = useState(stars);

  useEffect(() => {
    let rafId: number;
    let meteorTimeout: ReturnType<typeof setTimeout>;
    let twinkleTimeout: ReturnType<typeof setTimeout>;
    let lastTime = Date.now();

    const scheduleNextMeteor = () => {
      const delay = 4000 + Math.random() * 6000;
      meteorTimeout = setTimeout(() => {
        setMeteor({
          active: true,
          startTime: Date.now(),
          startX: Math.random() * width,
          startY: Math.random() * height,
          angle: getRandomAngle(),
        });
        scheduleNextMeteor();
      }, delay);
    };

    const scheduleTwinkle = () => {
      const delay = 1000 + Math.random() * 1000;
      twinkleTimeout = setTimeout(() => {
        setTwinklingStars((prevStars) => {
          const newStars = [...prevStars];
          const twinkleCount = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
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
      const deltaTime = now - lastTime;
      lastTime = now;

      setClock((prev) => prev + deltaTime / 1000);

      setMoonX((prev) => {
        const next = prev + 0.002 * deltaTime;
        return next > width + MOON_GLOW_RADIUS ? -MOON_GLOW_RADIUS : next;
      });
      setMoonY((prev) => {
        const next = prev + 0.0005 * deltaTime;
        return next > width + MOON_GLOW_RADIUS ? -MOON_GLOW_RADIUS : next;
      });

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

    scheduleNextMeteor();
    scheduleTwinkle();
    rafId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(meteorTimeout);
      clearTimeout(twinkleTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const renderMeteor = () => {
    if (!meteor.active) return null;

    const elapsed = Date.now() - meteor.startTime;
    const t = elapsed / 1200;
    if (t > 1) return null;

    const distance = width * 0.5;
    const dx = distance * Math.cos(meteor.angle);
    const dy = distance * Math.sin(meteor.angle);
    const x = meteor.startX + t * dx;
    const y = meteor.startY + t * dy;
    const opacity = (1 - t) * 0.8;

    return (
      <Group opacity={opacity}>
        <Rect
          x={x}
          y={y}
          width={100}
          height={2}
          origin={vec(x, y)}
          transform={[{ rotate: meteor.angle }]}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(100, 0)}
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)']}
          />
          <Blur blur={2} />
        </Rect>
        <Circle cx={x} cy={y} r={2.5} color="white">
          <Blur blur={1} />
        </Circle>
      </Group>
    );
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
              opacity = s.baseOpacity * (0.6 + 0.4 * Math.sin(Math.PI * t));
            }
            return (
              <Circle
                key={`star-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                color={s.color}
                opacity={opacity}
              />
            );
          })}

          <Group transform={[{ translateX: moonX }, { translateY: moonY }]}>
            <Circle cx={0} cy={0} r={MOON_GLOW_RADIUS} color="rgba(255,245,200,0.2)">
              <Blur blur={20} />
            </Circle>
            <Circle r={MOON_RADIUS} c={vec(0, 0)} color="rgba(255,245,200,1)">
              <RadialGradient
                c={vec(0, 0)}
                r={MOON_RADIUS}
                colors={['rgba(255,245,200,1)', 'rgba(230,230,190,1)', 'rgba(200,200,170,0.9)']}
                positions={[0, 0.7, 1]}
              />
            </Circle>
          </Group>

          {renderMeteor()}
        </Group>
      </Canvas>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
    </View>
  );
};

export default NightSky;
