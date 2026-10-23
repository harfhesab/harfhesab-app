/**
 * فقط داخل worklet روی UI thread مقدار true دارد.
 *
 * در Reanimated 3 خواندن `.value` روی JS thread یک رفت‌وبرگشتِ همزمان (blocking) به UI thread است.
 * هر derived value و animated style یک بار هنگام mount روی JS اجرا می‌شود؛ وقتی ده‌ها تا از آن‌ها
 * در صفحه باشند (به‌خصوص وسط انیمیشن باز شدن صفحه که UI thread مشغول است) همین خواندن‌ها باز شدن
 * صفحه را کند می‌کنند. با این شرط مقدار اولیه بدون خواندن shared value ساخته می‌شود.
 */
export function onUIThread(): boolean {
  'worklet';
  return _WORKLET === true;
}
