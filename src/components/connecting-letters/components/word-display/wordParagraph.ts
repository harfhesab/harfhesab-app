import { useEffect } from 'react';
import { runOnUI, useSharedValue, type SharedValue } from 'react-native-reanimated';
import {
  BlurStyle,
  Skia,
  TextAlign,
  TextDirection,
  type SkParagraph,
  type SkTypefaceFontProvider,
} from '@shopify/react-native-skia';

/** نام فونت کلمه‌ی پیوسته در `customFontMgr` (همان نامی که `DynamicProSkiaText` استفاده می‌کند). */
export const PILL_FONT_NAME = 'YekanBakh-Black';
export const PILL_FONT_SIZE = 18;
export const PILL_HEIGHT = 34;
export const PILL_MIN_WIDTH = 64;
/** padding افقی (۱۸) + ضخامت حاشیه (۱.۵) در هر طرف. */
const PILL_SIDE = 18 + 1.5;

export interface WordParagraphs {
  fill: SkParagraph;
  shadow: SkParagraph;
  layoutWidth: number;
  pillWidth: number;
}

/**
 * پاراگراف‌های کلمه‌ی پیوسته: متن سفید و سایه‌ی نرمش. Paragraph حروف فارسی را درست می‌چسباند و
 * وقتی روی UI thread ساخته شود، کلمه همان لحظه‌ی انتخاب حرف و بدون رندر React آماده است.
 * هر بار فقط وقتی حروف انتخاب‌شده عوض شوند صدا زده می‌شود.
 */
export function buildWordParagraphs(
  fontMgr: SkTypefaceFontProvider,
  text: string,
  layoutWidth: number,
): WordParagraphs {
  'worklet';
  const safeText = text.length > 0 ? text : ' ';
  const paragraphStyle = { textAlign: TextAlign.Center, textDirection: TextDirection.RTL };

  const fillBuilder = Skia.ParagraphBuilder.Make(paragraphStyle, fontMgr);
  fillBuilder.pushStyle({
    fontFamilies: [PILL_FONT_NAME],
    fontSize: PILL_FONT_SIZE,
    color: Skia.Color('#ffffff'),
  });
  fillBuilder.addText(safeText);
  const fill = fillBuilder.build();
  fill.layout(layoutWidth);

  const shadowPaint = Skia.Paint();
  shadowPaint.setAntiAlias(true);
  shadowPaint.setColor(Skia.Color('rgba(0, 0, 0, 0.35)'));
  shadowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 1.2, true));
  const shadowBuilder = Skia.ParagraphBuilder.Make(paragraphStyle, fontMgr);
  shadowBuilder.pushStyle({ fontFamilies: [PILL_FONT_NAME], fontSize: PILL_FONT_SIZE }, shadowPaint);
  shadowBuilder.addText(safeText);
  const shadow = shadowBuilder.build();
  shadow.layout(layoutWidth);

  return {
    fill,
    shadow,
    layoutWidth,
    pillWidth: Math.max(PILL_MIN_WIDTH, Math.ceil(fill.getLongestLine()) + PILL_SIDE * 2),
  };
}

/** بررسی یک‌باره روی UI thread که ساخت Paragraph آنجا کار می‌کند. */
export function probeParagraph(fontMgr: SkTypefaceFontProvider): boolean {
  'worklet';
  try {
    return buildWordParagraphs(fontMgr, 'سلام', 200).fill.getLongestLine() > 0;
  } catch (error) {
    return false;
  }
}

/** مقدار `true` یعنی ساخت Paragraph روی UI thread در این دستگاه کار می‌کند (بعد از آماده شدن فونت). */
export function useParagraphSupport(fontMgr: SkTypefaceFontProvider | null): SharedValue<boolean> {
  const supported = useSharedValue(false);
  useEffect(() => {
    if (!fontMgr) {
      return;
    }
    runOnUI(() => {
      'worklet';
      supported.value = probeParagraph(fontMgr);
    })();
  }, [fontMgr, supported]);
  return supported;
}
