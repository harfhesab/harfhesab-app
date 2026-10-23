import React, { memo, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Picture, Skia, type SkTypefaceFontProvider } from '@shopify/react-native-skia';
import { useLettersSelection, useLettersStatic } from '../../context/LettersContext';
import { useGlobalFonts } from '../../../../context/SkiaFontProvider';
import { FEEDBACK_FADE_MS } from '../../constants/constants';
import { BAR_COLORS, CHIP_VERDICTS, TILE_FONT_RATIO } from '../../constants/theme';
import { onUIThread } from '../../utils/worklet';
import Font from '../../../../utils/Font';
import { PILL_GAP, WORD_BAR_HEIGHT, chipSizeFor, createWordBarSet, drawWordBar, emptyWordBarPicture } from './chipPictures';
import { PILL_HEIGHT, buildWordParagraphs, probeParagraph, type WordParagraphs } from './wordParagraph';

const HEIGHT = WORD_BAR_HEIGHT;
/** عرضی که متن کلمه‌ی پیوسته می‌تواند بگیرد (دو طرف padding و حاشیه‌ی pill کم شده). */
const WORD_ROOM = 80;
const GLOSS_COLORS = ['rgba(255, 255, 255, 0.38)', 'rgba(255, 255, 255, 0)'];

interface WordCanvasProps {
  canvasWidth: number;
  size: number;
  fontMgr: SkTypefaceFontProvider | null;
  paragraphOk: SharedValue<boolean>;
  shake: SharedValue<number>;
  bump: SharedValue<number>;
}

/**
 * مهره‌ی هر حرف انتخاب‌شده و کلمه‌ی پیوسته‌ی زیر آن. همه با Skia و روی UI thread از `WordBarFx` کشیده
 * می‌شوند؛ خود worklet لمس (`pickAt`) همان لحظه آن را به‌روز می‌کند، پس نمایش منتظر JS thread و
 * رندر React نمی‌ماند. متن با Paragraph ساخته می‌شود تا حروف فارسی درست به هم بچسبند.
 */
const WordCanvas = memo(function WordCanvas({
  canvasWidth,
  size,
  fontMgr,
  paragraphOk,
  shake,
  bump,
}: WordCanvasProps) {
  const { model, typeface, wordBar } = useLettersStatic();

  const set = useMemo(
    () =>
      createWordBarSet(
        model.letters,
        size,
        typeface ? Skia.Font(typeface, size * TILE_FONT_RATIO) : null,
        canvasWidth,
        HEIGHT,
      ),
    [model.letters, size, typeface, canvasWidth],
  );
  // فریم اول روی JS خالی کشیده می‌شود، بدون خواندن shared valueها از UI thread.
  const empty = useMemo(() => emptyWordBarPicture(set), [set]);
  const letters = model.letters;
  const layoutWidth = Math.max(40, canvasWidth - WORD_ROOM);

  // فقط وقتی حروف انتخاب‌شده عوض شوند دوباره ساخته می‌شود، نه در هر فریم انیمیشن.
  const words = useDerivedValue<WordParagraphs | null>(() => {
    if (!onUIThread() || fontMgr === null || !paragraphOk.value) {
      return null;
    }
    const picks = wordBar.picks.value;
    if (picks.length === 0) {
      return null;
    }
    let text = '';
    for (let i = 0; i < picks.length; i++) {
      text += letters[picks[i]];
    }
    try {
      return buildWordParagraphs(fontMgr, text, layoutWidth);
    } catch (error) {
      return null;
    }
  });

  const picture = useDerivedValue(() => {
    if (!onUIThread()) {
      return empty;
    }
    return drawWordBar(
      set,
      wordBar.picks.value,
      wordBar.scales.map(scale => scale.value),
      wordBar.slide.value,
      wordBar.verdict.value,
      wordBar.visibility.value,
      words.value,
      wordBar.tint.value,
      shake.value,
      bump.value,
    );
  });

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: canvasWidth, height: HEIGHT }}>
      <Picture picture={picture} />
    </Canvas>
  );
});

/**
 * کلمه‌ی در حال ساخت: یک مهره برای هر حرف انتخاب‌شده و کلمه‌ی پیوسته زیر آن. بعد از ثبت،
 * با پرش / لرزش / تکان، سبز / قرمز / آبی می‌شود و سپس محو می‌شود.
 *
 * مهره‌ها و کلمه با Skia از روی UI thread کشیده می‌شوند. اگر ساخت Paragraph روی UI thread در این
 * دستگاه کار نکند (یا فونت هنوز آماده نباشد)، همان کلمه‌ی پیوسته‌ی قبلی با Text بومی نشان داده می‌شود.
 */
function CurrentWord() {
  const bar = useLettersSelection();
  const { model, wordBar } = useLettersStatic();
  const { customFontMgr } = useGlobalFonts();
  const { width } = useWindowDimensions();
  const chipSize = useMemo(() => chipSizeFor(width, model.letters.length), [width, model.letters.length]);

  const shake = useSharedValue(0);
  const bump = useSharedValue(1);
  const pillVisibility = useSharedValue(0);
  const paragraphOk = useSharedValue(false);
  // تا وقتی بررسیِ Paragraph روی UI thread موفق نشده، کلمه‌ی پیوسته با Text بومی نشان داده می‌شود.
  const [nativeWord, setNativeWord] = useState(true);

  useEffect(() => {
    if (!customFontMgr) {
      return;
    }
    runOnUI(() => {
      'worklet';
      const ok = probeParagraph(customFontMgr);
      paragraphOk.value = ok;
      runOnJS(setNativeWord)(!ok);
    })();
  }, [customFontMgr, paragraphOk]);

  const visible = bar.letters.length > 0 && !bar.fading;
  // useLayoutEffect: انیمیشن‌ها همان لحظه‌ی commit شروع می‌شوند. fade-in مهره‌ها را خود worklet لمس
  // شروع کرده است و اینجا فقط هم‌سو می‌شود؛ fade-out (بعد از ثبت) را همین‌جا JS مشخص می‌کند.
  useLayoutEffect(() => {
    const config = { duration: visible ? 120 : FEEDBACK_FADE_MS };
    pillVisibility.value = withTiming(visible ? 1 : 0, config);
    wordBar.visibility.value = withTiming(visible ? 1 : 0, config);
  }, [pillVisibility, wordBar, visible]);

  useLayoutEffect(() => {
    wordBar.verdict.value = CHIP_VERDICTS.indexOf(bar.verdict ?? 'building');
    if (bar.verdict === 'success') {
      bump.value = withSequence(withTiming(1.18, { duration: 140 }), withSpring(1, { stiffness: 260, damping: 9 }));
    } else if (bar.verdict === 'duplicate') {
      bump.value = withSequence(withTiming(0.9, { duration: 100 }), withSpring(1, { stiffness: 260, damping: 10 }));
    } else if (bar.verdict === 'error') {
      shake.value = withSequence(
        withTiming(-9, { duration: 45 }),
        withTiming(9, { duration: 70 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 55 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [bump, shake, wordBar, bar.verdict]);

  // رنگ کلمه با عوض شدن نتیجه، روی UI thread نرم عوض می‌شود (شروع کلمه‌ی جدید آن را فوراً به حالت
  // «در حال ساخت» برمی‌گرداند).
  useAnimatedReaction(
    () => wordBar.verdict.value,
    (current, previous) => {
      if (current !== previous) {
        wordBar.tint.value = withTiming(BAR_COLORS[CHIP_VERDICTS[current]], { duration: 180 });
      }
    },
  );

  // فقط برای حالت جایگزین (Text بومی). روی JS (رندر اول) مقدار ثابت؛ خواندن shared value آنجا یک
  // رفت‌وبرگشت همزمان به UI thread است.
  const pillStyle = useAnimatedStyle(() => {
    if (!onUIThread()) {
      return {
        opacity: 0,
        backgroundColor: BAR_COLORS.building,
        transform: [{ translateY: 6 }, { translateX: 0 }, { scale: 1 }],
      };
    }
    const shown = pillVisibility.value;
    return {
      opacity: shown,
      backgroundColor: wordBar.tint.value,
      transform: [{ translateY: (1 - shown) * 6 }, { translateX: shake.value }, { scale: bump.value }],
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <WordCanvas
        canvasWidth={width}
        size={chipSize}
        fontMgr={customFontMgr ?? null}
        paragraphOk={paragraphOk}
        shake={shake}
        bump={bump}
      />
      {/* جای مهره‌ها که Canvas در آن می‌کشد. */}
      <View style={{ height: chipSize }} />
      {nativeWord ? (
        <Animated.View style={[styles.pill, pillStyle]}>
          <LinearGradient colors={GLOSS_COLORS} style={styles.pillGloss} />
          <Text style={styles.word} numberOfLines={1}>
            {bar.letters.join('')}
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.pillSpace} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PILL_GAP,
  },
  pillSpace: {
    height: PILL_HEIGHT,
  },
  pill: {
    minWidth: 64,
    paddingHorizontal: 18,
    height: PILL_HEIGHT,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    elevation: 6,
  },
  pillGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  word: {
    fontFamily: Font.bakh_black,
    fontSize: 18,
    color: '#ffffff',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(CurrentWord);
