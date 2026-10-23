import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { Canvas, Picture, type SkTypefaceFontProvider } from '@shopify/react-native-skia';
import { useLettersStatic } from '../../context/LettersContext';
import { useGlobalFonts } from '../../../../context/SkiaFontProvider';
import type { HiddenWordFx } from '../../engine/hiddenWordFx';
import { onUIThread } from '../../utils/worklet';
import { chipSizeFor, pillCenterOffset } from './chipPictures';
import {
  createHiddenWordKit,
  drawHiddenWordFx,
  emptyHiddenWordPicture,
  type HiddenWordKit,
} from './hiddenWordPictures';
import { buildWordParagraphs, useParagraphSupport, type WordParagraphs } from './wordParagraph';

/** عرضی که متنِ کلمه‌ی در حال پرواز می‌تواند بگیرد. */
const FLYING_WORD_WIDTH = 220;

interface CanvasProps {
  kit: HiddenWordKit;
  fx: HiddenWordFx;
  fontMgr: SkTypefaceFontProvider | null;
  paragraphOk: SharedValue<boolean>;
}

/**
 * وقتی هیچ افکتی در کار نیست، هیچ فریمی ساخته نمی‌شود: تصویر فقط با تغییر `progress` یا مختصات
 * دوباره ساخته می‌شود و کلمه‌ها فقط وقتی متنشان عوض شود Paragraph جدید می‌گیرند.
 */
const HiddenWordCanvas = memo(function HiddenWordCanvas({ kit, fx, fontMgr, paragraphOk }: CanvasProps) {
  const empty = useMemo(() => emptyHiddenWordPicture(kit), [kit]);
  // فقط shared valueها وارد worklet می‌شوند؛ `fx` خودش ref به view بومی دارد و قابل کپی به UI thread نیست.
  const { lanes, buttonX, buttonY, currentWordY } = fx;

  const texts = useDerivedValue<(WordParagraphs | null)[]>(() => {
    if (!onUIThread() || fontMgr === null || !paragraphOk.value) {
      return lanes.map(() => null);
    }
    return lanes.map(lane => {
      const word = lane.word.value;
      if (word.length === 0) {
        return null;
      }
      try {
        return buildWordParagraphs(fontMgr, word, FLYING_WORD_WIDTH);
      } catch (error) {
        return null;
      }
    });
  });

  const picture = useDerivedValue(() => {
    if (!onUIThread()) {
      return empty;
    }
    return drawHiddenWordFx(
      kit,
      lanes.map(lane => lane.progress.value),
      lanes.map(lane => lane.seed.value),
      texts.value,
      buttonX.value,
      buttonY.value,
      currentWordY.value,
    );
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Picture picture={picture} />
    </Canvas>
  );
});

/**
 * افکت پیدا شدن کلمه‌ی پنهان: کلمه از نوار «کلمه‌ی فعلی» جدا می‌شود، با دنباله‌ی نور به دکمه‌ی
 * «کلمات پنهان» می‌افتد و دکمه با رسیدنش نور و جرقه پخش می‌کند. کل ناحیه‌ی بالای صفحه را می‌پوشاند و
 * لمس‌ها را رد می‌کند.
 */
function HiddenWordEffect() {
  const { model, hiddenFx } = useLettersStatic();
  const { customFontMgr } = useGlobalFonts();
  const { width: windowWidth } = useWindowDimensions();
  const paragraphOk = useParagraphSupport(customFontMgr ?? null);
  const containerRef = useRef<View>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  // مختصات دکمه نسبت به این ناحیه؛ هر دو با measureInWindow سنجیده می‌شوند تا به ساختار view وابسته نباشد.
  const measure = useCallback(() => {
    const container = containerRef.current;
    const button = hiddenFx.buttonRef.current;
    if (!container || !button) {
      return;
    }
    container.measureInWindow((containerX, containerY) => {
      button.measureInWindow((x, y, width, height) => {
        if (![containerX, containerY, x, y, width, height].every(Number.isFinite)) {
          return;
        }
        hiddenFx.buttonX.value = x - containerX + width / 2;
        hiddenFx.buttonY.value = y - containerY + height / 2;
      });
    });
  }, [hiddenFx]);

  useEffect(() => {
    hiddenFx.measure.current = measure;
    return () => {
      if (hiddenFx.measure.current === measure) {
        hiddenFx.measure.current = null;
      }
    };
  }, [hiddenFx, measure]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize(prev => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
      measure();
    },
    [measure],
  );

  const startOffset = useMemo(
    () => pillCenterOffset(chipSizeFor(windowWidth, model.letters.length)),
    [windowWidth, model.letters.length],
  );
  const kit = useMemo(
    () => (size ? createHiddenWordKit(size.width, size.height, startOffset) : null),
    [size, startOffset],
  );

  return (
    <View ref={containerRef} style={styles.overlay} pointerEvents="none" collapsable={false} onLayout={onLayout}>
      {kit && <HiddenWordCanvas kit={kit} fx={hiddenFx} fontMgr={customFontMgr ?? null} paragraphOk={paragraphOk} />}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // هدر (TopHeader) zIndex 1 دارد؛ افکت باید روی دکمه‌ی زیر آن کشیده شود.
    zIndex: 5,
  },
});

export default memo(HiddenWordEffect);
