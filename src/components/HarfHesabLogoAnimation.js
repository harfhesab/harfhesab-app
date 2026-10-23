import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import {
  Blur,
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Image,
  LinearGradient,
  Mask,
  Oval,
  RadialGradient,
  Rect,
  SweepGradient,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/* ───────────────────────── ثابت‌ها ───────────────────────── */

const TAU = Math.PI * 2;
const LOOP_MS = 8000; // همه‌ی حرکت‌ها مضرب صحیحی از این چرخه‌اند ← حلقه‌ی بدون پرش
const CANVAS_SCALE = 2.6; // کمی بزرگ‌تر از قبل برای نور پهن‌تر
const RAY_COUNT = 12; // ۱۲ پره → چرخش ۶۰° در هر چرخه بی‌درز است
const PULSE_START = 0.55;
const PULSE_LEN = 0.25;

const DEFAULT_SOURCE = require("../assets/image/icon.png");

const DEFAULT_COLORS = {
  primary: "#FFB938", // حلقه‌ها، جرقه‌ها و موج
  secondary: "#5CE1E6", // جرقه‌ی دوم و حلقه‌ی بیرونی
  sunInner: "#FFD84A", // زرد خورشیدی (مرکز نور)
  sunOuter: "#FF8A1F", // نارنجی خورشیدی (لبه‌ی نور)
};

/* ───────────────────────── ابزارها ───────────────────────── */

const withAlpha = (hex, a) =>
  hex + Math.round(a * 255).toString(16).padStart(2, "0");

const seeded = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// پره‌های خورشیدی: هر پره یک تخت‌ی پهن زرد دارد که به نارنجی شفاف محو می‌شود
const makeSunRays = (rays, inner, outer, peak) => {
  const stops = [
    [0, outer, 0],
    [0.3, inner, peak],
    [0.55, inner, peak],
    [0.9, outer, 0],
  ];
  const colors = [];
  const positions = [];
  for (let i = 0; i < rays; i++) {
    for (const [p, c, a] of stops) {
      colors.push(withAlpha(c, a));
      positions.push((i + p) / rays);
    }
  }
  colors.push(withAlpha(outer, 0));
  positions.push(1);
  return { colors, positions };
};

/* ───────────────────────── زیرکامپوننت‌ها ───────────────────────── */

const GlowDot = memo(function GlowDot({ x, y, r, color }) {
  return (
    <Circle cx={x} cy={y} r={r}>
      <RadialGradient
        c={vec(x, y)}
        r={r}
        colors={["#FFFFFF", withAlpha(color, 0.85), withAlpha(color, 0)]}
        positions={[0, 0.25, 1]}
      />
    </Circle>
  );
});

const Ripple = memo(function Ripple({ progress, cx, cy, from, to, color, width }) {
  const r = useDerivedValue(() => {
    const p = Math.max(progress.value, 0);
    return from + (to - from) * (1 - Math.pow(1 - p, 3));
  });
  const opacity = useDerivedValue(() =>
    progress.value < 0 ? 0 : (1 - progress.value) * 0.75
  );
  const strokeWidth = useDerivedValue(
    () => width * (1 - Math.max(progress.value, 0) * 0.7)
  );

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      style="stroke"
      strokeWidth={strokeWidth}
      color={color}
      opacity={opacity}
    />
  );
});

const Spark = memo(function Spark({ t, live, cx, cy, index, minR, maxR, color }) {
  const cfg = useMemo(
    () => ({
      angle: seeded(index + 1) * TAU,
      speed: seeded(index + 50) > 0.5 ? 2 : 1,
      phase: seeded(index + 99),
      swirl: (seeded(index + 7) - 0.5) * 1.4,
      glow: 5 + seeded(index + 23) * 7,
    }),
    [index]
  );

  const progress = useDerivedValue(() => (t.value * cfg.speed + cfg.phase) % 1);

  const transform = useDerivedValue(() => {
    const p = progress.value;
    const a = cfg.angle + p * cfg.swirl;
    const d = minR + (maxR - minR) * p;
    return [
      { translateX: cx + Math.cos(a) * d },
      { translateY: cy + Math.sin(a) * d },
      { scale: 1 - p * 0.6 },
    ];
  });

  const opacity = useDerivedValue(
    () => Math.sin(Math.PI * progress.value) * live.value
  );

  return (
    <Group transform={transform} opacity={opacity}>
      <GlowDot x={0} y={0} r={cfg.glow} color={color} />
    </Group>
  );
});

/* ───────────────────────── کامپوننت اصلی ───────────────────────── */

function HarfHesabLogoAnimation({
  animate = true,
  size = 120,
  source = DEFAULT_SOURCE,
  colors = DEFAULT_COLORS,
  sparkCount = 14,
  onPress,
  onReady, // وقتی افکت‌های Skia کاملاً آماده شدند صدا زده می‌شود
}) {
  const reducedMotion = useReducedMotion();
  const skiaImage = useImage(source);

  const canvas = size * CANVAS_SCALE;
  const cx = canvas / 2;
  const cy = canvas / 2;
  const {
    primary = DEFAULT_COLORS.primary,
    secondary = DEFAULT_COLORS.secondary,
    sunInner = DEFAULT_COLORS.sunInner,
    sunOuter = DEFAULT_COLORS.sunOuter,
  } = colors;

  /* ---------- مقادیر اشتراکی ---------- */
  const t = useSharedValue(0);
  const enter = useSharedValue(0); // ورود افکت‌ها (نه خود لوگو)
  const handoff = useSharedValue(0); // ۰ = لوگوی نیتیو، ۱ = لوگوی Skia
  const live = useSharedValue(0);
  const tap = useSharedValue(1);
  const burst = useSharedValue(1);

  /* ---------- ۱) فریم اول: فقط لوگوی نیتیو؛ بوم Skia یک فریم بعد ساخته می‌شود ---------- */
  const [canvasMounted, setCanvasMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setCanvasMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- ۲) وقتی Skia آماده شد: تحویل بدون پرش + ورود افکت‌ها ---------- */
  const skiaReady = canvasMounted && !!skiaImage;
  useEffect(() => {
    if (!skiaReady) return;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        handoff.value = withTiming(1, { duration: 160 });
        enter.value = withTiming(1, {
          duration: 900,
          easing: Easing.out(Easing.cubic),
        });
        onReady?.();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [skiaReady, handoff, enter, onReady]);

  /* ---------- حلقه‌ی اصلی ---------- */
  useEffect(() => {
    const active = animate && !reducedMotion;
    live.value = withTiming(active ? 1 : 0, { duration: 400 });

    if (active) {
      t.value = 0;
      t.value = withRepeat(
        withTiming(1, { duration: LOOP_MS, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(t);
      t.value = 0;
    }
    return () => cancelAnimation(t);
  }, [animate, reducedMotion, t, live]);

  /* ---------- مشتق‌ها ---------- */

  const pulseP = useDerivedValue(() => {
    const u = (t.value - PULSE_START) / PULSE_LEN;
    return live.value > 0.5 && u >= 0 && u <= 1 ? u : -1;
  });
  const burstP = useDerivedValue(() => (burst.value >= 1 ? -1 : burst.value));

  // هاله‌ی نفس‌کش (مثل نسخه‌ی اول)
  const glowOpacity = useDerivedValue(
    () => enter.value * (0.85 + 0.15 * Math.sin(TAU * 2 * t.value))
  );
  const glowTransform = useDerivedValue(() => [
    {
      scale:
        (0.35 + 0.65 * enter.value) * (0.94 + 0.06 * Math.sin(TAU * 2 * t.value)),
    },
  ]);

  // پرتوهای چرخان
  const raysTransform = useDerivedValue(() => [{ rotate: (t.value * TAU) / 6 }]);
  const raysOpacity = useDerivedValue(() => enter.value * 0.9);

  const ringATransform = useDerivedValue(() => [{ rotate: t.value * TAU * 2 }]);
  const ringBTransform = useDerivedValue(() => [{ rotate: -t.value * TAU }]);
  const ringsOpacity = useDerivedValue(() => enter.value);

  const floatY = useDerivedValue(
    () => Math.sin(TAU * 2 * t.value) * size * 0.035 * live.value
  );

  // لوگو از همان ابتدا با اندازه‌ی کامل است
  const logoTransform = useDerivedValue(() => {
    const u = pulseP.value;
    const bump =
      u >= 0 && u < 0.35 ? Math.pow(Math.sin((Math.PI * u) / 0.35), 2) * 0.07 : 0;
    const tilt = Math.sin(TAU * t.value) * 0.06 * live.value;
    return [
      { translateY: floatY.value },
      { rotate: tilt },
      { scale: (1 + bump) * tap.value },
    ];
  });

  const shadowTransform = useDerivedValue(() => [
    { scaleX: 1 + floatY.value / (size * 0.5) },
  ]);

  const shineTransform = useDerivedValue(() => {
    const u = Math.max(pulseP.value, 0);
    return [{ translateX: -size * 0.9 + size * 1.8 * u }, { rotate: 0.35 }];
  });
  const shineOpacity = useDerivedValue(() =>
    pulseP.value < 0 ? 0 : Math.sin(Math.PI * pulseP.value) * 0.9
  );

  const placeholderStyle = useAnimatedStyle(() => ({
    opacity: 1 - handoff.value,
  }));

  /* ---------- مقادیر ثابت ---------- */
  const center = useMemo(() => vec(cx, cy), [cx, cy]);
  const sunRays = useMemo(
    () => makeSunRays(RAY_COUNT, sunInner, sunOuter, 0.8),
    [sunInner, sunOuter]
  );
  const sparks = useMemo(
    () => Array.from({ length: sparkCount }, (_, i) => i),
    [sparkCount]
  );

  const handlePress = useCallback(() => {
    burst.value = 0;
    burst.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
    tap.value = withSequence(
      withTiming(0.9, { duration: 90 }),
      withSpring(1, { damping: 7, stiffness: 180 })
    );
    onPress?.();
  }, [burst, tap, onPress]);

  const logoNode = skiaImage ? (
    <Image
      image={skiaImage}
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      fit="contain"
    />
  ) : null;

  const offset = (canvas - size) / 2;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="image"
      accessibilityLabel="Harf Hesab logo"
      style={{ width: canvas, height: canvas }}
    >
      {/* ───── افکت‌ها (Skia): یک فریم بعد از نمایش لوگو ساخته می‌شوند ───── */}
      {canvasMounted && (
        <Canvas style={{ position: "absolute", width: canvas, height: canvas }}>
          {/* 1) هاله‌ی خورشیدی: مرکز زرد → نارنجی → شفاف */}
          <Group origin={center} transform={glowTransform} opacity={glowOpacity}>
            <Circle cx={cx} cy={cy} r={size * 1.3}>
              <RadialGradient
                c={center}
                r={size * 1.3}
                colors={[
                  withAlpha(sunInner, 0.8),
                  withAlpha(sunOuter, 0.45),
                  withAlpha(sunOuter, 0.15),
                  withAlpha(sunOuter, 0),
                ]}
                positions={[0, 0.4, 0.75, 1]}
              />
            </Circle>
          </Group>

          {/* 2) پرتوهای پهن خورشیدی با محو شدن شعاعی */}
          <Mask
            mode="alpha"
            mask={
              <Circle cx={cx} cy={cy} r={canvas / 2}>
                <RadialGradient
                  c={center}
                  r={canvas / 2}
                  colors={["#000000FF", "#00000000"]}
                  positions={[0.15, 1]}
                />
              </Circle>
            }
          >
            <Group origin={center} transform={raysTransform} opacity={raysOpacity}>
              <Circle cx={cx} cy={cy} r={canvas / 2}>
                <SweepGradient
                  c={center}
                  colors={sunRays.colors}
                  positions={sunRays.positions}
                />
              </Circle>
            </Group>
          </Mask>

          {/* 3) حلقه‌های مداری */}
          <Group opacity={ringsOpacity}>
            <Group origin={center} transform={ringATransform}>
              <Circle
                cx={cx}
                cy={cy}
                r={size * 0.78}
                style="stroke"
                strokeWidth={1.2}
                color={withAlpha(primary, 0.4)}
              >
                <DashPathEffect intervals={[4, 10]} />
              </Circle>
              <GlowDot x={cx + size * 0.78} y={cy} r={9} color={primary} />
              <GlowDot x={cx - size * 0.78} y={cy} r={6} color={primary} />
            </Group>

            <Group origin={center} transform={ringBTransform}>
              <Circle
                cx={cx}
                cy={cy}
                r={size * 0.96}
                style="stroke"
                strokeWidth={1}
                color={withAlpha(secondary, 0.22)}
              />
              <GlowDot x={cx} y={cy + size * 0.96} r={11} color={secondary} />
            </Group>
          </Group>

          {/* 4) امواج انبساطی */}
          <Ripple
            progress={pulseP}
            cx={cx}
            cy={cy}
            from={size * 0.5}
            to={size * 1.05}
            color={primary}
            width={3}
          />
          <Ripple
            progress={burstP}
            cx={cx}
            cy={cy}
            from={size * 0.45}
            to={size * 1.1}
            color={secondary}
            width={4}
          />

          {/* 5) جرقه‌ها */}
          {sparks.map((i) => (
            <Spark
              key={i}
              t={t}
              live={live}
              cx={cx}
              cy={cy}
              index={i}
              minR={size * 0.45}
              maxR={size * 1.0}
              color={i % 2 === 0 ? primary : secondary}
            />
          ))}

          {/* 6) سایه */}
          <Group
            origin={vec(cx, cy + size * 0.67)}
            transform={shadowTransform}
            opacity={enter}
          >
            <Oval
              x={cx - size * 0.3}
              y={cy + size * 0.62}
              width={size * 0.6}
              height={size * 0.1}
              color="rgba(0,0,0,0.35)"
            >
              <Blur blur={size * 0.05} />
            </Oval>
          </Group>

          {/* 7) لوگوی Skia + برق نورانی */}
          {logoNode && (
            <Group origin={center} transform={logoTransform}>
              {logoNode}
              <Mask mode="alpha" mask={logoNode}>
                <Group origin={center} transform={shineTransform} opacity={shineOpacity}>
                  <Rect
                    x={cx - size * 0.12}
                    y={cy - size}
                    width={size * 0.24}
                    height={size * 2}
                  >
                    <LinearGradient
                      start={vec(cx - size * 0.12, 0)}
                      end={vec(cx + size * 0.12, 0)}
                      colors={["#FFFFFF00", "#FFFFFFE6", "#FFFFFF00"]}
                    />
                  </Rect>
                </Group>
              </Mask>
            </Group>
          )}
        </Canvas>
      )}

      {/* ───── لوگوی نیتیو: در همان فریم اول و بدون تأخیر دیده می‌شود ───── */}
      <Animated.Image
        source={source}
        fadeDuration={0}
        resizeMode="contain"
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: offset,
            top: offset,
            width: size,
            height: size,
          },
          placeholderStyle,
        ]}
      />
    </Pressable>
  );
}

export default memo(HarfHesabLogoAnimation);