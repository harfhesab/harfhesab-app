import React, { useRef } from 'react';
import { View, StyleSheet, Text, ImageBackground } from 'react-native';
import { useDragDrop } from '../context/OnboardingContext';
import Font from '../../../utils/Font';
import {
  BOUNDARY_TOP_OFFSET,
  SLOT_SIZE,
  SLOT_BORDER_RADIUS,
  SLOT_TEXT_FONT_SIZE,
  BOUNDARY_BOTTOM_OFFSET,
  CARD_SIZE_SLOTTED,
  FONT_SIZE_SLOTTED,
} from "../constants/constants";
import useAppTheme from '../../../hooks/theme/useAppTheme';
import AnimatedSkiaText from '../../text-components/AnimatedSkiaText';
import { useSharedValue } from 'react-native-reanimated';

interface Props {
  index: number;
  word: string;
  unknown_word: boolean;
  assigned: boolean;
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
const DropZone: React.FC<Props> = ({ index, word, unknown_word, assigned}) => {
  const colors = useAppTheme();
  const ref = useRef<View>(null);
  const { registerSlot } = useDragDrop();
  const fontSizeScale = getFontScale(word);
  const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_SLOTTED * fontSizeScale;
  const fontSize = useSharedValue(FONT_SIZE_FLOATING_SCALED);

  const onLayout = () => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      const centerX = pageX + width / 2;
      const centerY = pageY + height / 2 - BOUNDARY_TOP_OFFSET + (BOUNDARY_BOTTOM_OFFSET*2);
      registerSlot(index, { x: centerX, y: centerY });
    });
  };

  return (
    <View ref={ref} style={[styles.slot, {borderColor:colors.primary.a1, backgroundColor:`${colors.primary.a1}30`}]} onLayout={onLayout}>
      
      {
        assigned == true?
        <ImageBackground
          source={require("../../../assets/image/word-card.png")}
          resizeMode="stretch"
          style={{ width: CARD_SIZE_SLOTTED*1.3, height: CARD_SIZE_SLOTTED, alignItems:'center', justifyContent:'center' }}
        >
            <AnimatedSkiaText
              text={word}
              fontSize={fontSize}
              initialFontSize={FONT_SIZE_FLOATING_SCALED}
              initialWidth={CARD_SIZE_SLOTTED*1.3}
              initialHeight={CARD_SIZE_SLOTTED}
            />
        </ImageBackground>
        :
        <Text style={styles.text}>{index + 1}</Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: SLOT_SIZE*1.3,
    height: SLOT_SIZE,
    borderWidth: 2,
    borderRadius: SLOT_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    elevation: 0,
  },
  text: {
    fontSize: SLOT_TEXT_FONT_SIZE,
    color: '#FFFFFF50',
    fontFamily: Font.black,
    textAlign:'center'
  },
});

export default DropZone;