import { createPicture, Skia, type SkFont, type SkPaint, type SkPicture, type SkRect, type SkRRect, type SkTypeface } from '@shopify/react-native-skia';
import { REVEAL_STAGGER } from '../../constants/constants';
import { SLOT_COLORS, SLOT_FONT_RATIO } from '../../constants/theme';
import type { SlotRow } from '../../logic/slotsLayout';
import { centerGlyph } from '../../utils/glyph';
import { roundedRect, solidPaint, strokePaint, verticalGradientPaint } from '../../utils/skiaPaint';

export type SlotVariant = 'word' | 'main';

/** شکل‌ها و قلم‌موهای یک اندازه از خانه، با مرکز روی مبدأ. */
export interface SlotKit {
  font: SkFont | null;
  box: SkRRect;
  outline: SkRRect;
  gloss: SkRRect;
  empty: SkPaint;
  emptyLine: SkPaint;
  fill: SkPaint;
  shine: SkPaint;
  letterOutline: SkPaint;
  letter: SkPaint;
  hint: SkPaint;
}

export function createSlotKit(size: number, variant: SlotVariant, typeface: SkTypeface | null): SlotKit {
  const half = size / 2;
  const radius = size * (variant === 'main' ? 0.26 : 0.22);
  return {
    font: typeface && size > 0 ? Skia.Font(typeface, size * SLOT_FONT_RATIO) : null,
    box: roundedRect(-half, -half, size, size, radius),
    outline: roundedRect(-half + 0.75, -half + 0.75, size - 1.5, size - 1.5, radius),
    gloss: roundedRect(-half + size * 0.1, -half + size * 0.06, size * 0.8, size * 0.4, radius * 0.7),
    empty: solidPaint(SLOT_COLORS.empty),
    emptyLine:
      variant === 'main' ? strokePaint(SLOT_COLORS.emptyLineMain, 1.6) : strokePaint(SLOT_COLORS.emptyLine, 1),
    fill: verticalGradientPaint(-half, half, variant === 'main' ? SLOT_COLORS.main : SLOT_COLORS.word),
    shine: verticalGradientPaint(-half, -half + size * 0.46, [SLOT_COLORS.gloss, 'rgba(255, 255, 255, 0)']),
    letterOutline: strokePaint(SLOT_COLORS.letterOutline, size * 0.09),
    letter: solidPaint(SLOT_COLORS.letter),
    hint: solidPaint(SLOT_COLORS.hint),
  };
}

export interface SlotItem {
  kit: SlotKit;
  /** مرکز خانه و نقطه‌ی شروع حرف (نسبت به مرکز). */
  boxes: { cx: number; cy: number; letter: string; x: number; y: number }[];
}

export function createSlotItem(row: SlotRow, kit: SlotKit): SlotItem {
  return {
    kit,
    boxes: row.boxes.map(box => {
      const glyph = centerGlyph(kit.font, box.letter);
      return { cx: box.cx, cy: box.cy, letter: box.letter, x: glyph.x, y: glyph.y };
    }),
  };
}

/**
 * همه‌ی خانه‌ها را ضبط می‌کند. `reveal`، `hints` و `hintPop` برای هر کلمه به ترتیب `slotWords`
 * هستند (`SlotEffects`)؛ `hintPop` برابر null یعنی بدون انیمیشن.
 */
export function drawSlots(
  items: readonly SlotItem[],
  reveal: readonly number[],
  hints: readonly number[],
  hintPop: readonly number[] | null,
  bounds: SkRect,
): SkPicture {
  'worklet';
  return createPicture(canvas => {
    for (let w = 0; w < items.length; w++) {
      const { kit, boxes } = items[w];
      const span = 1 + REVEAL_STAGGER * (boxes.length - 1);
      const pop = hintPop === null ? 0 : Math.sin(Math.PI * hintPop[w]);
      for (let j = 0; j < boxes.length; j++) {
        const box = boxes[j];
        // هر خانه سهم خودش را از پیشرفت کلمه دارد، کمی بعد از خانه‌ی قبلی.
        const t = Math.min(1, Math.max(0, reveal[w] * span - j * REVEAL_STAGGER));
        const filled = Math.min(1, t * 2);
        const hinted = j < hints[w];
        const hintScale = j === hints[w] - 1 ? 0.2 * pop * (1 - filled) : 0;
        const scale = 1 + 0.22 * Math.sin(Math.PI * t) + hintScale;

        canvas.save();
        canvas.translate(box.cx, box.cy);
        canvas.scale(scale, scale);
        canvas.drawRRect(kit.box, kit.empty);
        canvas.drawRRect(kit.outline, kit.emptyLine);
        if (filled > 0) {
          kit.fill.setAlphaf(filled);
          canvas.drawRRect(kit.box, kit.fill);
          kit.shine.setAlphaf(filled);
          canvas.drawRRect(kit.gloss, kit.shine);
          if (kit.font !== null) {
            kit.letterOutline.setAlphaf(0.85 * filled);
            canvas.drawText(box.letter, box.x, box.y, kit.letterOutline, kit.font);
            kit.letter.setAlphaf(filled);
            canvas.drawText(box.letter, box.x, box.y, kit.letter, kit.font);
          }
        }
        // حرف راهنما همان فریم اول کامل دیده می‌شود؛ فقط یک پرش کوتاه دارد.
        if (hinted && filled < 1 && kit.font !== null) {
          kit.hint.setAlphaf(1 - filled);
          canvas.drawText(box.letter, box.x, box.y, kit.hint, kit.font);
        }
        canvas.restore();
      }
    }
  }, bounds);
}
