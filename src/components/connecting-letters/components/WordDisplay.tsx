import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  SharedValue
} from 'react-native-reanimated';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import { WORD_DISPLAY_DURATION } from '../constants/constants';
import LinearGradient from 'react-native-linear-gradient';
import TextSkia from '../../text-components/TextSkia';

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
    gradientColors: ['#4d2719', '#86442d'],
  });
  const [squareUpdateCount, setSquareUpdateCount] = useState(0); // state جدید برای تحریک رندر
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardPositions = useRef<
    Array<{ char: string; translateX: SharedValue<number>; key: string }>
  >([]);
  const wordSquareStates = useRef<
    Array<{
      word: string;
      squares: Array<{
        char: SharedValue<string>;
        scale: SharedValue<number>;
        backgroundColor: SharedValue<string>;
      }>;
    }>
  >(
    [
      ...data.additional_words.map((w) => ({
        word: w,
        squares: w.split('').map((char) => ({
          char: useSharedValue(''),
          scale: useSharedValue(1),
          backgroundColor: useSharedValue('transparent'),
        })),
      })),
      {
        word: data.word,
        squares: data.word.split('').map((char) => ({
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
        cardColor: '#fcb900',
        gradientColors: ['#4d2719', '#86442d'],
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
          cardColor: isNewWord ? '#388e3c' : '#0099CC',
          gradientColors: isNewWord
            ? ['#388e3c', '#4caf50', '#81c784']
            : ['#1976d2', '#2196f3', '#64b5f6'],
        });
        if (isNewWord) {
          const targetWordState = wordSquareStates.current.find((ws) => ws.word === currentWord);
          if (targetWordState) {
            targetWordState.squares.forEach((square, index) => {
              square.char.value = currentWord[index] || '';
              square.scale.value = withSequence(
                withTiming(1.25, { duration: 250, easing: Easing.out(Easing.quad) }),
                withSpring(1, { stiffness: 300, damping: 18, mass: 1.2 })
              );
              square.backgroundColor.value = withTiming('#388e3c', { duration: 150 });
            });
            setSquareUpdateCount((prev) => prev + 1); // تحریک رندر
          }
        }
      } else {
        setWordColorStatus({
          cardColor: '#b71c1c',
          gradientColors: ['#b71c1c', '#d32f2f', '#f44336'],
        });
      }

      clearTimer();
      timerRef.current = setTimeout(() => {
        if (isValid && !foundWords.includes(currentWord)) {
          setFoundWords((prev) => [...prev, currentWord]);
          const targetWordState = wordSquareStates.current.find((ws) => ws.word === currentWord);
          if (targetWordState) {
            targetWordState.squares.forEach((square, index) => {
              square.char.value = currentWord[index] || ''; // حفظ حروف
              square.backgroundColor.value = '#388e3c'; // حفظ رنگ سبز
            });
            setSquareUpdateCount((prev) => prev + 1); // تحریک رندر
          }
        }
        setDisplayedWord('');
        setIsValidWord(null);
        setWordColorStatus({
          cardColor: '#fcb900',
          gradientColors: ['#4d2719', '#86442d'],
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
        setSquareUpdateCount((prev) => prev + 1); // تحریک رندر
      }, WORD_DISPLAY_DURATION);
    } else if (!draggedCardId && word.length === 0) {
      clearTimer();
      setDisplayedWord('');
      setIsValidWord(null);
      setWordColorStatus({
        cardColor: '#fcb900',
        gradientColors: ['#4d2719', '#86442d'],
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
      setSquareUpdateCount((prev) => prev + 1); // تحریک رندر
    }

    return clearTimer;
  }, [draggedCardId, word, data, setWord, colors, foundWords]);

  const CARD_WIDTH_CALCULATION = (width - (30 + (data.letters.length - 1) * 10)) / data.letters.length;
  const CARD_WIDTH = CARD_WIDTH_CALCULATION < 30 ? CARD_WIDTH_CALCULATION : 30;
  const CARD_FONT_SIZE = CARD_WIDTH / 1.6;

  const CardWithAnimation = memo(({
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
    const scale = useSharedValue(isNew ? 0 : 1);
    const translateX = useSharedValue(0);

    useEffect(() => {
      cardPositions.current[index] = { char, translateX, key: uniqueKey };
    }, [char, index, uniqueKey]);

    useEffect(() => {
      if (isNew) {
        scale.value = withSequence(
          withTiming(1.3, { duration: 250, easing: Easing.out(Easing.quad) }),
          withSpring(1, { stiffness: 180, damping: 12 })
        );
      }
    }, [isNew]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    }));

    const cardStyle = {
      backgroundColor: isValidWord === null ? wordColorStatus.cardColor : wordColorStatus.cardColor,
    };

    return (
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <View style={[styles.card, cardStyle, { width: CARD_WIDTH, height: CARD_WIDTH }]}>
          <Text
            style={{
              fontSize: CARD_FONT_SIZE,
              fontFamily: Font.bakh_extra_black,
              color: isValidWord === null ? '#000' : '#FFF',
            }}
          >
            {char}
          </Text>
        </View>
      </Animated.View>
    );
  });

  const GlassSquare = memo(({
    square,
    isMainWord,
    index,
  }: {
    square: {
      char: SharedValue<string>;
      scale: SharedValue<number>;
      backgroundColor: SharedValue<string>;
    };
    isMainWord: boolean;
    index: number;
  }) => {
    const MAIN_SQUAR_WIDTH = CARD_WIDTH_CALCULATION < 40 ? CARD_WIDTH_CALCULATION : 40;
    const ADDITIONAL_SQUAR_WIDTH = CARD_WIDTH_CALCULATION < 25 ? CARD_WIDTH_CALCULATION : 25;
    const SQUARE_FONT_SIZE = isMainWord ? MAIN_SQUAR_WIDTH / 1.7 : ADDITIONAL_SQUAR_WIDTH / 1.7;

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
            borderColor: isMainWord ? '#fcb900' : '#abb8c3',
            width: isMainWord ? MAIN_SQUAR_WIDTH : ADDITIONAL_SQUAR_WIDTH,
            height: isMainWord ? MAIN_SQUAR_WIDTH : ADDITIONAL_SQUAR_WIDTH,
            borderWidth: isMainWord ? 2 : 1,
            borderRadius: isMainWord ? 5 : 3,
          },
        ]}
      >
        <Text
          style={{
            fontFamily: Font.bakh_black,
            color: '#FFFFFF',
            textAlign: 'center',
            fontSize: SQUARE_FONT_SIZE,
          }}
        >
          {square.char.value}
        </Text>
      </Animated.View>
    );
  });

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
              key={`square_${wordState.word}_${squareIndex}`}
              square={square}
              isMainWord={isMainWord}
              index={squareIndex}
            />
          ))}
        </View>
      );
    });
  }, [wordSquareStates.current, squareUpdateCount]);

  useEffect(() => {
    if (word.length > 0 && draggedCardId) {
      const wordWidth = word.length * CARD_WIDTH + (word.length - 1) * 10;
      const startX = -wordWidth / 2;

      cardPositions.current.forEach((card, idx) => {
        if (idx < word.length) {
          card.translateX.value = withSpring(startX + idx * (CARD_WIDTH + 10), {
            stiffness: 200,
            damping: 16,
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
        <View style={{ paddingHorizontal: 20 }}>
          <TextSkia
            text={displayedWord}
            fontFamily={Font.bakh_black}
            borderWidth={2.5}
            fontSize={20}
          />
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