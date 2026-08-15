import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, LayoutChangeEvent, Platform, StyleSheet, Text, TextStyle, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useExpandableTextMeasurement } from './useExpandableTextMeasurement';
import type { ExpandableTextProps } from './types';

const DEFAULT_NUMBER_OF_LINES = 2;
const DEFAULT_MORE_LABEL = 'بیشتر';
const DEFAULT_LESS_LABEL = 'کمتر';
const DEFAULT_TOGGLE_COLOR = '#1976D2';
const DEFAULT_DURATION = 320;
const DEFAULT_ELLIPSIS = '… ';
const DEFAULT_SAFETY_MARGIN = 12;

/**
 * روی اندروید، وقتی I18nManager.isRTL فعال است (پروژه‌ی global RTL)، خودِ
 * سیستم‌عامل مقادیرِ مطلقِ textAlign را «آینه» می‌کند؛ یعنی اگر 'right' را
 * صریحاً ست کنیم، نتیجه‌ی نهایی چپ‌چین می‌شود و برعکس. این تابع همان
 * رفتار را جبران می‌کند تا خروجیِ بصری همیشه با direction درخواستی مطابق باشد.
 */
function resolveTextAlign(direction: 'rtl' | 'ltr'): 'left' | 'right' {
  const androidMirrors = Platform.OS === 'android' && I18nManager.isRTL;
  if (androidMirrors) {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return direction === 'rtl' ? 'right' : 'left';
}

function ExpandableTextBase({
  text,
  numberOfLines = DEFAULT_NUMBER_OF_LINES,
  moreLabel = DEFAULT_MORE_LABEL,
  lessLabel = DEFAULT_LESS_LABEL,
  moreLabelColor = DEFAULT_TOGGLE_COLOR,
  lessLabelColor,
  toggleTextStyle,
  textStyle,
  containerStyle,
  direction = 'rtl',
  animationDuration = DEFAULT_DURATION,
  ellipsis = DEFAULT_ELLIPSIS,
  truncationSafetyMargin = DEFAULT_SAFETY_MARGIN,
  expanded,
  defaultExpanded = false,
  onToggle,
  disabled = false,
}: ExpandableTextProps) {
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? (expanded as boolean) : internalExpanded;

  // عرض واقعیِ در دسترسِ متن؛ از یک View داخلیِ بدون padding اندازه‌گیری
  // می‌شود تا با padding/margin احتمالیِ containerStyle اشتباه گرفته نشود
  const [contentWidth, setContentWidth] = useState(0);

  const baseTextStyle = useMemo(
    () => [
      styles.baseText,
      {
        textAlign: resolveTextAlign(direction),
        writingDirection: direction,
      },
      textStyle,
    ],
    [direction, textStyle],
  );

  // کلیدی که فقط با تغییرِ خصوصیت‌های مؤثر بر متریکِ فونت عوض می‌شود
  const fontKey = useMemo(() => {
    const flat = (StyleSheet.flatten([styles.baseText, textStyle]) ?? {}) as TextStyle;
    return [
      flat.fontFamily ?? '',
      flat.fontSize ?? '',
      flat.fontWeight ?? '',
      flat.lineHeight ?? '',
      flat.letterSpacing ?? '',
    ].join('|');
  }, [textStyle]);

  const toggleStyle = useCallback(
    (isMore: boolean) => [
      styles.toggleText,
      { color: isMore ? moreLabelColor : lessLabelColor ?? moreLabelColor },
      toggleTextStyle,
    ],
    [moreLabelColor, lessLabelColor, toggleTextStyle],
  );

  const {
    isTruncated,
    collapsedText,
    collapsedHeight,
    expandedHeight,
    isReady,
    needsMeasuring,
    onFullTextLayout,
  } = useExpandableTextMeasurement(text, {
    containerWidth: contentWidth,
    numberOfLines,
    ellipsis,
    safetyMargin: truncationSafetyMargin,
    moreLabel,
    lessLabel,
    fontKey,
  });

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContentWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
  }, []);

  // --- انیمیشن، به‌طور کامل روی UI Thread ---
  const progress = useSharedValue(isExpanded ? 1 : 0);
  const collapsedH = useSharedValue(0);
  const expandedH = useSharedValue(0);
  const didMount = useRef(false);

  // useLayoutEffect (نه useEffect) تا مقدار ارتفاع قبل از نقاشیِ فریم روی
  // صفحه به‌روز شود و هیچ فلاش/پرشی دیده نشود
  useLayoutEffect(() => {
    collapsedH.value = collapsedHeight;
    expandedH.value = expandedHeight;
  }, [collapsedHeight, expandedHeight, collapsedH, expandedH]);

  useEffect(() => {
    const target = isExpanded ? 1 : 0;
    if (!didMount.current) {
      progress.value = target; // بدون انیمیشن در اولین رندر
      didMount.current = true;
      return;
    }
    progress.value = withTiming(target, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpanded, animationDuration, progress]);

  const handleToggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onToggle?.(next);
  }, [isExpanded, isControlled, onToggle]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    if (collapsedH.value === 0 && expandedH.value === 0) return {};
    return {
      height: interpolate(
        progress.value,
        [0, 1],
        [collapsedH.value, expandedH.value],
        Extrapolation.CLAMP,
      ),
    };
  });

  const collapsedLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35, 1], [1, 0, 0], Extrapolation.CLAMP),
  }));

  const expandedLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.65, 1], [0, 0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={containerStyle}>
      <View onLayout={onContentLayout}>
        {/* --- تنها پروبِ مخفیِ لازم: فقط متنِ کامل (بدون محدودیتِ خط) --- */}
        {needsMeasuring && (
          <View style={styles.hiddenProbe} pointerEvents="none">
            <Text
              style={[baseTextStyle, { width: contentWidth }]}
              onTextLayout={onFullTextLayout}
            >
              {text}
            </Text>
          </View>
        )}

        {disabled ? (
          <Text style={baseTextStyle}>{text}</Text>
        ) : !isReady ? (
          // قبل از آماده‌شدن اندازه‌گیری، همان استایل/تعداد خطِ نهایی نشان
          // داده می‌شود تا کمترین پرشِ ممکن رخ دهد (این حالت باید فقط یک فریم طول بکشد)
          <Text style={baseTextStyle} numberOfLines={numberOfLines}>
            {text}
          </Text>
        ) : !isTruncated ? (
          <Text style={baseTextStyle}>{text}</Text>
        ) : (
          <Animated.View style={[styles.animatedContainer, containerAnimatedStyle]}>
            {/* لایه‌ی بسته: متنِ بریده‌شده + «بیشتر» درست در انتهای خط آخر */}
            <Animated.View
              style={[styles.layer, collapsedLayerStyle]}
              pointerEvents={isExpanded ? 'none' : 'auto'}
            >
              <Text style={baseTextStyle} numberOfLines={numberOfLines}>
                {collapsedText}
                {ellipsis}
                <Text onPress={handleToggle} style={toggleStyle(true)} suppressHighlighting>
                  {moreLabel}
                </Text>
              </Text>
            </Animated.View>

            {/* لایه‌ی باز: متنِ کامل + «کمتر» در انتهای آخرین خط */}
            <Animated.View
              style={[styles.layer, expandedLayerStyle]}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              <Text style={baseTextStyle}>
                {text}
                {'  '}
                <Text onPress={handleToggle} style={toggleStyle(false)} suppressHighlighting>
                  {lessLabel}
                </Text>
              </Text>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  toggleText: {
    fontWeight: '600',
  },
  hiddenProbe: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    left: 0,
    right: 0,
    top: 0,
  },
  animatedContainer: {
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});

export const ExpandableText = memo(ExpandableTextBase);
export default ExpandableText;
