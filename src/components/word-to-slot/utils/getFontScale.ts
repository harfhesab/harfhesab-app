/**
 * محاسبه‌ی ضریب مقیاس فونت بر اساس طول کلمه.
 *
 * نکته‌ی مهم: این تابع قبلا در سه فایل (DragDropContext.tsx، FloatingCard.tsx، DropZone.tsx)
 * به صورت جداگانه پیاده‌سازی شده بود و فرمول DragDropContext.tsx با دو فایل دیگر متفاوت بود.
 * نتیجه‌ی این ناهماهنگی این بود که بسته به این که سایز فونت از کدام مسیر (context یا خود کامپوننت)
 * محاسبه می‌شد، ممکن بود یک پرش/جهش ناگهانی در سایز فونت هنگام نشستن کارت در اسلات دیده شود.
 * حالا یک نسخه‌ی واحد و قابل تست وجود دارد که همه جا از همین استفاده می‌کنند.
 */
export function getFontScale(word: string): number {
  'worklet';
  const trimmed = (word || '').trim();
  const len = trimmed.length;

  if (len === 0) return 1.8;

  const hasSpace = /\s/.test(trimmed);
  const SINGLE_WORD_THRESHOLD = 9;

  let scale =
    1.75 -
    0.3 * Math.log(len + 1) -
    0.015 * len +
    0.35 / (len + 1) +
    0.15 * Math.exp(-Math.pow(len - 1, 2) / 2);

  if (!hasSpace) {
    if (len > SINGLE_WORD_THRESHOLD) {
      const excess = len - SINGLE_WORD_THRESHOLD;
      const penalty = 0.045 * excess + 0.12 * Math.log(excess + 1);
      scale -= penalty;
    } else {
      const boost = 0.28 * Math.exp(-len / 5) - 0.045;
      scale += Math.max(0, boost);
    }
  }

  const minScale = (!hasSpace && len > SINGLE_WORD_THRESHOLD) ? 0.8 : 0.95;

  return Math.max(minScale, Math.min(1.8, scale));
}

export default getFontScale;
