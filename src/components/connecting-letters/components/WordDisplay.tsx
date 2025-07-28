import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring, withDelay } from 'react-native-reanimated';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import { WORD_DISPLAY_DURATION } from '../constants/constants';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  data: {
    word: string;
    letters: string[];
    additional_words: string[];
    hidden_words: string[];
  };
}
const {width} = Dimensions.get("window")
const WordDisplay = ({ data }: Props) => {
  const { word, draggedCardId, setWord } = useDragDrop();
  const colors = useAppTheme();
  const [displayedWord, setDisplayedWord] = useState<string>('');
  const [isValidWord, setIsValidWord] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // پاک کردن تایمر در صورت وجود
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // به‌روزرسانی فوری متن هنگام درگ
  useEffect(() => {
    if (draggedCardId) {
      clearTimer();
      setDisplayedWord(word.join(''));
      setIsValidWord(null); // پاک کردن وضعیت صحت هنگام درگ
    }
  }, [word, draggedCardId]);

  // بررسی صحت کلمه و نمایش ۳ ثانیه‌ای بعد از دراپ
  useEffect(() => {
    if (!draggedCardId && word.length > 0) {
      const currentWord = word.join('');
      const isValid =
        currentWord === data.word ||
        data.additional_words.includes(currentWord) ||
        data.hidden_words.includes(currentWord);

      setDisplayedWord(currentWord);
      setIsValidWord(isValid);

      // تنظیم تایمر برای پاک کردن متن و word بعد از ۳ ثانیه
      clearTimer();
      timerRef.current = setTimeout(() => {
        setDisplayedWord('');
        setIsValidWord(null);
        setWord([]); // پاک کردن word در context
      }, WORD_DISPLAY_DURATION);
    } else if (!draggedCardId && word.length === 0) {
      clearTimer();
      setDisplayedWord('');
      setIsValidWord(null);
    }

    // پاک کردن تایمر هنگام اتمام useEffect
    return clearTimer;
  }, [draggedCardId, word, data, setWord]);

  // انیمیشن پتک‌مانند برای هر کارت
  const CardWithAnimation = ({ char, index, isValidWord, colors }: { char: string; index: number; isValidWord: boolean | null; colors: any }) => {
    const isAnimatedRef = useRef(false);
    const scale = useSharedValue(0);

    // اجرای انیمیشن فقط یک‌بار هنگام اضافه شدن کارت
    useEffect(() => {
      if (!isAnimatedRef.current) {
        // انیمیشن موجی: تأخیر بر اساس index
        const delay = index * 100; // 100 میلی‌ثانیه تأخیر برای هر کارت
        scale.value = withDelay(
          delay,
          withSequence(
            withTiming(1.2, { duration: 150 }), // بزرگ شدن
            withTiming(0.8, { duration: 150 }), // کوچک شدن
            withSpring(1, { stiffness: 200, damping: 16, mass: 1 }) // بازگشت فنری
          )
        );
        isAnimatedRef.current = true;
      }
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // رنگ کارت به صورت استاتیک
    const cardStyle = {
      backgroundColor: isValidWord === null ? '#ffd54f' : isValidWord ? colors.primary.a1 : colors.alert.a1,
    };

    return (
      <Animated.View
        key={`${char}_${index}_${displayedWord}`}
        style={[styles.cardContainer, animatedStyle]}
      >
        <View style={[styles.card, cardStyle]}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: Font.black,
              color: isValidWord === null ? '#000' : '#FFF',
            }}
          >
            {char}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // استفاده از useMemo برای رندر کارت‌ها با وابستگی به isValidWord و colors
  const renderedCards = useMemo(() => {
    return displayedWord.split('').map((char, index) => (
      <CardWithAnimation
        key={`${char}_${index}_${displayedWord}`}
        char={char}
        index={index}
        isValidWord={isValidWord}
        colors={colors}
      />
    ));
  }, [displayedWord, isValidWord, colors]);

  return (
    <View style={styles.wordContainer}>
      <View style={{height:100, width:width, alignItems:'center',justifyContent:'flex-start', paddingBottom:5}}>
        <View
          style={{
            flexDirection: 'row-reverse',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 15,
            gap: 10,
            height: 40,
          }}
        >
          {renderedCards}
        </View>
        {
          displayedWord&&
          <LinearGradient colors={isValidWord === null?['#813123', '#491a11']:isValidWord?['#0ea960', '#099956', '#018044']:['#CC0000', '#ff4444']} style={{borderRadius:5}}>
            <View style={{ height: 50, paddingHorizontal:20 }}>
              <Text
                style={[styles.wordText,{color:"#FFF"}]}>
                {displayedWord}
              </Text>
            </View>
          </LinearGradient>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 24,
    fontFamily: Font.black,
    textAlign: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default memo(WordDisplay);