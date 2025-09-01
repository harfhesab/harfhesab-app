import React, {memo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
} from '../constants/constants';
import SkiaLetter from '../../text-components/SkiaLetter';
import { selectCardSoundInLettersConnecting } from '../../../utils/sound/SoundFunctions';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  letter: string;
  index: number;
}

function FloatingCard({ letter, index }: Props) {
  const id = `${letter}_${index}`;

  // موقعیت اولیه (مثل کد قبلی‌ات)
  const initialX = Math.random() * (/* use BOUNDARY_WIDTH - CARD_SIZE_FLOATING or keep your calc */ 200);
  const initialY = Math.random() * 200;

  const position = useSharedValue({ x: initialX, y: initialY });
  const velocity = useSharedValue({ vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200 });
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING);

  // selected: 0 یا 1
  const selected = useSharedValue<number>(0);

  const { registerCard, selectCard } = useLetters();

  useEffect(() => {
    registerCard({
      id,
      letter,
      startPosition: { x: initialX, y: initialY },
      position,
      velocity,
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
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value,
    height: cardSize.value,
    zIndex: selected.value === 1 ? CARD_ZINDEX_SELECTED : CARD_ZINDEX_NORMAL,
    backgroundColor: selected.value === 1 ? '#0693e399' : '#0693e3',
    elevation: selected.value === 1 ? 1 : 10,
  }), []);

  const onClick = () => {
    selectCard(id);
    selectCardSoundInLettersConnecting()
  };

  return (
    <AnimatedTouchableOpacity activeOpacity={0.8} onPress={onClick} style={[styles.card, cardStyle]}>
      <SkiaLetter
        text={letter}
        fontSize={fontSize}
        initialFontSize={FONT_SIZE_FLOATING}
        initialWidth={CARD_SIZE_FLOATING}
        initialHeight={CARD_SIZE_FLOATING}
      />
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
