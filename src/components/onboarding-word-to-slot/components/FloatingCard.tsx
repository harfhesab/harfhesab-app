import React, { memo, useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDragDrop } from '../context/OnboardingContext';
import Font from '../../../utils/Font';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  BOUNDARY_X,
  BOUNDARY_Y,
  CARD_BORDER_RADIUS,
  CARD_SIZE_FLOATING,
  FONT_SIZE_FLOATING,
} from "../constants/constants";
import AnimatedSkiaText from '../../text-components/AnimatedSkiaText';
import Icon from '../../../utils/Icon';


interface Props {
  word: string;
  index: number;
  unknown_word : boolean | null | undefined;
}

function getFontScale(word:string) {
  const trimmed = (word || '').trim();
  const len = trimmed.length;

  if (len === 0) return 1.8;

  const hasSpace = /\s/.test(trimmed);
  const SINGLE_WORD_THRESHOLD = 9;

  let scale =
    1.75 -
    0.3 * Math.log(len + 1) -
    0.015 * len +
    0.35 / (len + 1) +
    0.15 * Math.exp(-Math.pow(len - 1, 2) / 2);

  if (!hasSpace) {
    if (len > SINGLE_WORD_THRESHOLD) {
      const excess = len - SINGLE_WORD_THRESHOLD;
      const penalty = 0.045 * excess + 0.12 * Math.log(excess + 1);
      scale -= penalty;
    } else {
      const boost = 0.28 * Math.exp(-len / 5) - 0.045;
      scale += Math.max(0, boost);
    }
  }

  const minScale = (!hasSpace && len > SINGLE_WORD_THRESHOLD) ? 0.8 : 0.95;

  return Math.max(minScale, Math.min(1.8, scale));
}

function FloatingCard({ word, index, unknown_word }: Props) {
  const { registerCard} = useDragDrop();
  const fontSizeScale = getFontScale(word);
  const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_FLOATING * fontSizeScale;
  const id = `${word}_${index}`;
  const initialX = BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3));
  const initialY = BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING);
  const position = useSharedValue({ x: initialX, y: initialY });
  const velocity = useSharedValue({
    vx: (Math.random() - 0.5) * 200,
    vy: (Math.random() - 0.5) * 200,
  });

  const isAssigned = useSharedValue(false);
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING_SCALED);

  

  useEffect(() => {
    registerCard({
      id,
      word,
      homePosition: { x: initialX, y: initialY },
      position,
      velocity,
      isAssigned,
      cardSize,
      fontSize,
    });
    return () => {};
  }, [id, registerCard]);


  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value*1.3,
    height: cardSize.value,
    zIndex: 1,
    elevation: 5,
  }));

 

  return (
      <Animated.View style={[styles.card, cardStyle]}>
        <ImageBackground
          source={require("../../../assets/image/word-card.png")}
          resizeMode="stretch"
          style={{ width: '100%', height: '100%', alignItems:'center', justifyContent:'center' }}
        >
          {
            (unknown_word)?
            <View style={{width:CARD_SIZE_FLOATING-15, height:CARD_SIZE_FLOATING-15, borderColor:"#CC000090", backgroundColor:"#CC000020", borderWidth:1.5, borderRadius:CARD_SIZE_FLOATING/2, alignItems:'center', justifyContent:'center'}}>
              <Icon name={"question"} type={"FontAwesome5"} style={{color:"#CC0000", fontSize:CARD_SIZE_FLOATING-30}}/>
            </View>
            :
            <AnimatedSkiaText
              text={word}
              gradientColors={unknown_word ? ['#FF8800',  '#CC0000'] : undefined}
              fontSize={fontSize}
              initialFontSize={FONT_SIZE_FLOATING_SCALED}
              initialWidth={CARD_SIZE_FLOATING*1.3}
              initialHeight={CARD_SIZE_FLOATING}
            />
          }
        </ImageBackground>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: CARD_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'visible',
  },
  text: {
    color: '#333',
    fontFamily: Font.bakh_extra_black,
    textAlign: 'center',
  },
});

export default memo(FloatingCard);