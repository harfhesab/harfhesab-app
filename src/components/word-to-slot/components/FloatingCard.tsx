import React, { memo, useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import {
  SLOT_SIZE,
  SLOT_SENSITIVITY_SIZE,
  BOUNDARY_TOP_OFFSET,
  BOUNDARY_HORIZONTAL_OFFSET,
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  BOUNDARY_X,
  BOUNDARY_Y,
  CARD_SIZE_FLOATING,
  CARD_SIZE_DRAGGING,
  CARD_SIZE_SLOTTED,
  FONT_SIZE_FLOATING,
  FONT_SIZE_DRAGGING,
  FONT_SIZE_SLOTTED,
} from "../constants/constants";

// افست‌ها برای جبران موقعیت به منظور نگه داشتن مرکز کارت
const OFFSET_DRAGGING = (CARD_SIZE_DRAGGING - CARD_SIZE_FLOATING) / 2; // 10 پیکسل
const OFFSET_SLOTTED = (CARD_SIZE_SLOTTED - CARD_SIZE_FLOATING) / 2; // -10 پیکسل

// تنظیمات انیمیشن برای نرم‌تر شدن
const SPRING_CONFIG_SOFT = { stiffness: 280, damping: 10, mass: 1.1, overshootClamping: false }; // برای درگ و بازگشت به شناور
const SPRING_CONFIG_SOFT_SLOT = { stiffness: 280, damping: 10, mass: 1.1, overshootClamping: false }; // برای چسبیدن به اسلات

interface Props {
  word: string;
  index: number;
  numberOfCards: number;
}

interface Position {
  x: number;
  y: number;
}

function FloatingCard({ word, index, numberOfCards }: Props) {
  const fontSizeScale = (word.length < 3)?1.6:(word.length < 4)?1.5:(word.length < 5)?1.4:(word.length < 6)?1.3:(word.length < 7)?1.2:(word.length < 8)?1.1:(word.length > 12)?0.9:1;
  const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_FLOATING * fontSizeScale;
  const FONT_SIZE_DRAGGING_SCALED = FONT_SIZE_DRAGGING * fontSizeScale;
  const FONT_SIZE_SLOTTED_SCALED = FONT_SIZE_SLOTTED * fontSizeScale;
  const id = `${word}_${index}`;
  const initialX = BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING);
  const initialY = BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING);
  const position = useSharedValue({ x: initialX, y: initialY });
  const velocity = useSharedValue({
    vx: (Math.random() - 0.5) * 200,
    vy: (Math.random() - 0.5) * 200,
  });
  const offset = useSharedValue({ x: 0, y: 0 });
  const isDragging = useSharedValue(false);
  const isAssigned = useSharedValue(false);
  const dragFromSlot = useSharedValue<number | null>(null);
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING_SCALED);

  const { registerCard, assignCardToSlot, getSlotPosition, getSlotOfCard, unassignCardFromSlot } = useDragDrop();

  useEffect(() => {
    registerCard({
      id,
      word,
      homePosition: { x: initialX, y: initialY },
      position,
      velocity,
      isDragging,
      isAssigned,
      cardSize,
      fontSize,
    });
    return () => {};
  }, [id, registerCard]);

  const calculateOverlap = (cardPos: Position, slotPos: Position) => {
    'worklet';
    const currentSize = cardSize.value;
    const cardRect = {
      left: cardPos.x,
      right: cardPos.x + currentSize,
      top: cardPos.y,
      bottom: cardPos.y + currentSize,
    };
    const slotRect = {
      left: slotPos.x - SLOT_SENSITIVITY_SIZE / 2,
      right: slotPos.x + SLOT_SENSITIVITY_SIZE / 2,
      top: slotPos.y - SLOT_SENSITIVITY_SIZE / 2,
      bottom: slotPos.y + SLOT_SENSITIVITY_SIZE / 2,
    };

    const overlapX = Math.min(cardRect.right, slotRect.right) - Math.max(cardRect.left, slotRect.left);
    const overlapY = Math.min(cardRect.bottom, slotRect.bottom) - Math.max(cardRect.top, slotRect.top);
    const overlap = overlapX <= 0 || overlapY <= 0 ? 0 : overlapX * overlapY;
    return overlap;
  };

  const snapToSlot = () => {
    'worklet';
    if (isAssigned.value) {
      return;
    }

    let closestSlot = -1;
    let maxOverlap = 0;

    for (let idx = 0; idx < numberOfCards; idx++) {
      const pos = getSlotPosition(idx);
      if (!pos) {
        continue;
      }
      const overlap = calculateOverlap(position.value, pos);
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        closestSlot = idx;
      } else if (overlap === maxOverlap && overlap > 0) {
        closestSlot = Math.max(closestSlot, idx);
      }
    }

    if (closestSlot !== -1 && maxOverlap > 0) {
      isAssigned.value = true;
      cardSize.value = withSpring(CARD_SIZE_SLOTTED, SPRING_CONFIG_SOFT_SLOT);
      fontSize.value = withSpring(FONT_SIZE_SLOTTED_SCALED, SPRING_CONFIG_SOFT_SLOT);
      const slotPos = getSlotPosition(closestSlot)!;
      position.value = withSpring(
        {
          x: slotPos.x - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 + OFFSET_SLOTTED,
          y: slotPos.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4 + OFFSET_SLOTTED,
        },
        SPRING_CONFIG_SOFT_SLOT
      );
      const fromSlot = getSlotOfCard(id);
      runOnJS(assignCardToSlot)(id, closestSlot, dragFromSlot.value);

      if (fromSlot !== null && fromSlot !== closestSlot) {
        runOnJS(unassignCardFromSlot)(fromSlot);
      }
    } else {
      cardSize.value = withSpring(CARD_SIZE_FLOATING, SPRING_CONFIG_SOFT);
      fontSize.value = withSpring(FONT_SIZE_FLOATING_SCALED, SPRING_CONFIG_SOFT);
      const newPos = {
        x: BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING),
        y: BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
      };
      position.value = withSpring(newPos, SPRING_CONFIG_SOFT);
      velocity.value = {
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
      };
      isAssigned.value = false;
      const currentSlot = getSlotOfCard(id);
      if (currentSlot !== null) {
        runOnJS(unassignCardFromSlot)(currentSlot);
      }
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      cardSize.value = withSpring(CARD_SIZE_DRAGGING, SPRING_CONFIG_SOFT);
      fontSize.value = withSpring(FONT_SIZE_DRAGGING_SCALED, SPRING_CONFIG_SOFT);
      offset.value = { x: position.value.x + OFFSET_SLOTTED, y: position.value.y + OFFSET_SLOTTED };
      position.value = {
        x: position.value.x - OFFSET_DRAGGING + OFFSET_SLOTTED,
        y: position.value.y - OFFSET_DRAGGING + OFFSET_SLOTTED,
      };
      velocity.value = { vx: 0, vy: 0 };
      const currentSlot = getSlotOfCard(id);
      dragFromSlot.value = currentSlot;
      if (isAssigned.value) {
        runOnJS(unassignCardFromSlot)(currentSlot);
        isAssigned.value = false;
      }
    })
    .onUpdate(e => {
      position.value = {
        x: offset.value.x + e.translationX - OFFSET_DRAGGING,
        y: offset.value.y + e.translationY - OFFSET_DRAGGING,
      };
    })
    .onEnd(() => {
      isDragging.value = false;
      snapToSlot();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value,
    height: cardSize.value,
    zIndex: isDragging.value ? 2000 : 1,
    elevation: isDragging.value ? 12 : 5,
  }));

  const textStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.Text style={[styles.text, textStyle]}>{word}</Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: '#ffd54f',
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
    fontFamily: Font.black,
    textAlign: 'center',
  },
});

export default memo(FloatingCard);