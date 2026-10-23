import {
  BlurStyle,
  createPicture,
  Skia,
  type SkCanvas,
  type SkFont,
  type SkPaint,
  type SkPicture,
  type SkRect,
  type SkRRect,
} from '@shopify/react-native-skia';
import { PICKED, PULSE, SCALE, STRIDE, X, Y } from '../../engine/physics';
import { RIPPLE_COLOR, type TilePalette } from '../../constants/theme';
import { centerGlyph } from '../../utils/glyph';
import { roundedRect, solidPaint, strokePaint, verticalGradientPaint } from '../../utils/skiaPaint';

/**
 * طرح یک کارت حرف، با مرکز روی مبدأ، یک بار ضبط می‌شود: سایه‌ی نرم، لبه‌ی تیره‌تر که ضخامت کارت
 * را نشان می‌دهد، رویه‌ی گرادیانی با براقیِ بالا و حرفِ برجسته. هر فریم فقط همین تصویرِ ضبط‌شده
 * جابه‌جا و بزرگ/کوچک می‌شود.
 */
export function recordTile(size: number, letter: string, font: SkFont | null, palette: TilePalette): SkPicture {
  const half = size / 2;
  const radius = size * 0.24;
  const bevel = size * 0.1;
  const faceHeight = size - bevel;
  const inset = size * 0.08;

  return createPicture(canvas => {
    if (palette.shadow !== null) {
      const shadow = solidPaint(palette.shadow);
      shadow.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, size * 0.08, true));
      canvas.drawRRect(roundedRect(-half, -half + size * 0.07, size, size, radius), shadow);
    }
    canvas.drawRRect(roundedRect(-half, -half, size, size, radius), solidPaint(palette.edge));
    canvas.drawRRect(
      roundedRect(-half, -half, size, faceHeight, radius),
      verticalGradientPaint(-half, -half + faceHeight, palette.face),
    );
    canvas.drawRRect(
      roundedRect(-half + inset, -half + inset * 0.55, size - inset * 2, faceHeight * 0.44, radius * 0.7),
      verticalGradientPaint(-half, -half + faceHeight * 0.48, [palette.gloss, 'rgba(255, 255, 255, 0)']),
    );
    canvas.drawRRect(
      roundedRect(-half + 0.75, -half + 0.75, size - 1.5, faceHeight - 1.5, radius),
      strokePaint(palette.rim, 1.5),
    );
    if (font !== null) {
      const glyph = centerGlyph(font, letter, -bevel / 2);
      canvas.drawText(letter, glyph.x, glyph.y + size * 0.025, solidPaint(palette.letterShade), font);
      canvas.drawText(letter, glyph.x, glyph.y, solidPaint(palette.letter), font);
    }
  }, Skia.XYWHRect(-size, -size, size * 2, size * 2));
}

export interface TileSet {
  idle: SkPicture[];
  picked: SkPicture[];
  ripple: { shape: SkRRect; paint: SkPaint };
  /** فاصله‌ی محدوده‌ی حرکت از لبه‌ی صفحه. */
  offset: number;
  bounds: SkRect;
}

export function createTileSet(
  letters: readonly string[],
  size: number,
  font: SkFont | null,
  palettes: { idle: TilePalette; picked: TilePalette },
  offset: number,
  bounds: SkRect,
): TileSet {
  // حلقه‌ی درخشانی که هنگام انتخاب از کارت بیرون می‌زند.
  const ripplePaint = strokePaint(RIPPLE_COLOR, 2.5);
  ripplePaint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Solid, 2.5, true));
  return {
    idle: letters.map(letter => recordTile(size, letter, font, palettes.idle)),
    picked: letters.map(letter => recordTile(size, letter, font, palettes.picked)),
    ripple: { shape: roundedRect(-size / 2, -size / 2, size, size, size * 0.26), paint: ripplePaint },
    offset,
    bounds,
  };
}

/** همه‌ی کارت‌ها را در وضعیت `bodies` ضبط می‌کند؛ هر فریم روی UI thread صدا زده می‌شود. */
export function drawTiles(bodies: readonly number[], count: number, tiles: TileSet): SkPicture {
  'worklet';
  return createPicture((canvas: SkCanvas) => {
    canvas.translate(tiles.offset, tiles.offset);
    // اول کارت‌های انتخاب‌شده، تا از زیر کارت‌های آزاد رد شوند.
    for (let pass = 1; pass >= 0; pass--) {
      for (let i = 0; i < count; i++) {
        const o = i * STRIDE;
        if (bodies[o + PICKED] !== pass) {
          continue;
        }
        canvas.save();
        canvas.translate(bodies[o + X], bodies[o + Y]);
        canvas.scale(bodies[o + SCALE], bodies[o + SCALE]);
        canvas.drawPicture(pass === 1 ? tiles.picked[i] : tiles.idle[i]);
        canvas.restore();
      }
    }
    for (let i = 0; i < count; i++) {
      const o = i * STRIDE;
      if (bodies[o + PULSE] >= 1) {
        continue;
      }
      const rest = 1 - bodies[o + PULSE];
      const scale = 0.9 + 0.75 * (1 - rest * rest * rest);
      tiles.ripple.paint.setAlphaf(rest * rest);
      canvas.save();
      canvas.translate(bodies[o + X], bodies[o + Y]);
      canvas.scale(scale, scale);
      canvas.drawRRect(tiles.ripple.shape, tiles.ripple.paint);
      canvas.restore();
    }
  }, tiles.bounds);
}
