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
  BOUNDARY_BOTTOM_OFFSET
} from "../constants/constants";
import useAppTheme from '../../../hooks/theme/useAppTheme';

interface Props {
  index: number;
}

const DropZone: React.FC<Props> = ({ index }) => {
  const colors = useAppTheme();
  const ref = useRef<View>(null);
  const { registerSlot } = useDragDrop();

  const onLayout = () => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      const centerX = pageX + width / 2;
      const centerY = pageY + height / 2 - BOUNDARY_TOP_OFFSET + (BOUNDARY_BOTTOM_OFFSET*2);
      registerSlot(index, { x: centerX, y: centerY });
    });
  };

  return (
    <View ref={ref} style={[styles.slot, {borderColor: colors.primary.a1}]} onLayout={onLayout}>
      <Text style={styles.text}>{index + 1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderWidth: 2,
    borderRadius: SLOT_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1f5fe50',
    zIndex: -1,
    elevation: 0,
  },
  text: {
    fontSize: SLOT_TEXT_FONT_SIZE,
    color: '#FFFFFF50',
    fontFamily: Font.black,
  },
});

export default DropZone;