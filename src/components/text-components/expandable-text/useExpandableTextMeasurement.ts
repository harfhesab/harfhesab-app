import { useCallback, useEffect, useState } from 'react';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import type { TextLineMeasurement } from './types';

interface MeasurementInput {
  containerWidth: number;
  numberOfLines: number;
  ellipsis: string;
  safetyMargin: number;
  moreLabel: string;
  lessLabel: string;
  /** خصوصیت‌های مؤثر بر متریکِ فونت، به‌صورتِ یک کلید؛ فقط با تغییر واقعیِ آن‌ها دوباره اندازه‌گیری می‌شود */
  fontKey: string;
}

interface MeasurementState {
  isReady: boolean;
  isTruncated: boolean;
  collapsedText: string;
  collapsedHeight: number;
  expandedHeight: number;
}

const INITIAL_STATE: MeasurementState = {
  isReady: false,
  isTruncated: false,
  collapsedText: '',
  collapsedHeight: 0,
  expandedHeight: 0,
};

// برچسبِ «بیشتر/کمتر» معمولا بولد است؛ کمی عریض‌تر از میانگینِ کاراکترهای
// معمولیِ همان خط برآورد می‌شود تا نیازی به یک پروبِ اندازه‌گیریِ جداگانه نباشد.
// این ضریب و حاشیه‌ی اطمینانِ اضافه (EXTRA_GUARD_CHARS) عمدا محافظه‌کارانه
// انتخاب شده‌اند: بهتر است متنِ بریده‌شده چند پیکسل زودتر از حدِ لازم تمام
// شود، تا اینکه برچسب وسطِ کلمه بریده شود یا اصلا جا نشود.
const BOLD_WIDTH_FACTOR = 1.35;
const EXTRA_GUARD_CHARS = 2;

function trimTrailingWord(value: string): string {
  const trimmed = value.replace(/\s*\S*$/, '').trim();
  return trimmed.length > 0 ? trimmed : value.slice(0, Math.max(0, value.length - 1)).trim();
}

/**
 * فقط به یک رفت‌وبرگشتِ اندازه‌گیریِ native در هر آیتم نیاز دارد (نه ۸ تا مثل
 * نسخه‌ی قبل)، که روی لیست‌های بلند تفاوتِ محسوسی در سرعت/عدم‌پرش ایجاد می‌کند:
 *
 *  - فقط متنِ کامل (بدون محدودیتِ خط) اندازه‌گیری می‌شود تا خطوطِ واقعی و
 *    عرضِ هر خط به‌دست بیاید.
 *  - عرضِ برچسبِ بیشتر/کمتر و ارتفاعِ حالتِ باز، از رویِ همین داده به‌صورت
 *    تحلیلی (بدون پروبِ اضافه) تخمین زده می‌شود.
 *
 * این یعنی خروجی «تقریبی‌ترِ چند پیکسل» است (نه صددرصد پیکسل‌به‌پیکسل)، اما
 * در ازایش هیچ تاخیر/پرشِ محسوسی روی لیست‌های بزرگ ایجاد نمی‌کند.
 */
export function useExpandableTextMeasurement(
  text: string,
  {
    containerWidth,
    numberOfLines,
    ellipsis,
    safetyMargin,
    moreLabel,
    lessLabel,
    fontKey,
  }: MeasurementInput,
) {
  const [state, setState] = useState<MeasurementState>(INITIAL_STATE);

  useEffect(() => {
    setState(INITIAL_STATE);
  }, [text, containerWidth, numberOfLines, ellipsis, safetyMargin, moreLabel, lessLabel, fontKey]);

  const onFullTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      const lines: TextLineMeasurement[] = e.nativeEvent.lines.map((l) => ({
        text: l.text,
        width: l.width,
        height: l.height,
      }));
      const totalLines = lines.length;

      if (totalLines <= numberOfLines) {
        const fullHeight = lines.reduce((sum, l) => sum + l.height, 0);
        setState({
          isReady: true,
          isTruncated: false,
          collapsedText: text,
          collapsedHeight: fullHeight,
          expandedHeight: fullHeight,
        });
        return;
      }

      // ایندکس تقریبیِ پایانِ محتوای قابل‌نمایش، مستقیم روی متنِ اصلی
      // محاسبه می‌شود (نه با چسباندن قطعات خط‌های جدا)
      let charIndex = 0;
      for (let i = 0; i < numberOfLines; i++) {
        charIndex += lines[i].text.length;
        if (i < numberOfLines - 1) charIndex += 1; // فاصله‌ی حذف‌شده در نقطه‌ی شکست خط
      }
      charIndex = Math.min(charIndex, text.length);

      const lastVisibleLine = lines[numberOfLines - 1];

      // میانگینِ عرضِ کاراکتر از رویِ مجموعِ همه‌ی خطوطِ قابل‌نمایش محاسبه
      // می‌شود (نه فقط خطِ آخر)، چون خطِ آخر گاهی کوتاه است و میانگینِ
      // ناپایدار/غیرقابل‌اعتمادی می‌دهد؛ میانگینِ چندخطی پایدارتر است.
      const visibleLines = lines.slice(0, numberOfLines);
      const totalVisibleChars = visibleLines.reduce((sum, l) => sum + l.text.length, 0);
      const totalVisibleWidth = visibleLines.reduce((sum, l) => sum + l.width, 0);
      const avgCharWidth = totalVisibleChars > 0 ? totalVisibleWidth / totalVisibleChars : 0;

      const estimatedLabelWidth = moreLabel.length * avgCharWidth * BOLD_WIDTH_FACTOR;
      const availableSpace = containerWidth - lastVisibleLine.width;
      const neededSpace =
        estimatedLabelWidth +
        avgCharWidth * ellipsis.length +
        avgCharWidth * EXTRA_GUARD_CHARS +
        safetyMargin;

      if (availableSpace < neededSpace && avgCharWidth > 0) {
        const deficit = neededSpace - availableSpace;
        const charsToRemove = Math.ceil(deficit / avgCharWidth);
        charIndex = Math.max(0, charIndex - charsToRemove);
      }

      let collapsedText = text.slice(0, charIndex);
      collapsedText = trimTrailingWord(collapsedText + ' ');

      const collapsedHeight = lines.slice(0, numberOfLines).reduce((sum, l) => sum + l.height, 0);

      // ارتفاعِ حالتِ باز: مجموعِ ارتفاعِ همه‌ی خطوط، به‌علاوه‌ی یک خطِ اضافه
      // فقط اگر برچسبِ «کمتر» روی آخرین خطِ واقعیِ متن جا نشود
      const realLastLine = lines[lines.length - 1];
      const estimatedLessLabelWidth = lessLabel.length * avgCharWidth * BOLD_WIDTH_FACTOR;
      const spaceOnRealLastLine = containerWidth - realLastLine.width;
      const labelFitsOnLastLine = spaceOnRealLastLine >= estimatedLessLabelWidth + safetyMargin;
      const naturalHeight = lines.reduce((sum, l) => sum + l.height, 0);
      const expandedHeight = labelFitsOnLastLine
        ? naturalHeight
        : naturalHeight + (lines[0]?.height ?? realLastLine.height);

      setState({
        isReady: true,
        isTruncated: true,
        collapsedText,
        collapsedHeight,
        expandedHeight,
      });
    },
    [containerWidth, ellipsis, lessLabel, moreLabel, numberOfLines, safetyMargin, text],
  );

  const needsMeasuring = containerWidth > 0 && !state.isReady;

  return {
    ...state,
    needsMeasuring,
    onFullTextLayout,
  };
}