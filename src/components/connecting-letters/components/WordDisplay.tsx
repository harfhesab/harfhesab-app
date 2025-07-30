import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
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
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [wordColorStatus, setWordColorStatus] = useState<{
    cardColor: string;
    gradientColors: string[];
  }>({
    cardColor: '#ffd54f',
    gradientColors: ['#813123', '#491a11'],
  });
  const [renderTrigger, setRenderTrigger] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardPositions = useRef<
    Array<{ char: string; translateX: Animated.SharedValue<number>; key: string }>
  >([]);
  const wordSquareStates = useRef<
    Array<{
      word: string;
      squares: Array<{
        char: Animated.SharedValue<string>;
        scale: Animated.SharedValue<number>;
        backgroundColor: Animated.SharedValue<string>;
      }>;
    }>
  >(
    [
      ...data.additional_words.map((w) => ({
        word: w,
        squares: w.split('').map(() => ({
          char: useSharedValue(''),
          scale: useSharedValue(1),
          backgroundColor: useSharedValue('transparent'),
        })),
      })),
      {
        word: data.word,
        squares: data.word.split('').map(() => ({
          char: useSharedValue(''),
          scale: useSharedValue(1),
          backgroundColor: useSharedValue('transparent'),
        })),
      },
    ]
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (draggedCardId) {
      clearTimer();
      const currentWord = word.join('');
      setDisplayedWord(currentWord);
      setIsValidWord(null);
      setWordColorStatus({
        cardColor: '#ffd54f',
        gradientColors: ['#813123', '#491a11'],
      });
    }
  }, [word, draggedCardId]);

  useEffect(() => {
    if (!draggedCardId && word.length > 0) {
      const currentWord = word.join('');
      const isValid =
        currentWord === data.word ||
        data.additional_words.includes(currentWord) ||
        data.hidden_words.includes(currentWord);

      setDisplayedWord(currentWord);
      setIsValidWord(isValid);

      if (isValid) {
        const isNewWord = !foundWords.includes(currentWord);
        setWordColorStatus({
          cardColor: isNewWord ? colors.primary.a1 : '#0099CC',
          gradientColors: isNewWord
            ? ['#0ea960', '#099956', '#018044']
            : ['#0099CC', '#33b5e5'],
        });
      } else {
        setWordColorStatus({
          cardColor: colors.alert.a1,
          gradientColors: ['#CC0000', '#ff4444'],
        });
      }

      if (isValid && !foundWords.includes(currentWord)) {
        const targetWordState = wordSquareStates.current.find((ws) => ws.word === currentWord);
        if (targetWordState) {
          targetWordState.squares.forEach((square, index) => {
            const newChar = currentWord[index] || '';
            // تنظیم فوری حرف
            square.char.value = newChar;
            // انیمیشن‌های مربع
            square.scale.value = withDelay(
              index * 100,
              withSequence(
                withTiming(1.25, { duration: currentWord.length*200, easing: Easing.out(Easing.quad) }),
                withSpring(1, { stiffness: 250, damping: 16, mass: 1.4, overshootClamping: false })
              )
            );
            square.backgroundColor.value = withDelay(
              index * 100,
              withTiming(colors.primary.a1, { duration: currentWord.length*150, easing: Easing.out(Easing.quad) })
            );
          });
          setRenderTrigger((prev) => prev + 1);
        }
      }

      clearTimer();
      timerRef.current = setTimeout(() => {
        if (isValid && !foundWords.includes(currentWord)) {
          setFoundWords((prev) => [...prev, currentWord]);
        }
        setDisplayedWord('');
        setIsValidWord(null);
        setWordColorStatus({
          cardColor: '#ffd54f',
          gradientColors: ['#813123', '#491a11'],
        });
        setWord([]);
        cardPositions.current = [];
        wordSquareStates.current.forEach((ws) => {
          if (!foundWords.includes(ws.word) && ws.word !== currentWord) {
            ws.squares.forEach((square) => {
              square.char.value = '';
              square.backgroundColor.value = withTiming('transparent', { duration: 200 });
              square.scale.value = withTiming(1, { duration: 200 });
            });
          }
        });
        setRenderTrigger((prev) => prev + 1);
      }, WORD_DISPLAY_DURATION);
    } else if (!draggedCardId && word.length === 0) {
      clearTimer();
      setDisplayedWord('');
      setIsValidWord(null);
      setWordColorStatus({
        cardColor: '#ffd54f',
        gradientColors: ['#813123', '#491a11'],
      });
      cardPositions.current = [];
      wordSquareStates.current.forEach((ws) => {
        if (!foundWords.includes(ws.word)) {
          ws.squares.forEach((square) => {
            square.char.value = '';
            square.backgroundColor.value = withTiming('transparent', { duration: 200 });
            square.scale.value = withTiming(1, { duration: 200 });
          });
        }
      });
      setRenderTrigger((prev) => prev + 1);
    }

    return clearTimer;
  }, [draggedCardId, word, data, setWord, colors, foundWords]);

  const CARD_WIDTH_CALCULATION = (width - (30 + (data.letters.length - 1) * 10)) / data.letters.length;
  const CARD_WIDTH = CARD_WIDTH_CALCULATION < 30 ? CARD_WIDTH_CALCULATION : 30;
  const CARD_FONT_SIZE = CARD_WIDTH / 2.1;

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
    isNew: boolean;
    uniqueKey: string;
  }) => {
    const isAnimatedRef = useRef(!isNew);
    const scale = useSharedValue(isNew ? 0 : 1);
    const translateX = useSharedValue(0);

    useEffect(() => {
      cardPositions.current[index] = { char, translateX, key: uniqueKey };
    }, [char, index, uniqueKey]);

    useEffect(() => {
      if (isNew && !isAnimatedRef.current) {
        scale.value = withSequence(
          withTiming(1.3, { duration: 200, easing: Easing.out(Easing.quad) }),
          withTiming(0.7, { duration: 200, easing: Easing.out(Easing.quad) }),
          withSpring(1, { stiffness: 200, damping: 16, mass: 1.4 })
        );
        isAnimatedRef.current = true;
      }
    }, [isNew]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    }));

    const cardStyle = {
      backgroundColor: isValidWord === null ? wordColorStatus.cardColor : wordColorStatus.cardColor,
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

  const GlassSquare = ({
    square,
    isMainWord,
    index,
  }: {
    square: {
      char: Animated.SharedValue<string>;
      scale: Animated.SharedValue<number>;
      backgroundColor: Animated.SharedValue<string>;
    };
    isMainWord: boolean;
    index: number;
  }) => {
    const MAIN_SQUAR_WIDTH = CARD_WIDTH_CALCULATION < 40 ? CARD_WIDTH_CALCULATION : 40;
    const ADDITIONAL_SQUAR_WIDTH = CARD_WIDTH_CALCULATION < 22 ? CARD_WIDTH_CALCULATION : 22;
    const MAIN_SQUAR_FONT_SIZE = MAIN_SQUAR_WIDTH / 2.1;
    const ADDITIONAL_SQUAR_FONT_SIZE = ADDITIONAL_SQUAR_WIDTH / 2.1;
    const SQUARE_FONT_SIZE = isMainWord ? MAIN_SQUAR_FONT_SIZE : ADDITIONAL_SQUAR_FONT_SIZE;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: square.scale.value }],
      backgroundColor: square.backgroundColor.value,
    }));

    return (
      <Animated.View
        style={[
          styles.glassSquare,
          animatedStyle,
          {
            borderColor: isMainWord ? '#FFD700' : '#C0C0C0',
            width: isMainWord ? MAIN_SQUAR_WIDTH : ADDITIONAL_SQUAR_WIDTH,
            height: isMainWord ? MAIN_SQUAR_WIDTH : ADDITIONAL_SQUAR_WIDTH,
            borderWidth: isMainWord ? 2 : 1,
            borderRadius: isMainWord ? 5 : 3,
          },
        ]}
      >
        {square.char.value ? (
          <Text
            style={{
              fontFamily: Font.black,
              color: '#FFFFFF',
              textAlign: 'center',
              fontSize: SQUARE_FONT_SIZE,
            }}
          >
            {square.char.value}
          </Text>
        ) : null}
      </Animated.View>
    );
  };

  const renderedWordSquares = useMemo(() => {
    return wordSquareStates.current.map((wordState, wordIndex) => {
      const isMainWord = wordIndex === wordSquareStates.current.length - 1;
      return (
        <View
          key={`word_${wordState.word}_${wordIndex}`}
          style={{
            flexDirection: 'row-reverse',
            gap: isMainWord ? 8 : 5,
            justifyContent: 'center',
            marginTop: isMainWord ? 40 : 0,
          }}
        >
          {wordState.squares.map((square, squareIndex) => (
            <GlassSquare
              key={`square_${wordState.word}_${squareIndex}_${renderTrigger}`}
              square={square}
              isMainWord={isMainWord}
              index={squareIndex}
            />
          ))}
        </View>
      );
    });
  }, [renderTrigger]);

  useEffect(() => {
    if (word.length > 0 && draggedCardId) {
      const wordWidth = word.length * CARD_WIDTH + (word.length - 1) * 10;
      const startX = -wordWidth / 2;

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

  const renderedCards = useMemo(() => {
    return displayedWord.split('').map((char, index) => {
      const uniqueKey = `${char}_${index}_${Date.now()}`;
      const isNew = index === displayedWord.length - 1 && draggedCardId;
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
  }, [displayedWord, isValidWord, colors, draggedCardId, wordColorStatus]);

  const renderedWordDisplay = useMemo(() => {
    if (!displayedWord) return null;
    return (
      <LinearGradient colors={wordColorStatus.gradientColors} style={{ borderRadius: 5 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 1 }}>
          <Text style={[styles.wordText, { color: '#FFF' }]}>{displayedWord}</Text>
        </View>
      </LinearGradient>
    );
  }, [displayedWord, wordColorStatus]);

  return (
    <View style={styles.wordContainer}>
      <View style={styles.squaresContainer}>{renderedWordSquares}</View>
      <View
        style={{
          width: width,
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10,
          paddingBottom: 5,
          height: 85,
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
          }}
        >
          {renderedCards}
        </View>
        {renderedWordDisplay}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  squaresContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
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
  glassSquare: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(WordDisplay);
