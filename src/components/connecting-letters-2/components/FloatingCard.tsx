import React, {memo, useEffect } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import {
  CARD_SIZE_FLOATING,
  FONT_SIZE_FLOATING,
  CARD_SIZE_SELECTED,
  CARD_ZINDEX_SELECTED,
  CARD_ZINDEX_NORMAL,
  CARD_BORDER_RADIUS,
  FONT_SIZE_SELECTED,
  MAX_VELOCITY,
  MIN_VELOCITY,
} from '../constants/constants';
import SkiaLetter from '../../text-components/SkiaLetter';
import { selectCardSoundInLettersConnecting } from '../../../utils/sound/SoundFunctions';
import { vibrate } from '../../../utils/vibrationManager';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  letter: string;
  index: number;
  initialPosition: { x: number; y: number };
}

function FloatingCard({ letter, index, initialPosition }: Props) {
  const id = `${letter}_${index}`;

  // x/y و vx/vy به‌صورت SharedValue عددی جدا نگه داشته می‌شوند (نه یک آبجکت {x,y}).
  // این کار تخصیص آبجکت در هر فریم موتور فیزیک را حذف می‌کند؛ برای جزئیات دلیل
  // این تغییر به کامنت بالای frameCallback در LettersContext.tsx مراجعه کن.
  const x = useSharedValue(initialPosition.x);
  const y = useSharedValue(initialPosition.y);
  const vx = useSharedValue((Math.random() - 0.5) * 2 * MAX_VELOCITY * 0.7);
  const vy = useSharedValue((Math.random() - 0.5) * 2 * MAX_VELOCITY * 0.7);
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING);

  // selected: 0 یا 1
  const selected = useSharedValue<number>(0);

  const { registerCard, selectCard } = useLetters();

  useEffect(() => {
    registerCard({
      id,
      letter,
      x,
      y,
      vx,
      vy,
      cardSize,
      fontSize,
      selected,
    });
    // cleanup ندارد چون کارت‌ها در context ممکن است برای بعضی سناریوها حذف نشوند
  }, [id, registerCard]);

  // واکنش به تغییر selected (انیمیشن با spring)
  useAnimatedReaction(
    () => selected.value,
    (sel) => {
      if (sel === 1) {
        cardSize.value = withSpring(CARD_SIZE_SELECTED, { stiffness: 300, damping: 18 });
        fontSize.value = withSpring(FONT_SIZE_SELECTED, { stiffness: 300, damping: 18 });
      } else {
        cardSize.value = withSpring(CARD_SIZE_FLOATING, { stiffness: 300, damping: 18 });
        fontSize.value = withSpring(FONT_SIZE_FLOATING, { stiffness: 300, damping: 18 });
      }
    },
    []
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    width: cardSize.value,
    height: cardSize.value,
    zIndex: selected.value === 1 ? CARD_ZINDEX_SELECTED : CARD_ZINDEX_NORMAL,
    elevation: selected.value === 1 ? 1 : 10,
  }));

  const onClick = () => {
    selectCard(id);
    vibrate()
    selectCardSoundInLettersConnecting()
  };

  return (
    <AnimatedTouchableOpacity activeOpacity={0.8} onPress={onClick} style={[styles.card, cardStyle]}>
      <ImageBackground
        source={require("../../../assets/image/letter-card.png")}
        resizeMode="stretch"
        style={{ width: '100%', height: '100%', alignItems:'center', justifyContent:'center' }}
      >
        <SkiaLetter
          text={letter}
          fontSize={fontSize}
          initialFontSize={FONT_SIZE_FLOATING}
          initialWidth={CARD_SIZE_FLOATING}
          initialHeight={CARD_SIZE_FLOATING}
        />
      </ImageBackground>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    borderRadius: CARD_BORDER_RADIUS,
  },
});

export default memo(FloatingCard);