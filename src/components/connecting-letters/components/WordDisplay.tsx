// /components/WordDisplay.tsx

import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
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
  NORMAL: "#86442d",
  SUCCESS: "#0ea960",
  ERROR: "#CC0000",
  DUPLICATE: "#0099CC",
  GRADIENT_SUCCESS: ["#0ea960", "#018044"],
  GRADIENT_ERROR: ['#CC0000', '#ff4444'],
  GRADIENT_DUPLICATE: ['#0099CC', '#33b5e5'],
  GRADIENT_NORMAL: ['#86442d', '#4d2719'],
};
// =================================================================
// کامپوننت اصلی WordDisplay
// =================================================================
const WordDisplay = () => {
  const colors = useAppTheme();
  const { connectedLetters, data, submittedInfo, setSubmittedInfo, lettersHelpUsed, foundWords, handleMainWordFound, handleNewAdditionalWordFound, handleNewHiddenWordFound } = useLetters();

  const feedbackProgress = useSharedValue(FEEDBACK_STATE.NORMAL);
  const selectedCardsOpacity = useSharedValue(1);
  const [gradientColors, setGradientColors] = useState<string[]>(COLORS.GRADIENT_NORMAL);


  useEffect(() => {
    if (!submittedInfo) return;

    const { word } = submittedInfo;
    let state = FEEDBACK_STATE.ERROR;

    if (word === data.word) {
      if(foundWords.main){
        state = FEEDBACK_STATE.DUPLICATE
        connectingLetterDuplicateSound()
      } else {
        handleMainWordFound()
        state = FEEDBACK_STATE.SUCCESS
        connectingLetterSucccessSound()
      }
    } else if (data.additional_words.includes(word)) {
      if(foundWords.additional.has(word)){
        state = FEEDBACK_STATE.DUPLICATE
        connectingLetterDuplicateSound()
      } else {
        handleNewAdditionalWordFound(word)
        state = FEEDBACK_STATE.SUCCESS
        connectingLetterSucccessSound()
      }
    } else if (data.hidden_words.includes(word)) {
      if(foundWords.hidden.has(word)){
        state = FEEDBACK_STATE.DUPLICATE
        connectingLetterDuplicateSound()
      } else {
        handleNewHiddenWordFound(word)
        state = FEEDBACK_STATE.SUCCESS
        connectingLetterSucccessSound()
      }
    } else {
      connectingLetterErrorSound()
    }
    let newGradientColors = COLORS.GRADIENT_NORMAL;
    if (state === FEEDBACK_STATE.SUCCESS) newGradientColors = COLORS.GRADIENT_SUCCESS;
    else if (state === FEEDBACK_STATE.ERROR) newGradientColors = COLORS.GRADIENT_ERROR;
    else if (state === FEEDBACK_STATE.DUPLICATE) newGradientColors = COLORS.GRADIENT_DUPLICATE;
    
    setGradientColors(newGradientColors); // <-- فراخوانی مستقیم
    
    // آپدیت shared value برای انیمیشن‌ها در UI Thread
    feedbackProgress.value = withTiming(state, { duration: 300 });
    
    const feedbackTimer = setTimeout(() => {
      selectedCardsOpacity.value = withTiming(0, { duration: 400 });
      const cleanupTimer = setTimeout(() => {
        // این توابع React State را آپدیت می‌کنند، پس باید مستقیم فراخوانی شوند
        setSubmittedInfo(null);
        setGradientColors(COLORS.GRADIENT_NORMAL);
        // این یک shared value است و باید مستقیم مقداردهی شود
        feedbackProgress.value = withTiming(FEEDBACK_STATE.NORMAL);
      }, 400);
      return () => clearTimeout(cleanupTimer);
    }, 1500);

    return () => clearTimeout(feedbackTimer);
  }, [submittedInfo]);

  useEffect(() => {
    if (connectedLetters.length > 0) {
      selectedCardsOpacity.value = withTiming(1, { duration: 100 });
    }
  }, [connectedLetters]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: selectedCardsOpacity.value,
  }));

  const lettersToRender = submittedInfo?.letters || connectedLetters;
  
  // --- محاسبات اندازه کارت‌ها (بدون تغییر) ---
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
  
  function handleExistNumberHelpedWord() {
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
      // پیدا کردن اینکه idx متعلق به کدوم کلمه است
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
  }

  // استفاده در JSX
  const numberHelped = handleExistNumberHelpedWord();
  return (
    <View style={styles.container}>
      <View style={{flex:1, flexDirection: 'column', alignItems:'center', justifyContent:'space-between'}}>
        <TopHeader />
        <View style={styles.placeholdersContainer}>
            {data.additional_words.map((word:any, index:number) => (
                <WordPlaceholderRow
                    key={index.toString()}
                    word={word}
                    isWordFound={foundWords.additional.has(word)}
                    size={WORD_SQUARE_WIDTH-20}
                    mainWord={false}
                    numberHelped={numberHelped[index]}
                />
            ))}
            <View style={{marginTop:5}}>
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
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
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
});

export default memo(WordDisplay);