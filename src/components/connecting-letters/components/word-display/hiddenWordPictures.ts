import {
  BlendMode,
  ClipOp,
  createPicture,
  Skia,
  StrokeCap,
  TileMode,
  vec,
  type SkCanvas,
  type SkPaint,
  type SkPicture,
  type SkRect,
} from '@shopify/react-native-skia';
import { BAR_COLORS } from '../../constants/theme';
import { HIDDEN_FX_IMPACT } from '../../engine/hiddenWordFx';
import { solidPaint, strokePaint, verticalGradientPaint } from '../../utils/skiaPaint';
import { PILL_HEIGHT, type WordParagraphs } from './wordParagraph';

/** شعاع تقریبی دکمه؛ اندازه‌ی نور و حلقه‌ها از روی آن است. */
const BUTTON_RADIUS = 28;
/** پایان درخشش اولیه روی نوار کلمه. */
const LAUNCH_END = 0.16;
const FLY_START = 0.06;
const CHARGE_START = 0.1;
const TRAIL_COUNT = 9;
const TRAIL_STEP = 0.03;
const SPARK_COUNT = 14;
const RAY_COUNT = 10;
const TAU = Math.PI * 2;

export interface HiddenWordKit {
  glow: SkPaint;
  spark: SkPaint;
  ring: SkPaint;
  ray: SkPaint;
  layer: SkPaint;
  ghostFill: SkPaint;
  ghostGloss: SkPaint;
  ghostBorder: SkPaint;
  gold: Float32Array;
  warm: Float32Array;
  width: number;
  /** فاصله‌ی مرکز pill تا بالای نوار «کلمه‌ی فعلی». */
  startOffset: number;
  bounds: SkRect;
}

/** همه‌ی paintها یک بار ساخته می‌شوند و در هر فریم فقط مقدارشان (آلفا، ضخامت) عوض می‌شود. */
export function createHiddenWordKit(width: number, height: number, startOffset: number): HiddenWordKit {
  const glow = Skia.Paint();
  glow.setAntiAlias(true);
  glow.setBlendMode(BlendMode.Plus);
  // گرادیان شعاع واحد؛ اندازه‌ی واقعی با scale روی canvas می‌آید.
  glow.setShader(
    Skia.Shader.MakeRadialGradient(
      vec(0, 0),
      1,
      [Skia.Color('rgba(255, 246, 208, 1)'), Skia.Color('rgba(255, 204, 84, 0.55)'), Skia.Color('rgba(255, 150, 40, 0)')],
      [0, 0.35, 1],
      TileMode.Clamp,
    ),
  );
  const spark = solidPaint('#ffffff');
  spark.setBlendMode(BlendMode.Plus);
  const ring = strokePaint('#ffe9a8', 3);
  ring.setBlendMode(BlendMode.Plus);
  const ray = strokePaint('#fff1c2', 2);
  ray.setStrokeCap(StrokeCap.Round);
  ray.setBlendMode(BlendMode.Plus);

  return {
    glow,
    spark,
    ring,
    ray,
    layer: Skia.Paint(),
    ghostFill: solidPaint(BAR_COLORS.success),
    ghostGloss: verticalGradientPaint(-PILL_HEIGHT / 2, -PILL_HEIGHT / 2 + PILL_HEIGHT * 0.55, [
      'rgba(255, 255, 255, 0.38)',
      'rgba(255, 255, 255, 0)',
    ]),
    ghostBorder: strokePaint('rgba(255, 255, 255, 0.45)', 1.5),
    gold: Skia.Color('#ffd35a'),
    warm: Skia.Color('#fff6d0'),
    width,
    startOffset,
    bounds: Skia.XYWHRect(0, 0, width, height),
  };
}

export const emptyHiddenWordPicture = (kit: Pick<HiddenWordKit, 'bounds'>): SkPicture =>
  createPicture(() => {}, kit.bounds);

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
function easeInCubic(t: number): number {
  'worklet';
  return t * t * t;
}
function easeInOutCubic(t: number): number {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
/** عدد شبه‌تصادفی ثابت در [0, 1) برای هر (seed، اندیس)؛ جرقه‌ها هر فریم همان جای خود می‌مانند. */
function hash(seed: number, index: number): number {
  'worklet';
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawGlow(canvas: SkCanvas, kit: HiddenWordKit, x: number, y: number, radius: number, alpha: number): void {
  'worklet';
  if (alpha <= 0.01 || radius <= 0) {
    return;
  }
  kit.glow.setAlphaf(Math.min(alpha, 1));
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(radius, radius);
  canvas.drawCircle(0, 0, 1, kit.glow);
  canvas.restore();
}

function drawRing(
  canvas: SkCanvas,
  kit: HiddenWordKit,
  x: number,
  y: number,
  radius: number,
  width: number,
  alpha: number,
): void {
  'worklet';
  if (alpha <= 0.01) {
    return;
  }
  kit.ring.setStrokeWidth(width);
  kit.ring.setAlphaf(alpha);
  canvas.drawCircle(x, y, radius, kit.ring);
}

function drawLane(
  canvas: SkCanvas,
  kit: HiddenWordKit,
  p: number,
  seed: number,
  text: WordParagraphs | null,
  bx: number,
  by: number,
  sx: number,
  sy: number,
): void {
  'worklet';
  const impactSpan = 1 - HIDDEN_FX_IMPACT;
  const q = p >= HIDDEN_FX_IMPACT ? (p - HIDDEN_FX_IMPACT) / impactSpan : 0;
  const pillWidth = text !== null ? text.pillWidth : 48;

  // ۱) درخشش و حلقه‌ی آغاز روی نوار کلمه، همان لحظه‌ای که کلمه از آن جدا می‌شود.
  if (p < LAUNCH_END) {
    const k = easeOutCubic(p / LAUNCH_END);
    drawGlow(canvas, kit, sx, sy, pillWidth * lerp(0.6, 1.1, k), 0.7 * (1 - k));
    drawRing(canvas, kit, sx, sy, lerp(14, pillWidth * 0.7, k), lerp(3.5, 0.6, k), 0.7 * (1 - k));
  }

  // ۲) نور دکمه: تا رسیدن کلمه آرام شارژ می‌شود و با رسیدن منفجر می‌شود و محو می‌شود.
  const charge =
    p < HIDDEN_FX_IMPACT
      ? easeInCubic(clamp01((p - CHARGE_START) / (HIDDEN_FX_IMPACT - CHARGE_START))) * 0.55
      : 0;
  const flare = p >= HIDDEN_FX_IMPACT ? 1 - easeOutCubic(q) : 0;
  drawGlow(
    canvas,
    kit,
    bx,
    by,
    BUTTON_RADIUS * (1.1 + 0.3 * charge + 1.3 * easeOutCubic(q)),
    Math.max(charge, flare * 0.95),
  );

  // ۳) پرواز: کلمه روی یک منحنی بزیه از نوار به دکمه می‌رود.
  const flightEnd = HIDDEN_FX_IMPACT + 0.06;
  if (p < flightEnd) {
    const t = clamp01((p - FLY_START) / (HIDDEN_FX_IMPACT - FLY_START));
    const dx = bx - sx;
    const dy = by - sy;
    // نقطه‌ی کنترل کمی از وسط کنار کشیده می‌شود تا مسیر خمیده باشد.
    const cx = (sx + bx) / 2 - dy * 0.3;
    const cy = (sy + by) / 2 + dx * 0.3;
    const u = easeInOutCubic(t);
    const inv = 1 - u;
    const x = inv * inv * sx + 2 * inv * u * cx + u * u * bx;
    const y = inv * inv * sy + 2 * inv * u * cy + u * u * by;

    // محو شدن کلمه درست پیش از رسیدن (در دکمه «جذب» می‌شود).
    const alpha = Math.min(1, p / 0.03) * (1 - clamp01((p - (HIDDEN_FX_IMPACT - 0.07)) / 0.13));
    // کمی بزرگ‌تر در آغاز (پرش)، بعد کوچک شدن تا رسیدن.
    const scale = p < FLY_START ? lerp(1, 1.12, p / FLY_START) : lerp(1.12, 0.22, easeInCubic(t));
    const tilt = (dx < 0 ? 1 : -1) * 14 * Math.sin(u * Math.PI);

    // دنباله‌ی نور: موقعیت‌های قبلیِ همین مسیر، کوچک‌شونده و کم‌رنگ‌شونده.
    if (p > FLY_START) {
      for (let k = 1; k <= TRAIL_COUNT; k++) {
        const tk = t - k * TRAIL_STEP;
        if (tk <= 0) {
          break;
        }
        const uk = easeInOutCubic(tk);
        const ik = 1 - uk;
        const fade = 1 - k / (TRAIL_COUNT + 1);
        const tx = ik * ik * sx + 2 * ik * uk * cx + uk * uk * bx;
        const ty = ik * ik * sy + 2 * ik * uk * cy + uk * uk * by;
        kit.spark.setColor(k % 2 === 0 ? kit.gold : kit.warm);
        kit.spark.setAlphaf(fade * 0.7 * alpha);
        canvas.drawCircle(tx, ty, 1.5 + fade * 4.5 * scale, kit.spark);
      }
    }

    canvas.save();
    canvas.translate(x, y);
    canvas.rotate(tilt, 0, 0);
    canvas.scale(scale, scale);
    kit.layer.setAlphaf(alpha);
    canvas.saveLayer(kit.layer);
    drawGlow(canvas, kit, 0, 0, pillWidth * 0.8, 0.5);
    if (text !== null) {
      const w = text.pillWidth;
      const h = PILL_HEIGHT;
      const r = h / 2;
      const body = Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2, w, h), r, r);
      canvas.drawRRect(body, kit.ghostFill);
      canvas.save();
      canvas.clipRRect(body, ClipOp.Intersect, true);
      canvas.drawRect(Skia.XYWHRect(-w / 2, -h / 2, w, h * 0.55), kit.ghostGloss);
      canvas.restore();
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(-w / 2 + 0.75, -h / 2 + 0.75, w - 1.5, h - 1.5), r - 0.75, r - 0.75),
        kit.ghostBorder,
      );
      const px = -text.layoutWidth / 2;
      text.shadow.paint(canvas, px, -text.shadow.getHeight() / 2 + 1);
      text.fill.paint(canvas, px, -text.fill.getHeight() / 2);
    } else {
      // اگر ساخت متن در این دستگاه ممکن نباشد، یک گوی نورانی پرواز می‌کند.
      kit.spark.setColor(kit.warm);
      kit.spark.setAlphaf(1);
      canvas.drawCircle(0, 0, 7, kit.spark);
    }
    canvas.restore();
    canvas.restore();
  }

  // ۴) ضربه: حلقه‌های موج، پرتوها و جرقه‌ها از دکمه پخش می‌شوند.
  if (p >= HIDDEN_FX_IMPACT) {
    const out = easeOutCubic(q);
    for (let k = 0; k < 2; k++) {
      const qk = clamp01((q - k * 0.14) / (1 - k * 0.14));
      drawRing(
        canvas,
        kit,
        bx,
        by,
        lerp(8, BUTTON_RADIUS * 2.1, easeOutCubic(qk)),
        lerp(4, 0.8, qk),
        (1 - qk) * 0.8,
      );
    }

    const rayAlpha = Math.pow(1 - q, 1.5) * 0.9;
    if (rayAlpha > 0.01) {
      kit.ray.setStrokeWidth(0.6 + 2.2 * (1 - q));
      kit.ray.setAlphaf(rayAlpha);
      for (let i = 0; i < RAY_COUNT; i++) {
        const angle = (i / RAY_COUNT) * TAU + seed * 0.7 + q * 0.6;
        const inner = BUTTON_RADIUS * 0.4 + 6 * out;
        const outer = inner + BUTTON_RADIUS * (i % 2 === 0 ? 1.1 : 0.7) * (0.3 + out);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        canvas.drawLine(bx + cos * inner, by + sin * inner, bx + cos * outer, by + sin * outer, kit.ray);
      }
    }

    for (let i = 0; i < SPARK_COUNT; i++) {
      const angle = hash(seed, i) * TAU;
      const distance = BUTTON_RADIUS * (0.9 + hash(seed, i + 40) * 1.5) * out;
      const sparkX = bx + Math.cos(angle) * distance;
      // کمی گرانش تا جرقه‌ها در آخر آرام پایین بیایند.
      const sparkY = by + Math.sin(angle) * distance + BUTTON_RADIUS * 0.5 * q * q;
      kit.spark.setColor(i % 3 === 0 ? kit.warm : kit.gold);
      kit.spark.setAlphaf(1 - q);
      canvas.drawCircle(sparkX, sparkY, (1.4 + hash(seed, i + 80) * 2.4) * (1 - q), kit.spark);
    }
  }
}

/** همه‌ی کلمه‌های در حال افکت را می‌کشد. روی UI thread صدا زده می‌شود. */
export function drawHiddenWordFx(
  kit: HiddenWordKit,
  progress: readonly number[],
  seeds: readonly number[],
  texts: readonly (WordParagraphs | null)[],
  buttonX: number,
  buttonY: number,
  currentWordY: number,
): SkPicture {
  'worklet';
  return createPicture(canvas => {
    for (let lane = 0; lane < progress.length; lane++) {
      const p = progress[lane];
      if (p <= 0 || p >= 1) {
        continue;
      }
      drawLane(
        canvas,
        kit,
        p,
        seeds[lane],
        texts[lane] ?? null,
        buttonX,
        buttonY,
        kit.width / 2,
        currentWordY + kit.startOffset,
      );
    }
  }, kit.bounds);
}
