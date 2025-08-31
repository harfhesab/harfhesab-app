import React, { memo, useEffect, useMemo, useState } from 'react'; // 1. useState ایمپورت شد
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  runOnJS,
  SharedValue, // ایمپورت تایپ برای پراپ‌ها
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import Font from '../../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// --- رنگ‌های ثابت ---
const SUCCESS_CARD_COLOR = "#0ea960";
const ERROR_CARD_COLOR = "#b71c1c";
const SUCCESS_GRADIENT = ['#86442d', '#4d2719'];
const ERROR_GRADIENT = ['#b71c1c', '#d32f2f', '#f44336'];

// 2. تعریف تایپ برای پراپ‌های کامپوننت فرزند
interface CardWithAnimationProps {
  item: string;
  index: number;
  CARD_WIDTH: number;
  CARD_FONT_SIZE: number;
  cardColorProgress: SharedValue<number>; // پراپ باید خود SharedValue باشد
}

// =================================================================
const CardWithAnimation = memo(({ item, CARD_WIDTH, CARD_FONT_SIZE, cardColorProgress }: CardWithAnimationProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { stiffness: 180, damping: 12 });
  }, []);

  // 4. انیمیشن رنگ در فرزند بر اساس shared value دریافتی از والد اجرا می‌شود
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        cardColorProgress.value,
        [0, 1],
        [SUCCESS_CARD_COLOR, ERROR_CARD_COLOR]
      ),
    };
  });

  const cardStyle = {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
  };

  return (
    <Animated.View style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_WIDTH }]}>
      <Animated.View style={[styles.card, cardStyle, animatedCardStyle]}>
        <Text style={[styles.cardText, { fontSize: CARD_FONT_SIZE }]}>
          {item}
        </Text>
      </Animated.View>
    </Animated.View>
  );
});
// =================================================================


const WordDisplay = () => {
  const { connectedLetters, data } = useLetters();

  const cardColorProgress = useSharedValue(0); // 0 = success, 1 = error
  const [wordGradient, setWordGradient] = useState(SUCCESS_GRADIENT);

  useEffect(() => {
    const resetGradient = () => {
      setWordGradient(SUCCESS_GRADIENT);
    };

    if (connectedLetters.length === 0) {
      cardColorProgress.value = withTiming(1, { duration: 400 });
      setWordGradient(ERROR_GRADIENT);

      const timer = setTimeout(() => {
        cardColorProgress.value = withTiming(0, { duration: 400 });
        runOnJS(resetGradient)();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      cardColorProgress.value = withTiming(0, { duration: 200 });
      setWordGradient(SUCCESS_GRADIENT);
    }
  }, [connectedLetters]);

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
      <View /> 
      
      <View style={styles.displayArea}>
        <View style={styles.cardsRow}>
          {/* 3 & 4. پاس دادن خود shared value به کامپوننت فرزند */}
          {connectedLetters.map((item, index) => (
            <CardWithAnimation
              key={index.toString()}
              item={item}
              index={index}
              CARD_WIDTH={CARD_WIDTH}
              CARD_FONT_SIZE={CARD_FONT_SIZE}
              cardColorProgress={cardColorProgress} // <-- اصلاح شد
            />
          ))}
        </View>

        {connectedLetters.length > 0 && (
          <LinearGradient colors={wordGradient} style={styles.wordGradient}>
            <View style={styles.wordContainer}>
              <Text style={styles.wordText}>{connectedLetters.join('')}</Text>
            </View>
          </LinearGradient>
        )}
      </View>
    </View>
  );
};

// استایل‌ها بدون تغییر باقی می‌مانند
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
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