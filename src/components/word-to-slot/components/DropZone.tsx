import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import {
  BOUNDARY_TOP_OFFSET,
  SLOT_SIZE,
  SLOT_BORDER_RADIUS,
  SLOT_TEXT_FONT_SIZE,
  DISTANCE_BOUNDARY_AND_SLOT,
  BOUNDARY_BOTTOM_OFFSET,
  FONT_SIZE_SLOTTED
} from "../constants/constants";
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Icon from '../../../utils/Icon';

interface Props {
  index: number;
  word: string;
  word_help_used: boolean;
  unknown_word: boolean;
  unknown_word_completed: boolean;
}

const DropZone: React.FC<Props> = ({ index, word_help_used, word , unknown_word, unknown_word_completed}) => {
  const colors = useAppTheme();
  const ref = useRef<View>(null);
  const { registerSlot } = useDragDrop();
  const fontSizeScale = (word.length < 3)?1.6:(word.length < 4)?1.4:(word.length < 5)?1.3:(word.length < 6)?1.2:(word.length < 7)?1.1:(word.length < 8)?1:(word.length > 12)?0.8:0.9;

  const onLayout = () => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      const centerX = pageX + width / 2;
      const centerY = pageY + height / 2 - BOUNDARY_TOP_OFFSET + (BOUNDARY_BOTTOM_OFFSET*2);
      registerSlot(index, { x: centerX, y: centerY });
    });
  };

  return (
    <View ref={ref} style={[styles.slot, {borderColor:word_help_used?"#ff9800":colors.primary.a1, backgroundColor:`${colors.primary.a1}30`}]} onLayout={onLayout}>
      {
        !word_help_used?
        <Text style={styles.text}>{index + 1}</Text>
        :(word_help_used &&(!unknown_word || (unknown_word && unknown_word_completed)))?
        <Text style={{color:"#ff9800", fontFamily:Font.iran_yekan_black_fa, fontSize:FONT_SIZE_SLOTTED*fontSizeScale, textAlign:'center'}}>{word}</Text>
        :(word_help_used && unknown_word && !unknown_word_completed)&&
        <View style={{width:SLOT_SIZE-10, height:SLOT_SIZE-10, borderColor:"#b71c1c", backgroundColor:"#CC000020", borderWidth:1, borderRadius:SLOT_SIZE/2, alignItems:'center', justifyContent:'center'}}>
          <Icon name={"question"} type={"FontAwesome5"} style={{color:"#b71c1c", fontSize:SLOT_SIZE-25}}/>
        </View>

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