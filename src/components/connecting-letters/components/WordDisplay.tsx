// /components/WordDisplay.tsx

import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import Font from '../../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';
import { IWordStage } from '../../../realm/interfaces/general/embeddes/part-stage.interface';

const { width } = Dimensions.get('window');

// --- تعریف وضعیت‌های بازخورد ---
const FEEDBACK_STATE = {
  NORMAL: 0,
  SUCCESS: 1,
  ERROR: 2,
  DUPLICATE: 3,
};

// --- پالت رنگی برای بازخورد ---
const COLORS = {
  NORMAL: "#fcb900",
  SUCCESS: "#2ecc71",
  ERROR: "#e74c3c",
  DUPLICATE: "#3498db",
  GRADIENT_SUCCESS: ["#27ae60", "#2ecc71"],
  GRADIENT_ERROR: ["#c0392b", "#e74c3c"],
  GRADIENT_DUPLICATE: ["#2980b9", "#3498db"],
};

// =================================================================
// کامپوننت مربع‌های جای خالی حروف
// =================================================================
interface PlaceholderSquareProps {
  letter: string;
  isRevealed: boolean;
  style: any;
}

const PlaceholderSquare = memo(({ letter, isRevealed, style }: PlaceholderSquareProps) => {
  const revealProgress = useSharedValue(isRevealed ? 1 : 0);

  useEffect(() => {
    revealProgress.value = withTiming(isRevealed ? 1 : 0, { duration: 500 });
  }, [isRevealed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        revealProgress.value,
        [0, 1],
        ['#00000000', style.backgroundColor] // از شفاف به رنگی
      ),
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
  }));

  return (
    <Animated.View style={[styles.placeholderBase, style, animatedStyle]}>
      <Animated.Text style={[styles.placeholderText, textAnimatedStyle]}>{letter}</Animated.Text>
    </Animated.View>
  );
});

// =================================================================
// کامپوننت ردیف کلمات جای خالی
// =================================================================
interface WordPlaceholderRowProps {
  word: string;
  foundLetters: string[];
  styleOptions: any;
}
const WordPlaceholderRow = memo(({ word, foundLetters, styleOptions }: WordPlaceholderRowProps) => {
  return (
    <View style={styles.placeholderRow}>
      {word.split('').map((char, index) => (
        <PlaceholderSquare
          key={`${word}-${index}`}
          letter={char}
          isRevealed={foundLetters.includes(char)}
          style={styleOptions}
        />
      ))}
    </View>
  );
});


// =================================================================
// کامپوننت اصلی WordDisplay
// =================================================================
const WordDisplay = () => {
  const { connectedLetters, data, submittedInfo, setSubmittedInfo } = useLetters();

  const feedbackProgress = useSharedValue(FEEDBACK_STATE.NORMAL);
  const selectedCardsOpacity = useSharedValue(1);
  const [gradientColors, setGradientColors] = useState<string[]>(['#86442d', '#4d2719']);

  useEffect(() => {
    if (!submittedInfo) return;

    const { word } = submittedInfo;
    let state = FEEDBACK_STATE.ERROR;

    if (word === data.word) {
      state = data.word_builded ? FEEDBACK_STATE.DUPLICATE : FEEDBACK_STATE.SUCCESS;
    } else if (data.additional_words.includes(word)) {
      const isAlreadyFound = data.additional_words_builded?.includes(word);
      state = isAlreadyFound ? FEEDBACK_STATE.DUPLICATE : FEEDBACK_STATE.SUCCESS;
    }
    
    // برای دیباگ: وضعیت تشخیص داده شده را در کنسول ببینید
    console.log(`کلمه: "${word}", وضعیت: ${Object.keys(FEEDBACK_STATE).find(key => FEEDBACK_STATE[key] === state)}`);

    // آپدیت رنگ‌ها با useState (بدون هشدار)
    runOnJS(setGradientColors)(
        state === FEEDBACK_STATE.SUCCESS ? COLORS.GRADIENT_SUCCESS :
        state === FEEDBACK_STATE.ERROR ? COLORS.GRADIENT_ERROR :
        state === FEEDBACK_STATE.DUPLICATE ? COLORS.GRADIENT_DUPLICATE :
        ['#86442d', '#4d2719']
    );
    
    feedbackProgress.value = withTiming(state, { duration: 300 });
    
    const feedbackTimer = setTimeout(() => {
      selectedCardsOpacity.value = withTiming(0, { duration: 400 });

      const cleanupTimer = setTimeout(() => {
        runOnJS(setSubmittedInfo)(null);
        feedbackProgress.value = withTiming(FEEDBACK_STATE.NORMAL);
      }, 400);

      return () => clearTimeout(cleanupTimer);
    }, 1500);

    return () => clearTimeout(feedbackTimer);

  }, [submittedInfo]);

  useEffect(() => {
    // اگر کاربر شروع به تایپ کلمه جدید کرد، کارت‌ها را فورا نمایش بده
    if (connectedLetters.length > 0) {
      selectedCardsOpacity.value = withTiming(1, { duration: 100 });
    }
  }, [connectedLetters]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      feedbackProgress.value,
      [FEEDBACK_STATE.NORMAL, FEEDBACK_STATE.SUCCESS, FEEDBACK_STATE.ERROR, FEEDBACK_STATE.DUPLICATE],
      [COLORS.NORMAL, COLORS.SUCCESS, COLORS.ERROR, COLORS.DUPLICATE]
    ),
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: selectedCardsOpacity.value,
  }));


  const lettersToRender = submittedInfo?.letters || connectedLetters;
  
  // --- محاسبات اندازه کارت‌ها (بدون تغییر) ---
  const { CARD_WIDTH, CARD_FONT_SIZE } = useMemo(() => {
    const letterCount = data?.letters?.length || 0;
    if (letterCount === 0) return { CARD_WIDTH: 30, CARD_FONT_SIZE: 18 };
    
    const calculation = (width - (30 + (letterCount - 1) * 10)) / letterCount;
    const finalWidth = calculation < 30 ? calculation : 30;
    return {
      CARD_WIDTH: finalWidth,
      CARD_FONT_SIZE: finalWidth / 1.6,
    };
  }, [data?.letters?.length]);

  return (
    <View style={styles.container}>
      {/* بخش نمایش مربع‌های جای خالی */}
      <View style={styles.placeholdersContainer}>
        {/* ردیف کلمات اضافی */}
        {data.additional_words.map(word => (
            <WordPlaceholderRow
                key={word}
                word={word}
                foundLetters={data.additional_words_builded || []}
                styleOptions={styles.additionalPlaceholder}
            />
        ))}
        {/* ردیف کلمه اصلی */}
        <WordPlaceholderRow
            word={data.word}
            foundLetters={data.word_builded ? data.word.split('') : []}
            styleOptions={styles.mainPlaceholder}
        />
      </View>
      
      {/* بخش نمایش کارت‌های انتخاب شده و کلمه */}
      <Animated.View style={[styles.displayArea, animatedContainerStyle, {minHeight: 85}]}>
        {lettersToRender.length > 0 && (
          <>
            <View style={styles.cardsRow}>
              {lettersToRender.map((item, index) => (
                <Animated.View key={index} style={[styles.card, animatedCardStyle, { width: CARD_WIDTH, height: CARD_WIDTH }]}>
                  <Text style={[styles.cardText, { fontSize: CARD_FONT_SIZE }]}>{item}</Text>
                </Animated.View>
              ))}
            </View>
            <LinearGradient colors={gradientColors} style={styles.wordGradient}>
              <Text style={styles.wordText}>{lettersToRender.join('')}</Text>
            </LinearGradient>
          </>
        )}
      </Animated.View>
    </View>
  );
};


// ... استایل‌ها ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  // استایل‌های بخش جای خالی‌ها
  placeholdersContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column-reverse', // از پایین به بالا
    alignItems: 'center',
    paddingBottom: 20,
    gap: 8,
  },
  placeholderRow: {
    flexDirection: 'row-reverse',
    gap: 5,
  },
  placeholderBase: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  mainPlaceholder: {
    width: 35,
    height: 35,
    borderWidth: 2,
    borderColor: '#fcb900', // طلایی
    backgroundColor: '#ffd54f', // رنگ پر شده طلایی
  },
  additionalPlaceholder: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: '#bdc3c7', // نقره‌ای
    backgroundColor: '#ecf0f1', // رنگ پر شده نقره‌ای
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: Font.bakh_black,
    color: '#34495e',
  },
  displayArea: {
    width: width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingBottom: 5,
    height: 85,
  },
  cardsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 10,
    minHeight: 40, 
  },
  wordGradient: {
    borderRadius: 5,
  },
  wordContainer: {
    paddingHorizontal: 15,
  },
  wordText: {
    fontFamily: Font.bakh_black,
    fontSize: 18,
    color: "#FFF",
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardText: {
    fontFamily: Font.bakh_extra_black,
    color: '#FFF',
  },
});

export default memo(WordDisplay);