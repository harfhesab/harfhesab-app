import React, {memo, useEffect } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import {
  CARD_SIZE_FLOATING,
  FONT_SIZE_FLOATING,
  CARD_ZINDEX_NORMAL,
  CARD_BORDER_RADIUS,
} from '../constants/constants';
import SkiaLetter from '../../text-components/SkiaLetter';

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


  const { registerCard } = useLetters();

  useEffect(() => {
    registerCard({
      id,
      letter,
      startPosition: { x: initialX, y: initialY },
      position,
      velocity,
      cardSize,
      fontSize,
    });
    // cleanup ندارد چون کارت‌ها در context ممکن است برای بعضی سناریوها حذف نشوند
  }, [id, registerCard]);


  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value,
    height: cardSize.value,
    zIndex: CARD_ZINDEX_NORMAL,
    elevation: 10,
  }), []);

  return (
    <AnimatedTouchableOpacity activeOpacity={0.8} style={[styles.card, cardStyle]}>
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
