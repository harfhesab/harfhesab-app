import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
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

const { width } = Dimensions.get('window');

const WordDisplay = ({ data }: Props) => {
  const { word, draggedCardId, setWord } = useDragDrop();
  const colors = useAppTheme();
  const [displayedWord, setDisplayedWord] = useState<string>('');
  const [isValidWord, setIsValidWord] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // برای ردیابی کارت‌ها و موقعیت آن‌ها
  const cardPositions = useRef<
    Array<{ char: string; translateX: Animated.SharedValue<number>; key: string }>
  >([]);

  // پاک کردن تایمر
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // به‌روزرسانی متن هنگام درگ
  useEffect(() => {
    if (draggedCardId) {
      clearTimer();
      setDisplayedWord(word.join(''));
      setIsValidWord(null);
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

      clearTimer();
      timerRef.current = setTimeout(() => {
        setDisplayedWord('');
        setIsValidWord(null);
        setWord([]);
        cardPositions.current = []; // ریست کردن کارت‌ها
      }, WORD_DISPLAY_DURATION);
    } else if (!draggedCardId && word.length === 0) {
      clearTimer();
      setDisplayedWord('');
      setIsValidWord(null);
      cardPositions.current = [];
    }

    return clearTimer;
  }, [draggedCardId, word, data, setWord]);

  // محاسبه عرض کارت‌ها
  const CARD_WIDTH_CALCULATION = (width - (30 + (data.letters.length - 1) * 10)) / data.letters.length;
  const CARD_WIDTH = CARD_WIDTH_CALCULATION < 30 ? CARD_WIDTH_CALCULATION : 30;
  const CARD_FONT_SIZE = CARD_WIDTH / 2.1;

  // کامپوننت کارت با انیمیشن
  const CardWithAnimation = ({
    char,
    index,
    isValidWord,
    colors,
    isNew,
    uniqueKey,
  }: {
    char: string;
    index: number;
    isValidWord: boolean | null;
    colors: any;
    isNew: any;
    uniqueKey: string;
  }) => {
    const isAnimatedRef = useRef(!isNew); // فقط برای کارت جدید انیمیشن اجرا بشه
    const scale = useSharedValue(isNew ? 0 : 1); // کارت‌های قدیمی از ابتدا مقیاس 1
    const translateX = useSharedValue(0);

    // ذخیره translateX و کلید یکتا
    useEffect(() => {
      cardPositions.current[index] = { char, translateX, key: uniqueKey };
    }, [char, index, uniqueKey]);

    // انیمیشن پتک‌مانند فقط برای کارت جدید
    useEffect(() => {
      if (isNew && !isAnimatedRef.current) {
        scale.value = withSequence(
          withTiming(1.3, { duration: 200 }),
          withTiming(0.7, { duration: 200 }),
          withSpring(1, { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false })
        );
        isAnimatedRef.current = true;
      }
    }, [isNew]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    }));

    const cardStyle = {
      backgroundColor: isValidWord === null ? '#ffd54f' : isValidWord ? colors.primary.a1 : colors.alert.a1,
    };

    return (
      <Animated.View key={uniqueKey} style={[styles.cardContainer, animatedStyle]}>
        <View style={[styles.card, cardStyle, { width: CARD_WIDTH, height: CARD_WIDTH }]}>
          <Text
            style={{
              fontSize: CARD_FONT_SIZE,
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

  // جابه‌جایی کارت‌ها به وسط هنگام اضافه شدن کارت جدید
  useEffect(() => {
    if (word.length > 0 && draggedCardId) {
      const wordWidth = word.length * CARD_WIDTH + (word.length - 1) * 10;
      const startX = -wordWidth / 2; // شروع از وسط صفحه

      cardPositions.current.forEach((card, idx) => {
        if (idx < word.length) {
          const newX = startX + idx * (CARD_WIDTH + 10);
          card.translateX.value = withSpring(newX, {
            stiffness: 200,
            damping: 16,
            mass: 1.4,
          });
        }
      });
    }
  }, [word, draggedCardId, CARD_WIDTH]);

  // رندر کارت‌ها با کلید یکتا
  const renderedCards = useMemo(() => {
    return displayedWord.split('').map((char, index) => {
      const uniqueKey = `${char}_${index}_${Date.now()}`; // کلید یکتا برای هر کارت
      const isNew = index === displayedWord.length - 1 && draggedCardId; // فقط آخرین کارت جدید است
      return (
        <CardWithAnimation
          key={uniqueKey}
          char={char}
          index={index}
          isValidWord={isValidWord}
          colors={colors}
          isNew={isNew}
          uniqueKey={uniqueKey}
        />
      );
    });
  }, [displayedWord, isValidWord, colors, draggedCardId]);

  return (
    <View style={styles.wordContainer}>
      <View
        style={{
          width: width,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingBottom: 5,
        }}
      >
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
        {displayedWord && (
          <LinearGradient
            colors={
              isValidWord === null
                ? ['#813123', '#491a11']
                : isValidWord
                ? ['#0ea960', '#099956', '#018044']
                : ['#CC0000', '#ff4444']
            }
            style={{ borderRadius: 5 }}
          >
            <View style={{ paddingHorizontal: 20, paddingVertical: 1 }}>
              <Text style={[styles.wordText, { color: '#FFF' }]}>{displayedWord}</Text>
            </View>
          </LinearGradient>
        )}
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
    fontSize: 20,
    fontFamily: Font.bold,
    textAlign: 'center',
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
});

export default memo(WordDisplay);