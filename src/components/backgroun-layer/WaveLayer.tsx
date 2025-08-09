import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Path as SkiaPathComponent, Skia } from "@shopify/react-native-skia";
import { useSharedValue, useFrameCallback, runOnJS } from "react-native-reanimated";

interface WaveLayer3DProps {
  width: number;
  height: number;
  layers?: number; // تعداد لایه‌های موج
  children?: React.ReactNode;
  verticalPosition?: string | number; // مثال: "50%" یا 80 (px)
}

interface WaveConfig {
  amplitude: number;
  wavelength: number;
  speed: number;
  color: string;
  offset: number;
  opacity: number;
}

const defaultWaves: WaveConfig[] = [
  { amplitude: 25, wavelength: 300, speed: 250, color: "#3B82F6", offset: 0, opacity: 0.5 },
  { amplitude: 18, wavelength: 200, speed: 350, color: "#2563EB", offset: 100, opacity: 0.35 },
  { amplitude: 12, wavelength: 150, speed: 400, color: "#1D4ED8", offset: 200, opacity: 0.25 },
];

const parseVerticalPosition = (pos: string | number | undefined, height: number) => {
  if (typeof pos === "number") return pos;
  if (!pos) return height / 2;
  const s = pos.trim();
  if (s.endsWith("%")) {
    const p = parseFloat(s);
    if (!isNaN(p)) return (p / 100) * height;
  } else if (s.endsWith("px")) {
    const px = parseFloat(s);
    if (!isNaN(px)) return px;
  } else {
    const n = parseFloat(s);
    if (!isNaN(n)) {
      // اگر مقدار بین 0 و 1 باشه فرض می‌کنیم درصد (مثلاً 0.5 -> 50%)
      if (n > 0 && n <= 1) return n * height;
      return n; // در غیر اینصورت پیکسل
    }
  }
  return height / 2;
};

const WaveLayer3D: React.FC<WaveLayer3DProps> = ({
  width,
  height,
  layers = 3,
  children,
  verticalPosition = "50%",
}) => {
  // shared value فقط در worklet استفاده میشه — هر فریم offsetها محاسبه و به state منتقل می‌شن
  const progress = useSharedValue(0);
  const [offsets, setOffsets] = useState<number[]>(() => new Array(layers).fill(0));
  const [, setTick] = useState(0); // فقط برای فورس رندر در صورت نیاز (قدیمی هم همینکار رو می‌کرد)

  // اگر تعداد لایه تغییر کرد، offsets رو تطبیق بده
  useEffect(() => {
    if (offsets.length !== layers) {
      setOffsets(new Array(layers).fill(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  useFrameCallback(
    (frame) => {
      "worklet";
      // حرکت مشابه کد اولیه (progress بین 0 و 1)
      progress.value += 1 / 300;
      if (progress.value > 1) progress.value = 0;

      const newOffsets: number[] = new Array(layers);
      for (let i = 0; i < layers; i++) {
        const wave = defaultWaves[i % defaultWaves.length];
        // این را طبق کُد اصلی نگه داشتم:
        const offsetX = (progress.value * wave.wavelength + wave.offset) % wave.wavelength;
        newOffsets[i] = offsetX;
      }

      // به JS thread ارسال می‌کنیم تا state آپدیت شود — و در render استفاده کنیم.
      runOnJS(setOffsets)(newOffsets);
      runOnJS(setTick)((t: number) => t + 1);
    },
    true // enabled
  );

  // موقعیت پایه عمودی (بر اساس درصد یا پیکسل)
  const baseY = parseVerticalPosition(verticalPosition, height);

  // مسیرها را براساس offsets که در state ذخیره شده می‌سازیم.
  // توجه: این ساخت مسیر داخل render است اما دیگر از shared value خوانده نمی‌شود.
  const paths = offsets.map((offset, i) => {
    const wave = defaultWaves[i % defaultWaves.length];
    const path = Skia.Path.Make();
    path.moveTo(0, baseY);
    // قدم یک پیکسل؛ در صورت نیاز میشه با گام بزرگتر برای بهبود performance تغییر داد
    for (let x = 0; x <= width; x += 1) {
      const y =
        baseY +
        Math.sin(((x + offset) / wave.wavelength) * Math.PI * 2) * wave.amplitude;
      path.lineTo(x, y);
    }
    path.lineTo(width, height);
    path.lineTo(0, height);
    path.close();
    return path;
  });

  return (
    <View style={{ width, height }}>
      <Canvas style={StyleSheet.absoluteFill}>
        {paths.map((p, i) => {
          const wave = defaultWaves[i % defaultWaves.length];
          return (
            <SkiaPathComponent
              key={i}
              path={p}
              color={wave.color}
              style="fill"
              opacity={wave.opacity}
            />
          );
        })}
      </Canvas>
      <View style={StyleSheet.absoluteFill}>{children}</View>
    </View>
  );
};

export default WaveLayer3D;
