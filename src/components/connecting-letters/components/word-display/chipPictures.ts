import {
  BlurStyle,
  ClipOp,
  createPicture,
  Skia,
  type SkPaint,
  type SkPicture,
  type SkRect,
  type SkFont,
} from '@shopify/react-native-skia';
import { CHIP_PALETTES } from '../../constants/theme';
import { recordTile } from '../board/tilePictures';
import { solidPaint, strokePaint, verticalGradientPaint } from '../../utils/skiaPaint';
import { PILL_HEIGHT, type WordParagraphs } from './wordParagraph';

export const CHIP_GAP = 4;
export const PILL_GAP = 6;
/** ارتفاع کل نوار «کلمه‌ی فعلی». */
export const WORD_BAR_HEIGHT = 80;
const CHIP_MAX = 26;
const CHIP_MIN = 14;
/** فضای افقیِ خالی که دو طرف ردیف مهره‌ها نگه داشته می‌شود. */
const SIDE_ROOM = 64;

/** اندازه‌ی هر مهره؛ با زیاد شدن حروف معما کوچک می‌شود تا ردیف در عرض صفحه جا شود. */
export function chipSizeFor(width: number, letterCount: number): number {
  const count = Math.max(1, letterCount);
  return Math.max(CHIP_MIN, Math.min(CHIP_MAX, (width - SIDE_ROOM * 2 - (count - 1) * CHIP_GAP) / count));
}

/** فاصله‌ی مرکز کلمه‌ی پیوسته (pill) تا بالای نوار. */
export function pillCenterOffset(chipSize: number): number {
  const top = (WORD_BAR_HEIGHT - (chipSize + PILL_GAP + PILL_HEIGHT)) / 2;
  return top + chipSize + PILL_GAP + PILL_HEIGHT / 2;
}
/** جابه‌جایی عمودیِ (px) ورود و خروج نوار؛ با fade همراه است. */
const RISE = 6;

export interface WordBarSet {
  /** [رنگ نتیجه][اندیس کارت]، هر کدام با مرکز روی مبدأ. */
  pictures: SkPicture[][];
  size: number;
  width: number;
  height: number;
  /** مرکز عمودی ردیف مهره‌ها و کلمه‌ی پیوسته. */
  chipY: number;
  pillY: number;
  layer: SkPaint;
  pillShadow: SkPaint;
  pillFill: SkPaint;
  pillGloss: SkPaint;
  pillBorder: SkPaint;
  bounds: SkRect;
}

/**
 * مهره‌ها و کلمه‌ی پیوسته با هم وسط ناحیه‌ی `height` چیده می‌شوند، همان چیدمان قبلی: ردیف مهره‌ها،
 * ۶px فاصله، pill. هر مهره یک کارتِ کوچک با طرح کارت‌های صفحه است، به رنگ نتیجه.
 */
export function createWordBarSet(
  letters: readonly string[],
  size: number,
  font: SkFont | null,
  width: number,
  height: number,
): WordBarSet {
  const top = (height - (size + PILL_GAP + PILL_HEIGHT)) / 2;
  const glossHeight = PILL_HEIGHT * 0.55;
  return {
    pictures: CHIP_PALETTES.map(palette => letters.map(letter => recordTile(size, letter, font, palette))),
    size,
    width,
    height,
    chipY: top + size / 2,
    pillY: top + size + PILL_GAP + PILL_HEIGHT / 2,
    layer: Skia.Paint(),
    pillShadow: (() => {
      const paint = solidPaint('rgba(0, 0, 0, 0.35)');
      paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 3, true));
      return paint;
    })(),
    pillFill: solidPaint('#6a4bdc'),
    pillGloss: verticalGradientPaint(-PILL_HEIGHT / 2, -PILL_HEIGHT / 2 + glossHeight, [
      'rgba(255, 255, 255, 0.38)',
      'rgba(255, 255, 255, 0)',
    ]),
    pillBorder: strokePaint('rgba(255, 255, 255, 0.45)', 1.5),
    bounds: Skia.XYWHRect(0, 0, width, height),
  };
}

export const emptyWordBarPicture = (set: Pick<WordBarSet, 'bounds'>): SkPicture => createPicture(() => {}, set.bounds);

/**
 * مهره‌ها را وسط‌چین می‌کشد، به ترتیبی که اولین حرف انتخاب‌شده سمت راست باشد، و زیرشان کلمه‌ی پیوسته.
 * روی UI thread صدا زده می‌شود.
 */
export function drawWordBar(
  set: WordBarSet,
  picks: readonly number[],
  scales: readonly number[],
  slide: number,
  verdict: number,
  visibility: number,
  words: WordParagraphs | null,
  tint: string,
  shake: number,
  bump: number,
): SkPicture {
  'worklet';
  return createPicture(canvas => {
    const count = picks.length;
    if (count === 0 || visibility <= 0) {
      return;
    }
    const rise = (1 - visibility) * RISE;
    const step = set.size + CHIP_GAP;
    const rightCenter = (set.width + slide * step - CHIP_GAP - set.size) / 2;
    const row = set.pictures[verdict] ?? set.pictures[0];

    set.layer.setAlphaf(visibility);
    canvas.saveLayer(set.layer);
    for (let i = 0; i < count; i++) {
      const scale = Math.max(scales[i] ?? 0, 0);
      if (scale === 0) {
        continue;
      }
      canvas.save();
      canvas.translate(rightCenter - i * step, set.chipY + rise);
      canvas.scale(scale, scale);
      canvas.drawPicture(row[picks[i]]);
      canvas.restore();
    }

    if (words !== null) {
      const w = words.pillWidth;
      const h = PILL_HEIGHT;
      const r = h / 2;
      canvas.save();
      canvas.translate(set.width / 2 + shake, set.pillY + rise);
      canvas.scale(bump, bump);
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2 + 3, w, h), r, r), set.pillShadow);
      const body = Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2, w, h), r, r);
      set.pillFill.setColor(Skia.Color(tint));
      canvas.drawRRect(body, set.pillFill);
      canvas.save();
      canvas.clipRRect(body, ClipOp.Intersect, true);
      canvas.drawRect(Skia.XYWHRect(-w / 2, -h / 2, w, h * 0.55), set.pillGloss);
      canvas.restore();
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(-w / 2 + 0.75, -h / 2 + 0.75, w - 1.5, h - 1.5), r - 0.75, r - 0.75),
        set.pillBorder,
      );
      const x = -words.layoutWidth / 2;
      words.shadow.paint(canvas, x, -words.shadow.getHeight() / 2 + 1);
      words.fill.paint(canvas, x, -words.fill.getHeight() / 2);
      canvas.restore();
    }
    canvas.restore();
  }, set.bounds);
}
