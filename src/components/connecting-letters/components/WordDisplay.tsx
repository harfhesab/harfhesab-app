import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import Font from '../../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';
import SelectedCardWithAnumation from './word-display/SelectedCardWithAnumation';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import WordPlaceholderRow from './word-display/WordPlaceholderRow';
import SelectionProgressCircle from './word-display/SelectionProgressCircle';
import TopHeader from './word-display/TopHeader';
import { connectingLetterDuplicateSound, connectingLetterErrorSound, connectingLetterSucccessSound } from '../../../utils/sound/SoundFunctions';

const { width } = Dimensions.get('screen');

const FEEDBACK_STATE = {
  NORMAL: 0,
  SUCCESS: 1,
  ERROR: 2,
  DUPLICATE: 3,
};

const COLORS = {
  NORMAL: "#86442d",
  SUCCESS: "#40bf42",
  ERROR: "#CC0000",
  DUPLICATE: "#0099CC",
  GRADIENT_SUCCESS: ['#40bf42', '#236a24'],
  GRADIENT_ERROR: ['#CC0000', '#ff4444'],
  GRADIENT_DUPLICATE: ['#0099CC', '#33b5e5'],
  GRADIENT_NORMAL: ['#86442d', '#4d2719'],
};

const chunkArray = (arr: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const WordDisplay = () => {
  const colors = useAppTheme();
  const { 
    connectedLetters, 
    data, 
    submittedInfo, 
    setSubmittedInfo, 
    lettersHelpUsed, 
    foundWords, 
    handleMainWordFound, 
    handleNewAdditionalWordFound, 
    handleNewHiddenWordFound 
  } = useLetters();

  const feedbackProgress = useSharedValue(FEEDBACK_STATE.NORMAL);
  const selectedCardsOpacity = useSharedValue(1);
  const [gradientColors, setGradientColors] = useState<string[]>(COLORS.GRADIENT_NORMAL);
  const chunks = useMemo(() => chunkArray(data.additional_words, 6), [data.additional_words]);

  // این دو تایمر تودرتو (feedback -> cleanup) هستند. در نسخه‌ی قبلی، تابع cleanup تایمر
  // داخلی به‌صورت `return () => clearTimeout(cleanupTimer)` از داخل خودِ callback تایمر
  // بیرونی برگردانده می‌شد؛ اما آن return هیچ اثری ندارد چون داخل setTimeout است، نه
  // داخل خودِ افکت — ری‌اکت هیچ‌وقت آن را نمی‌بیند و صدا نمی‌زند. نتیجه: اگر submittedInfo
  // یک بار دیگر (یا آنماونت) بین ۱۵۰۰ تا ۱۹۰۰ میلی‌ثانیه اتفاق بیفتد، تایمر cleanupTimer
  // قبلی هنوز زنده می‌ماند و بعداً setSubmittedInfo(null) را روی چرخه‌ی جدید صدا می‌زند —
  // یک race condition واقعی. اینجا هر دو تایمر را در ref نگه می‌داریم و همیشه هر دو را
  // پاک می‌کنیم.
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!submittedInfo) return;

    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);

    const { word } = submittedInfo;
    let state = FEEDBACK_STATE.ERROR;
    let isCorrect = false;

    // ۱. تعیین نوع ورودی و خروجی تابع نرمال‌سازی
    const normalize = (text: string | undefined): string => {
        return text ? text.replace(/آ/g, "ا") : "";
    };

    // ۲. نرمال کردن ورودی کاربر
    const normalizedInput: string = normalize(word);

    // ۳. پیدا کردن کلمات مطابق در آرایه‌ها (تایپ این‌ها string | undefined خواهد بود)
    const matchedAdditional = data.additional_words.find((w: string) => normalize(w) === normalizedInput);
    const matchedHidden = data.hidden_words.find((w: string) => normalize(w) === normalizedInput);

    // ۴. منطق شرطی
    if (normalizedInput === normalize(data.word)) {
        if (foundWords.main) {
            state = FEEDBACK_STATE.DUPLICATE;
            connectingLetterDuplicateSound();
        } else {
            handleMainWordFound();
            state = FEEDBACK_STATE.SUCCESS;
            isCorrect = true;
            connectingLetterSucccessSound();
        }
    } else if (matchedAdditional !== undefined) {
        // در اینجا TypeScript می‌داند matchedAdditional قطعا string است
        if (foundWords.additional.has(word) || foundWords.additional.has(matchedAdditional)) {
            state = FEEDBACK_STATE.DUPLICATE;
            connectingLetterDuplicateSound();
        } else {
            handleNewAdditionalWordFound(matchedAdditional);
            state = FEEDBACK_STATE.SUCCESS;
            isCorrect = true;
            connectingLetterSucccessSound();
        }
    } else if (matchedHidden !== undefined) {
        // در اینجا TypeScript می‌داند matchedHidden قطعا string است
        if (foundWords.hidden.has(word) || foundWords.hidden.has(matchedHidden)) {
            state = FEEDBACK_STATE.DUPLICATE;
            connectingLetterDuplicateSound();
        } else {
            handleNewHiddenWordFound(matchedHidden);
            state = FEEDBACK_STATE.SUCCESS;
            isCorrect = true;
            connectingLetterSucccessSound();
        }
    } else {
        connectingLetterErrorSound();
    }

    let newGradientColors = COLORS.GRADIENT_NORMAL;
    if (state === FEEDBACK_STATE.SUCCESS) newGradientColors = COLORS.GRADIENT_SUCCESS;
    else if (state === FEEDBACK_STATE.ERROR) newGradientColors = COLORS.GRADIENT_ERROR;
    else if (state === FEEDBACK_STATE.DUPLICATE) newGradientColors = COLORS.GRADIENT_DUPLICATE;
    
    setGradientColors(newGradientColors);
    feedbackProgress.value = withTiming(state, { duration: 300 });
    
    feedbackTimerRef.current = setTimeout(() => {
      selectedCardsOpacity.value = withTiming(0, { duration: 400 });
      cleanupTimerRef.current = setTimeout(() => {
        setSubmittedInfo(null);
        setGradientColors(COLORS.GRADIENT_NORMAL);
        feedbackProgress.value = withTiming(FEEDBACK_STATE.NORMAL);
      }, 400);
    }, 1500);

    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, [submittedInfo]);

  useEffect(() => {
    if (connectedLetters.length > 0) {
      selectedCardsOpacity.value = withTiming(1, { duration: 100 });
    }
  }, [connectedLetters.length]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: selectedCardsOpacity.value,
  }));

  const lettersToRender = submittedInfo?.letters || connectedLetters;
  
  const { CARD_WIDTH, CARD_FONT_SIZE, WORD_SQUARE_WIDTH, WORD_SQUARE_FONT_SIZE } = useMemo(() => {
    const letterCount = data?.letters?.length || 0;
    if (letterCount === 0) return { CARD_WIDTH: 35, CARD_FONT_SIZE: 20, WORD_SQUARE_WIDTH: 40, WORD_SQUARE_FONT_SIZE: 25 };
    
    const calculation = (width - (30 + (letterCount - 1) * 5)) / letterCount;
    const finalCardWidth = calculation < 20 ? calculation : 20;
    const finalWordSquareWidth = calculation < 45 ? calculation : 45;
    return {
      CARD_WIDTH: finalCardWidth,
      CARD_FONT_SIZE: finalCardWidth / 1.6,
      WORD_SQUARE_WIDTH: finalWordSquareWidth,
      WORD_SQUARE_FONT_SIZE: finalWordSquareWidth / 1.6,
    };
  }, [data?.letters?.length]);
  
  const numberHelped = useMemo(() => {
    const { additional_words, word } = data;
    const allWords = [...additional_words, word];
    const results = new Array(allWords.length).fill(0);

    let startIndexes: number[] = [];
    let currentIndex = 0;
    for (const w of allWords) {
      startIndexes.push(currentIndex);
      currentIndex += w.length;
    }

    for (const idx of lettersHelpUsed) {
      for (let i = 0; i < allWords.length; i++) {
        const start = startIndexes[i];
        const end = start + allWords[i].length - 1;
        if (idx >= start && idx <= end) {
          results[i]++;
          break;
        }
      }
    }
    return results;
  }, [data.additional_words, data.word, lettersHelpUsed]);

  return (
    <View style={styles.container}>
      <View style={{flex:1, flexDirection: 'column', alignItems:'center', justifyContent:'space-between'}}>
        <TopHeader />
        <View style={styles.placeholdersContainer}>
          <View style={styles.rowContainer}>
            {chunks.map((chunk, colIndex) => (
              <View key={colIndex} style={styles.columnContainer}>
                {chunk.map((word: any, index: number) => (
                  <WordPlaceholderRow
                    key={index.toString()}
                    word={word}
                    isWordFound={foundWords.additional.has(word)}
                    size={WORD_SQUARE_WIDTH - 17}
                    mainWord={false}
                    // اینجا به جای کل آرایه فقط عدد مربوطه را پاس می‌دهیم که عالی است
                    numberHelped={numberHelped[colIndex * 6 + index]}
                  />
                ))}
              </View>
            ))}
          </View>
          
            {/* کلمه اصلی */}
            <View style={{width:'100%', marginTop: 20, alignSelf:'center', alignItems:'center' }}>
              <WordPlaceholderRow
                word={data.word}
                isWordFound={foundWords.main}
                size={WORD_SQUARE_WIDTH}
                mainWord={true}
                numberHelped={numberHelped[data.additional_words.length]}
              />
            </View>
        </View>
      </View>
      <Animated.View style={[styles.displayArea, animatedContainerStyle]}>
        {lettersToRender.length > 0 && (
          <>
            <View style={styles.cardsRow}>
              {lettersToRender.map((item, index) => (
                <SelectedCardWithAnumation
                    key={index}
                    item={item}
                    index={index}
                    CARD_WIDTH={CARD_WIDTH}
                    CARD_FONT_SIZE={CARD_FONT_SIZE}
                    feedbackProgress={feedbackProgress}
                />
              ))}
            </View>
            <LinearGradient colors={gradientColors} style={styles.wordGradient}>
              <Text style={styles.wordText}>{lettersToRender.join('')}</Text>
            </LinearGradient>
          </>
        )}
      </Animated.View>
      <View style={{width:"100%", alignItems:'center'}}>
        <SelectionProgressCircle/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholdersContainer: {
    width: "100%",
    alignItems: "center",
  },
  rowContainer: {
    width: '100%',
    alignItems:'flex-end',
    flexDirection: "row",
    gap: 20,
  },
  columnContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  displayArea: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: 5,
    marginTop:5
  },
  cardsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 5,
  },
  wordGradient: {
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 3
  },
  wordText: {
    fontFamily: Font.bakh_black,
    fontSize: 18,
    color: "#FFF",
  },
});

export default memo(WordDisplay);