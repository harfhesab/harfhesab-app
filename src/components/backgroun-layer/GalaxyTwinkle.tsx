// GalaxyTwinkle.tsx (fixed twinkle amplitude + no black dot)
import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  Canvas,
  Rect,
  LinearGradient,
  vec,
  Circle,
  RadialGradient,
  Group,
} from "@shopify/react-native-skia";

type Star = {
  id: string;
  x: number; // نسبی 0..1
  y: number; // نسبی 0..1
  r: number; // radius in px (base)
  baseOpacity: number; // 0..1
  twinklePhase: number; // for offsetting sine
  twinkleSpeed: number; // twinkle speed multiplier
  hue: number; // color hue
  twinkleActive: boolean;
  twinkleStart: number;
};

type NebulaCircle = {
  x: number;
  y: number;
  relR: number;
  inner: string;
  mid: string | null;
  positions: number[];
};

interface Props {
  children?: React.ReactNode;
  starCount?: number;
  nebula?: boolean;
  backgroundColors?: string[];
  style?: any;
}

function GalaxyTwinkle({
  children,
  starCount = 140,
  nebula = true,
  backgroundColors = ["#05010f", "#0a0733", "#120426"],
  style,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: starCount }).map(() => {
        const isSmall = Math.random() < 0.8;
        const r = isSmall ? Math.random() * 0.8 + 0.4 : Math.random() * 1.6 + 1.2;
        return {
          id: Math.random().toString(36).slice(2, 9),
          x: Math.random(),
          y: Math.random(),
          r,
          baseOpacity: 0.2 + Math.random() * 0.8,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.8 + Math.random() * 1.2, // کمی سریع‌تر پیش‌فرض
          hue: 200 + Math.random() * 120, // blue → purple range
          twinkleActive: false,
          twinkleStart: 0,
        };
      }),
    [starCount]
  );

  const NEBULA_COUNT = 15;

  const nebulaCircles = useMemo<NebulaCircle[]>(
    () =>
      Array.from({ length: NEBULA_COUNT }).map(() => {
        const x = Math.random();
        const y = Math.pow(Math.random(), 0.7);
        const relR = Math.random() * 0.15 + 0.1;

        const colorChoices = [
          { inner: "rgba(200,100,255,0.18)", mid: "rgba(120,50,200,0.05)", positions: [0, 0.6, 1] },
          { inner: "rgba(80,200,255,0.16)", mid: "rgba(30,110,200,0.09)", positions: [0, 0.55, 1] },
          { inner: "rgba(255,200,140,0.08)", mid: null, positions: [0, 1] },
          { inner: "rgba(255,100,200,0.15)", mid: "rgba(200,50,150,0.04)", positions: [0, 0.6, 1] },
          { inner: "rgba(255,50,50,0.12)", mid: "rgba(200,0,0,0.06)", positions: [0, 0.55, 1] },
          { inner: "rgba(100,255,200,0.10)", mid: "rgba(50,200,150,0.05)", positions: [0, 0.6, 1] },
          { inner: "rgba(255,150,50,0.14)", mid: "rgba(200,100,0,0.07)", positions: [0, 0.55, 1] },
          { inner: "rgba(255,255,150,0.09)", mid: null, positions: [0, 1] },
        ];

        const choice = colorChoices[Math.floor(Math.random() * colorChoices.length)];

        return { x, y, relR, ...choice };
      }),
    []
  );

  const [tick, setTick] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(Date.now());

  const [twinklingStars, setTwinklingStars] = useState<Star[]>(stars);

  useEffect(() => {
    let twinkleTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleTwinkle = () => {
      const delay = 700 + Math.random() * 900; // a bit faster scheduling
      twinkleTimeout = setTimeout(() => {
        setTwinklingStars((prevStars) => {
          const newStars = [...prevStars];
          const twinkleCount = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
          const indices = new Set<number>();
          while (indices.size < twinkleCount && indices.size < newStars.length) {
            indices.add(Math.floor(Math.random() * newStars.length));
          }
          const now = Date.now();
          indices.forEach((index) => {
            newStars[index] = {
              ...newStars[index],
              twinkleActive: true,
              twinkleStart: now,
            };
          });
          return newStars;
        });
        scheduleTwinkle();
      }, delay);
    };

    scheduleTwinkle();

    return () => {
      if (twinkleTimeout) clearTimeout(twinkleTimeout);
    };
  }, [starCount]);

  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setTick((t) => t + dt);

      setTwinklingStars((prevStars) => {
        const newStars = [...prevStars];
        let changed = false;
        const nowMs = Date.now();
        for (let i = 0; i < newStars.length; i++) {
          const star = newStars[i];
          if (star.twinkleActive && star.twinkleStart) {
            const elapsed = (nowMs - star.twinkleStart) / 1000;
            // duration تابعی از سایز: ستاره‌های بزرگتر طولانی‌تر می‌زنند
            const duration = 0.6 + star.r * 0.8; // ~0.6..2.4s برای خیلی بزرگ (معمولاً کوتاه‌تر)
            if (elapsed > duration) {
              newStars[i] = { ...star, twinkleActive: false, twinkleStart: 0 };
              changed = true;
            }
          }
        }
        return changed ? newStars : prevStars;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => {
      if (prev.width !== width || prev.height !== height) return { width, height };
      return prev;
    });
  };

  const colorFromHue = (h: number, alpha = 1) =>
    alpha === 1 ? `hsl(${h}deg 90% 70%)` : `hsla(${h}, 90%, 70%, ${alpha})`;

  const { width, height } = size;
  const minDim = Math.min(width || 0, height || 0);

  return (
    <View style={[styles.wrapper, style]} onLayout={onLayout}>
      {width > 0 && height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient start={vec(width * 0.2, 0)} end={vec(width * 0.8, height)} colors={backgroundColors} />
          </Rect>

          {nebula && (
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
          )}

          <Group>
            {twinklingStars.map((s) => {
              const cx = s.x * width;
              const cy = s.y * height;

              // پایهٔ flick خیلی ملایم برای "نفس" ستاره‌ها
              const flick = 0.75 + 0.25 * Math.sin(tick * s.twinkleSpeed + s.twinklePhase);
              let opacity = Math.max(0, Math.min(1, s.baseOpacity * flick));

              // اگر twinkleActive باشه => پالس قوی‌تر و تک‌سویه (فقط نیمهٔ مثبت سینوس)
              if (s.twinkleActive && s.twinkleStart) {
                const elapsed = (Date.now() - s.twinkleStart) / 500; // sec
                const wave = Math.sin(Math.PI * elapsed * s.twinkleSpeed + s.twinklePhase);
                const pulse = Math.max(0, wave); // نیم‌چرخهٔ مثبت => پالس (0..1)
                // amplitude و offset بزرگتر برای محسوس بودن
                opacity = Math.max(0, Math.min(1, s.baseOpacity * (0.3 + 1.5 * pulse)));
              }

              const haloR = s.r * 2.6;

              // برای جلوگیری از نقطهٔ سیاه: از Group opacity استفاده می‌کنیم و گرادیانت مرکزی را با سفید شروع می‌کنیم
              return (
                <Group key={s.id}>
                  {/* گروه با opacity هسته (همان رفتار قبلی) */}
                  <Group opacity={opacity}>
                    <Circle cx={cx} cy={cy} r={s.r * 2.6 /* gradient radius, بیشتر از هسته */}>
                      <RadialGradient
                        c={vec(cx, cy)}
                        r={s.r * 2.6}
                        colors={[
                          "rgba(255,255,255,1)",    // مرکز کامل سفید
                          "rgba(255,255,255,0.55)", // میانه — هاله نرم
                          "rgba(255,255,255,0.06)", // دور هاله خیلی ضعیف
                          "rgba(255,255,255,0)"     // شفاف کامل در انتها
                        ]}
                        positions={[0, 0.08, 0.25, 1]}
                      />
                    </Circle>
                    {/* هسته کوچکِ سفیدِ متمرکز (برای درخشندگی مرکزی) */}
                    <Circle cx={cx} cy={cy} r={s.r}>
                      <RadialGradient
                        c={vec(cx, cy)}
                        r={s.r * 1.05}
                        colors={["rgba(255,255,255,1)", "rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
                        positions={[0, 0.4, 1]}
                      />
                    </Circle>
                  </Group>
                </Group>
              );
            })}
          </Group>
        </Canvas>
      )}

      <View style={StyleSheet.absoluteFill}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    alignSelf: "stretch",
  },
});

const areEqual = () => {
  return true;
};
export default memo(GalaxyTwinkle, areEqual)
