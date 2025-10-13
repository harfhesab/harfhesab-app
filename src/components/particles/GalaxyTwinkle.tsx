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

const screenHeight = Dimensions.get("screen").height;
const {width} = Dimensions.get("screen");
const statusBarHeight = StatusBar.currentHeight ?? 0;
const height = screenHeight - statusBarHeight;

const STAR_COUNT = 180;

type NebulaCircle = {
  x: number;
  y: number;
  relR: number;
  inner: string;
  mid: string | null;
  positions: number[];
};

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

const GalaxyTwinkle: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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


  const NEBULA_COUNT = 15;
  
  const nebulaCircles = useMemo<NebulaCircle[]>(
    () =>
      Array.from({ length: NEBULA_COUNT }).map(() => {
        const x = Math.random();
        const y = Math.random();
        const relR = Math.random() * 0.15 + 0.1;

        const colorChoices = [
          { inner: "rgba(200,100,255,0.14)", mid: "rgba(120,50,200,0.06)", positions: [0, 0.6, 1] },
          { inner: "rgba(80,200,255,0.13)", mid: "rgba(30,110,200,0.08)", positions: [0, 0.55, 1] },
          { inner: "rgba(255,200,140,0.08)", mid: "rgba(200,150,100,0.05)", positions: [0, 0.4, 1] },
          { inner: "rgba(255,100,200,0.13)", mid: "rgba(200,50,150,0.06)", positions: [0, 0.6, 1] },
          { inner: "rgba(255,50,50,0.10)", mid: "rgba(200,0,0,0.07)", positions: [0, 0.55, 1] },
          { inner: "rgba(100,255,200,0.10)", mid: "rgba(50,200,150,0.05)", positions: [0, 0.6, 1] },
          { inner: "rgba(255,150,50,0.11)", mid: "rgba(200,100,0,0.08)", positions: [0, 0.55, 1] },
          { inner: "rgba(255,255,150,0.08)", mid: "rgba(200,200,100,0.04)", positions: [0, 0.65, 1] },
          { inner: "rgba(150,255,100,0.11)", mid: "rgba(100,200,50,0.07)", positions: [0, 0.4, 1] },
          { inner: "rgba(255,80,150,0.12)", mid: "rgba(200,30,100,0.05)", positions: [0, 0.65, 1] },
        ];

        const choice = colorChoices[Math.floor(Math.random() * colorChoices.length)];

        return { x, y, relR, ...choice };
      }),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient start={vec(width * 0.2, 0)} end={vec(width * 0.8, height)} colors={["#05010f", "#08062c", "#120426"]} />
        </Rect>

        <Group>
          {nebulaCircles.map((nc, i) => {
            const cx = width * nc.x;
            const cy = height * nc.y;
            const r = Math.min(width, height) * nc.relR;
            const colors = nc.mid ? [nc.inner, nc.mid, "rgba(0,0,0,0)"] : [nc.inner, "rgba(0,0,0,0)"];
            return (
              <Circle key={i} cx={cx} cy={cy} r={r}>
                <RadialGradient c={vec(cx, cy)} r={r} colors={colors} positions={nc.positions} />
              </Circle>
            );
          })}
        </Group>

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
export default memo(GalaxyTwinkle, areEqual);