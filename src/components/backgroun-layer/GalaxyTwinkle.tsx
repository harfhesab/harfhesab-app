import React, { useEffect, useMemo, useRef, useState, memo, forwardRef } from "react";
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
import { useSharedValue, useDerivedValue, useFrameCallback } from "react-native-reanimated";

type Star = {
  id: string;
  x: number; // relative 0..1
  y: number; // relative 0..1
  r: number; // radius in px (base)
  baseOpacity: number; // 0..1
  twinklePhase: number; // for offsetting sine
  twinkleSpeed: number; // twinkle speed multiplier
  color: string;
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

const StarComponent = forwardRef(({ s, time, sinWorklet, width, height }: { s: Star; time: any; sinWorklet: any; width: number; height: number }, ref: any) => {
  const active = useSharedValue(0);
  const twinkleStart = useSharedValue(0);

  const opacity = useDerivedValue(() => {
    let op = s.baseOpacity;
    if (active.value === 1) {
      const elapsed = time.value - twinkleStart.value;
      if (elapsed > 1) {
        active.value = 0;
      } else {
        const sinVal = sinWorklet(Math.PI * elapsed * s.twinkleSpeed + s.twinklePhase);
        op *= (0.7 + 0.3 * sinVal);
      }
    }
    return op;
  }, []);

  React.useImperativeHandle(ref, () => ({
    activate: () => {
      twinkleStart.value = time.value;
      active.value = 1;
    },
  }));

  const cx = s.x * width;
  const cy = s.y * height;

  return (
    <Circle cx={cx} cy={cy} r={s.r * 2.5} opacity={opacity}>
      <RadialGradient
        c={vec(cx, cy)}
        r={s.r * 1.2}
        colors={[s.color, s.color, "rgba(255,255,255,0)"]}
        positions={[0, 0.4, 1]}
      />
    </Circle>
  );
});

const MemoStar = memo(StarComponent);

function GalaxyTwinkle({
  children,
  starCount = 150,
  nebula = true,
  backgroundColors = ["#05010f", "#0a0733", "#120426"],
  style,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const time = useSharedValue(0);

  useFrameCallback((frame) => {
    const dt = frame.timeSincePreviousFrame ?? 0;
    time.value += dt / 1000;
  });

  const sinWorklet = (x: number) => {
    "worklet";
    const PI = 3.141592653589793;
    const TWO_PI = 2 * PI;
    x = x % TWO_PI;
    if (x < -PI) x += TWO_PI;
    if (x > PI) x -= TWO_PI;

    const x2 = x * x;
    const x3 = x2 * x;
    const x5 = x3 * x2;
    const x7 = x5 * x2;
    const x9 = x7 * x2;
    const x11 = x9 * x2;
    const x13 = x11 * x2;

    return (
      x -
      x3 / 6 +
      x5 / 120 -
      x7 / 5040 +
      x9 / 362880 -
      x11 / 39916800 +
      x13 / 6227020800
    );
  };

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: starCount }).map(() => {
        const isSmall = Math.random() < 0.8;
        const r = isSmall ? Math.random() * 0.7 + 0.5 : Math.random() * 1.2 + 1.3;
        const colorChoices = [
          "rgba(255,255,255,1)",
          "rgba(255, 251, 234, 0.9)",
          "rgba(235, 243, 255, 0.9)",
          "rgba(255, 255, 251, 0.8)",
        ];
        return {
          id: Math.random().toString(36).slice(2, 9),
          x: Math.random(),
          y: Math.random(),
          r,
          baseOpacity: Math.random() * 0.3 + 0.6,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.3 + Math.random() * 0.7,
          color: colorChoices[Math.floor(Math.random() * colorChoices.length)],
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

  const starRefs = useRef<any[]>([]);

  useEffect(() => {
    starRefs.current = new Array(starCount).fill(null);
  }, [starCount]);

  useEffect(() => {
    let twinkleTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleTwinkle = () => {
      const delay = 1000 + Math.random() * 1000;
      twinkleTimeout = setTimeout(() => {
        const twinkleCount = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
        const indices = new Set<number>();
        while (indices.size < twinkleCount && indices.size < starCount) {
          indices.add(Math.floor(Math.random() * starCount));
        }
        indices.forEach((index) => {
          if (starRefs.current[index]) {
            starRefs.current[index].activate();
          }
        });
        scheduleTwinkle();
      }, delay);
    };

    scheduleTwinkle();

    return () => {
      if (twinkleTimeout) clearTimeout(twinkleTimeout);
    };
  }, [starCount]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => {
      if (prev.width !== width || prev.height !== height) return { width, height };
      return prev;
    });
  };

  const { width, height } = size;

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
            {stars.map((s, i) => (
              <MemoStar
                key={s.id}
                s={s}
                time={time}
                sinWorklet={sinWorklet}
                width={width}
                height={height}
                ref={(ref) => (starRefs.current[i] = ref)}
              />
            ))}
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

const areEqual = (prevProps:any, nextProps:any) => {
  if (prevProps.children !== nextProps.children) return false;
  if (prevProps.starCount !== nextProps.starCount) return false;
  if (prevProps.nebula !== nextProps.nebula) return false;
  if (prevProps.backgroundColors !== nextProps.backgroundColors) return false;
  if (prevProps.style !== nextProps.style) return false;
  return true;
};
export default memo(GalaxyTwinkle, areEqual);