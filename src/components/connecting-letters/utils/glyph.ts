import type { SkFont } from '@shopify/react-native-skia';

/**
 * نقطه‌ی شروع خط پایه که *جوهرِ* `text` را دقیقاً روی (0, centerY) وسط‌چین می‌کند. برای حروف تکیِ
 * فارسی که نقطه‌ها و دنباله‌هایشان خیلی متفاوت است، وسط‌چینی بصری از وسط‌چینی متریک بهتر است.
 */
export function centerGlyph(font: SkFont | null, text: string, centerY = 0): { x: number; y: number } {
  if (!font) {return { x: 0, y: centerY };}
  const bounds = font.measureText(text);
  return { x: -(bounds.x + bounds.width / 2), y: centerY - (bounds.y + bounds.height / 2) };
}
