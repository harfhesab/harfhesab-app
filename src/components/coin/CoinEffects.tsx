import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import {
  BlendMode,
  BlurStyle,
  Canvas,
  ClipOp,
  PaintStyle,
  PathOp,
  Picture,
  Skia,
  StrokeCap,
  TileMode,
  createPicture,
  vec,
  type SkCanvas,
  type SkPaint,
  type SkPath,
  type SkPicture,
} from '@shopify/react-native-skia';

// ─── هندسه‌ی قاب (frame_coin.png، اندازه‌گیری‌شده از روی پیکسل‌های تصویر) ─────────────────
// قاب ۱۱۵×۴۰ است: دایره‌ی قرمزِ سمت چپ (جای آیکون سکه) و نوار قرمز که تا سمت راست ادامه دارد.
export const FRAME_WIDTH = 115;
export const FRAME_HEIGHT = 40;
const GEM = { x: 19.9, y: 19.9, radius: 19.8 };
const BAR = { x: 10, y: 7.8, width: 105, height: 24.1, radius: 12.06 };
const COIN_RADIUS = 10.5;

/**
 * حاشیه‌ی بوم دور قاب. بوم دور قاب «وسط‌چین» می‌شود (بدون left/right)، چون در برنامه‌ی راست‌به‌چپ
 * React Native هر `left` و `right` را جابه‌جا می‌کند و بوم از قاب فاصله می‌گرفت؛ پس حاشیه‌ها متقارن‌اند.
 */
export const FX_MARGIN_X = 40;
export const FX_MARGIN_Y = 34;
export const FX_WIDTH = FRAME_WIDTH + FX_MARGIN_X * 2;
export const FX_HEIGHT = FRAME_HEIGHT + FX_MARGIN_Y * 2;

export const FX_SPEND = 0;
export const FX_GAIN = 1;
export const FX_IDLE = 2;
/** مدت هر حالت (ms). */
export const FX_DURATION = [1700, 1500, 2000] as const;

/** فقط داخل worklet روی UI thread true است؛ خواندن `.value` روی JS یک رفت‌وبرگشت همزمان است. */
const onUI = (): boolean => {
  'worklet';
  return _WORKLET === true;
};

function clamp01(value: number): number {
  'worklet';
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
function lerp(from: number, to: number, t: number): number {
  'worklet';
  return from + (to - from) * t;
}
function easeOutCubic(t: number): number {
  'worklet';
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t: number): number {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
/** 0 → 1 → 0 روی بازه‌ی [0, 1]، با شروع و پایان نرم. */
function bell(t: number): number {
  'worklet';
  const s = Math.sin(clamp01(t) * Math.PI);
  return s * s;
}
/** عدد شبه‌تصادفی ثابت در [0, 1) برای هر (seed، اندیس)؛ ذرات هر فریم همان مسیر خود را می‌روند. */
function hash(seed: number, index: number): number {
  'worklet';
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

interface FxKit {
  glowGold: SkPaint;
  glowRed: SkPaint;
  /** نقطه‌های ریز (غبار طلایی). */
  dot: SkPaint;
  /** تکه‌ی طلا (کاهش سکه). */
  flake: SkPaint;
  /** نور نرم دور قاب. */
  frameGlowWide: SkPaint;
  frameGlowCore: SkPaint;
  /** حلقه‌ی بسیار باریک. */
  ring: SkPaint;
  /** پر کردن ستاره‌ی چهارپر. */
  sparkleFill: SkPaint;
  /** نواری از نور برای قاب و برای خود سکه. */
  frameSheen: SkPaint;
  coinSheen: SkPaint;
  /** ستاره‌ی چهارپرِ کم‌عرض با ضلع‌های خمیده، با شعاع واحد. */
  sparkle: SkPath;
  /** سیلوئت قاب (دایره + نوار) برای بریدن نور. */
  silhouette: SkPath;
  coinClip: SkPath;
  warm: Float32Array;
  gold: Float32Array;
  amber: Float32Array;
  ember: Float32Array;
  emberHot: Float32Array;
  bounds: ReturnType<typeof Skia.XYWHRect>;
}

function radialGlow(inner: string, mid: string, outer: string): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setBlendMode(BlendMode.Plus);
  // گرادیان با شعاع واحد؛ اندازه‌ی واقعی با scale روی canvas می‌آید.
  paint.setShader(
    Skia.Shader.MakeRadialGradient(
      vec(0, 0),
      1,
      [Skia.Color(inner), Skia.Color(mid), Skia.Color(outer)],
      [0, 0.4, 1],
      TileMode.Clamp,
    ),
  );
  return paint;
}

function bandPaint(halfWidth: number, peak: string): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setBlendMode(BlendMode.Plus);
  paint.setShader(
    Skia.Shader.MakeLinearGradient(
      vec(-halfWidth, 0),
      vec(halfWidth, 0),
      [Skia.Color('rgba(255, 244, 214, 0)'), Skia.Color(peak), Skia.Color('rgba(255, 244, 214, 0)')],
      [0, 0.5, 1],
      TileMode.Clamp,
    ),
  );
  return paint;
}

function softStroke(width: number, blur: number): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(width);
  paint.setBlendMode(BlendMode.Plus);
  paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, true));
  return paint;
}

function createKit(): FxKit {
  const dot = Skia.Paint();
  dot.setAntiAlias(true);
  dot.setBlendMode(BlendMode.Plus);

  const flake = Skia.Paint();
  flake.setAntiAlias(true);

  const ring = Skia.Paint();
  ring.setAntiAlias(true);
  ring.setStyle(PaintStyle.Stroke);
  ring.setStrokeCap(StrokeCap.Round);
  ring.setColor(Skia.Color('#ffe9b0'));
  ring.setBlendMode(BlendMode.Plus);

  const sparkleFill = Skia.Paint();
  sparkleFill.setAntiAlias(true);
  sparkleFill.setColor(Skia.Color('#fff6dc'));
  sparkleFill.setBlendMode(BlendMode.Plus);

  const sparkle = Skia.Path.Make();
  sparkle.moveTo(0, -1);
  sparkle.quadTo(0.1, -0.1, 1, 0);
  sparkle.quadTo(0.1, 0.1, 0, 1);
  sparkle.quadTo(-0.1, 0.1, -1, 0);
  sparkle.quadTo(-0.1, -0.1, 0, -1);
  sparkle.close();

  const silhouette = Skia.Path.Make();
  silhouette.addCircle(GEM.x, GEM.y, GEM.radius);
  const bar = Skia.Path.Make();
  bar.addRRect(Skia.RRectXY(Skia.XYWHRect(BAR.x, BAR.y, BAR.width, BAR.height), BAR.radius, BAR.radius));
  // اگر ترکیب مسیرها ممکن نشد، فقط خود نوار می‌ماند.
  const merged = silhouette.op(bar, PathOp.Union);

  const coinClip = Skia.Path.Make();
  coinClip.addCircle(0, 0, COIN_RADIUS);

  return {
    glowGold: radialGlow('rgba(255, 238, 190, 0.9)', 'rgba(255, 205, 100, 0.42)', 'rgba(255, 160, 60, 0)'),
    glowRed: radialGlow('rgba(255, 175, 155, 0.8)', 'rgba(235, 70, 60, 0.36)', 'rgba(200, 30, 40, 0)'),
    dot,
    flake,
    frameGlowWide: softStroke(10, 7),
    frameGlowCore: softStroke(4.5, 3.5),
    ring,
    sparkleFill,
    frameSheen: bandPaint(15, 'rgba(255, 244, 214, 1)'),
    coinSheen: bandPaint(5, 'rgba(255, 255, 255, 1)'),
    sparkle,
    silhouette: merged ? silhouette : bar,
    coinClip,
    warm: Skia.Color('#fff3cf'),
    gold: Skia.Color('#ffd36b'),
    amber: Skia.Color('#ffb347'),
    ember: Skia.Color('#ff4a36'),
    emberHot: Skia.Color('#ff8a4a'),
    bounds: Skia.XYWHRect(0, 0, FX_WIDTH, FX_HEIGHT),
  };
}

// ─── اجزای رسم ───────────────────────────────────────────────────────────────

function drawGlow(canvas: SkCanvas, paint: SkPaint, x: number, y: number, radius: number, alpha: number): void {
  'worklet';
  if (alpha <= 0.01 || radius <= 0) {
    return;
  }
  paint.setAlphaf(Math.min(alpha, 1));
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(radius, radius);
  canvas.drawCircle(0, 0, 1, paint);
  canvas.restore();
}

/** ستاره‌ی چهارپر با هاله‌ی بسیار ملایم. */
function drawSparkle(canvas: SkCanvas, kit: FxKit, x: number, y: number, size: number, alpha: number): void {
  'worklet';
  if (alpha <= 0.01 || size <= 0.4) {
    return;
  }
  drawGlow(canvas, kit.glowGold, x, y, size * 1.9, alpha * 0.4);
  kit.sparkleFill.setAlphaf(Math.min(alpha, 1));
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(size, size);
  canvas.drawPath(kit.sparkle, kit.sparkleFill);
  canvas.restore();
}

/** نوار نوری مایل که یک بار از روی قاب می‌گذرد و داخل سیلوئت قاب بریده می‌شود. */
function drawFrameSheen(canvas: SkCanvas, kit: FxKit, t: number, alpha: number): void {
  'worklet';
  if (t <= 0 || t >= 1 || alpha <= 0.01) {
    return;
  }
  kit.frameSheen.setAlphaf(Math.min(alpha, 1));
  canvas.save();
  canvas.clipPath(kit.silhouette, ClipOp.Intersect, true);
  canvas.translate(lerp(-20, FRAME_WIDTH + 20, easeInOutCubic(t)), FRAME_HEIGHT / 2);
  canvas.rotate(20, 0, 0);
  canvas.drawRect(Skia.XYWHRect(-15, -40, 30, 80), kit.frameSheen);
  canvas.restore();
}

/** برقِ باریک روی خود سکه. */
function drawCoinSheen(canvas: SkCanvas, kit: FxKit, coinX: number, coinY: number, t: number): void {
  'worklet';
  if (t <= 0 || t >= 1) {
    return;
  }
  kit.coinSheen.setAlphaf(0.9 * bell(t));
  canvas.save();
  canvas.translate(coinX, coinY);
  canvas.clipPath(kit.coinClip, ClipOp.Intersect, true);
  canvas.translate(lerp(-14, 14, easeInOutCubic(t)), 0);
  canvas.rotate(22, 0, 0);
  canvas.drawRect(Skia.XYWHRect(-5, -22, 10, 44), kit.coinSheen);
  canvas.restore();
}

// ─── سه حالت افکت ────────────────────────────────────────────────────────────

/**
 * افزایش سکه: درخششی گرم پشت سکه، یک حلقه‌ی بسیار باریک، چند ستاره‌ی ریز و غبار طلایی که بالا می‌رود،
 * و یک نوار نور ملایم که از روی قاب می‌گذرد.
 */
function drawGain(canvas: SkCanvas, kit: FxKit, p: number, seed: number, cx: number, cy: number): void {
  'worklet';
  const glow = clamp01(p / 0.12) * (1 - easeInOutCubic(clamp01((p - 0.12) / 0.66)));
  drawGlow(canvas, kit.glowGold, GEM.x, GEM.y, lerp(24, 36, easeOutCubic(p)), glow * 0.55);

  const q = clamp01((p - 0.04) / 0.55);
  if (q > 0 && q < 1) {
    kit.ring.setAlphaf((1 - q) * 0.5);
    kit.ring.setStrokeWidth(lerp(1.6, 0.5, q));
    canvas.drawCircle(GEM.x, GEM.y, lerp(GEM.radius, GEM.radius + 13, easeOutCubic(q)), kit.ring);
  }

  drawFrameSheen(canvas, kit, (p - 0.3) / 0.5, 0.3 * bell((p - 0.3) / 0.5));

  // غبار طلایی: نقطه‌های ریز که آرام بالا می‌روند و محو می‌شوند.
  for (let i = 0; i < 12; i++) {
    const t = clamp01((p - hash(seed, i + 40) * 0.22) / 0.7);
    if (t <= 0 || t >= 1) {
      continue;
    }
    const a = hash(seed, i) * Math.PI * 2;
    const r = 3 + hash(seed, i + 20) * 14;
    const x = cx + Math.cos(a) * r + (hash(seed, i + 60) - 0.5) * 8 * t;
    const y = cy + Math.sin(a) * r - 16 * easeOutCubic(t);
    const alpha = bell(t) * 0.8;
    kit.dot.setColor(i % 3 === 0 ? kit.warm : kit.gold);
    kit.dot.setAlphaf(alpha);
    canvas.drawCircle(x, y, 0.8 + hash(seed, i + 80) * 0.9, kit.dot);
  }

  // ستاره‌های ریز دور سکه، یکی‌یکی چشمک می‌زنند.
  for (let i = 0; i < 6; i++) {
    const t = clamp01((p - 0.06 - i * 0.08) / 0.42);
    if (t <= 0 || t >= 1) {
      continue;
    }
    const a = (i / 6) * Math.PI * 2 + hash(seed, i + 100) * 1.1;
    const r = 8 + hash(seed, i + 120) * 13;
    drawSparkle(
      canvas,
      kit,
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r - 5 * t,
      2.6 + hash(seed, i + 140) * 3,
      bell(t),
    );
  }
}

/** چشمک ستاره: سریع روشن می‌شود، چند بار نرم سوسو می‌زند و بعد آرام محو می‌شود. */
function twinkle(t: number): number {
  'worklet';
  if (t <= 0 || t >= 1) {
    return 0;
  }
  const attack = easeOutCubic(clamp01(t / 0.14));
  const decay = Math.pow(1 - clamp01((t - 0.14) / 0.86), 1.5);
  const flicker = 1 + 0.2 * Math.sin(t * 36) * (1 - t);
  return Math.min(1, attack * decay * flicker);
}

const FLAKE_COUNT = 16;

/**
 * کاهش سکه: نوری گرم که از دور قاب پخش می‌شود، درخششی سرخ روی دایره و تکه‌های طلا که از سکه جدا می‌شوند،
 * کمی بالا می‌پرند، می‌چرخند و می‌ریزند.
 */
function drawSpend(canvas: SkCanvas, kit: FxKit, p: number, seed: number, cx: number, cy: number): void {
  'worklet';
  const light = clamp01(p / 0.08) * (1 - easeInOutCubic(clamp01((p - 0.08) / 0.62)));
  if (light > 0.01) {
    kit.frameGlowWide.setColor(kit.ember);
    kit.frameGlowWide.setAlphaf(light * 0.4);
    canvas.drawPath(kit.silhouette, kit.frameGlowWide);
    kit.frameGlowCore.setColor(kit.emberHot);
    kit.frameGlowCore.setAlphaf(light * 0.75);
    canvas.drawPath(kit.silhouette, kit.frameGlowCore);
  }
  drawGlow(canvas, kit.glowRed, GEM.x, GEM.y, lerp(22, 34, easeOutCubic(p)), light * 0.5);

  for (let i = 0; i < FLAKE_COUNT; i++) {
    const t = clamp01((p - hash(seed, i + 40) * 0.2) / 0.75);
    if (t <= 0 || t >= 1) {
      continue;
    }
    const x = cx + (hash(seed, i) - 0.5) * 42 * t;
    // کمی بالا می‌پرد، بعد با گرانش می‌ریزد.
    const y = cy - (6 + hash(seed, i + 20) * 16) * t + 66 * t * t;
    const alpha = clamp01(t / 0.06) * (1 - clamp01((t - 0.72) / 0.28));
    const w = 3 + hash(seed, i + 60) * 2.6;
    const h = 2 + hash(seed, i + 80) * 1.6;
    drawGlow(canvas, kit.glowGold, x, y, 6.5, alpha * 0.4);
    kit.flake.setColor(i % 3 === 0 ? kit.warm : i % 3 === 1 ? kit.gold : kit.amber);
    kit.flake.setAlphaf(alpha);
    canvas.save();
    canvas.translate(x, y);
    canvas.rotate((hash(seed, i + 100) - 0.5) * 720 * t + hash(seed, i + 120) * 180, 0, 0);
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2, w, h), 0.9, 0.9), kit.flake);
    canvas.restore();
  }
}

/** ستاره‌های چشمک بیکاری: [جابه‌جایی x و y از مرکز سکه، اندازه، شروع]. */
const IDLE_COIN_STARS = [
  [7, -7, 6.2, 0.1],
  [-7.5, 5.5, 4.6, 0.24],
  [8.5, 5, 3.8, 0.38],
  [-3, -10, 4.2, 0.5],
];
/** ستاره‌های روی نوار قاب: [x، y، اندازه، شروع] در مختصات قاب. */
const IDLE_BAR_STARS = [
  [46, 11.5, 3.8, 0.3],
  [62, 29, 3.2, 0.44],
];

/** چشمک بیکاری: برقی که از روی سکه می‌گذرد، چند ستاره‌ی چشمک‌زن که آرام محو می‌شوند و نور ملایم روی قاب. */
function drawIdle(canvas: SkCanvas, kit: FxKit, p: number, cx: number, cy: number): void {
  'worklet';
  drawCoinSheen(canvas, kit, cx, cy, (p - 0.06) / 0.4);
  drawFrameSheen(canvas, kit, (p - 0.3) / 0.5, 0.15 * bell((p - 0.3) / 0.5));
  for (let i = 0; i < IDLE_COIN_STARS.length; i++) {
    const star = IDLE_COIN_STARS[i];
    const e = twinkle((p - star[3]) / 0.5);
    drawSparkle(canvas, kit, cx + star[0], cy + star[1], star[2] * (0.7 + 0.3 * e), e);
  }
  for (let i = 0; i < IDLE_BAR_STARS.length; i++) {
    const star = IDLE_BAR_STARS[i];
    const e = twinkle((p - star[3]) / 0.5);
    drawSparkle(canvas, kit, star[0], star[1], star[2] * (0.7 + 0.3 * e), e * 0.9);
  }
}

function drawFx(kit: FxKit, p: number, seed: number, mode: number, coinX: number, coinY: number): SkPicture {
  'worklet';
  return createPicture(canvas => {
    if (p <= 0 || p >= 1) {
      return;
    }
    // مختصات رسم، مختصات خود قاب است.
    canvas.translate(FX_MARGIN_X, FX_MARGIN_Y);
    if (mode === 1) {
      drawGain(canvas, kit, p, seed, coinX, coinY);
    } else if (mode === 0) {
      drawSpend(canvas, kit, p, seed, coinX, coinY);
    } else {
      drawIdle(canvas, kit, p, coinX, coinY);
    }
  }, kit.bounds);
}

interface CoinEffectsProps {
  /** 0→1؛ مقدار 1 یعنی بیکار. */
  progress: SharedValue<number>;
  seed: SharedValue<number>;
  /** `FX_SPEND` یا `FX_GAIN` یا `FX_IDLE`. */
  mode: SharedValue<number>;
  /** مرکز آیکون سکه، در مختصات قاب. */
  coinX: SharedValue<number>;
  coinY: SharedValue<number>;
}

/**
 * همه‌ی افکت‌های سکه‌شمار روی یک Canvas Skia. فقط وقتی لازم است mount می‌شود (نگاه کنید به `NumberCoins`)،
 * پس وقتی افکتی نیست هیچ سطح گرافیکی‌ای در هدر صفحه‌ها نگه داشته نمی‌شود.
 */
function CoinEffects({ progress, seed, mode, coinX, coinY }: CoinEffectsProps) {
  const kit = useMemo(createKit, []);
  const empty = useMemo(() => createPicture(() => {}, kit.bounds), [kit]);
  const picture = useDerivedValue(() => {
    if (!onUI()) {
      return empty;
    }
    return drawFx(kit, progress.value, seed.value, mode.value, coinX.value, coinY.value);
  });

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: FX_WIDTH,
    height: FX_HEIGHT,
  },
});

export default memo(CoinEffects);