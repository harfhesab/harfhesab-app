import React, { memo, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import {
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  BOUNDARY_X,
  BOUNDARY_Y,
  CARD_BORDER_RADIUS,
  CARD_SIZE_FLOATING,
  CARD_SIZE_DRAGGING,
  CARD_SIZE_ATTACHED,
  FONT_SIZE_FLOATING,
  FONT_SIZE_DRAGGING,
  FONT_SIZE_ATTACHED,
  MAGNET_OVERLAP_THRESHOLD,
  SPRING_CONFIG_MAGNET,
} from '../constants/constants';

interface Props {
  letter: string;
  index: number;
}

interface Position {
  x: number;
  y: number;
}

function FloatingCard({ letter, index }: Props) {
  const id = `${letter}_${index}`;
  const initialX = BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - CARD_SIZE_FLOATING);
  const initialY = BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING);
  const position = useSharedValue({ x: initialX, y: initialY });
  const velocity = useSharedValue({
    vx: (Math.random() - 0.5) * 200,
    vy: (Math.random() - 0.5) * 200,
  });
  const offset = useSharedValue({ x: 0, y: 0 });
  const isDragging = useSharedValue(false);
  const isAttached = useSharedValue(false);
  const attachedTo = useSharedValue<string | null>(null);
  const attachIndex = useSharedValue(0);
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING);

  const { registerCard, attachCard, detachCards, checkWord, startDragging, cards } = useDragDrop();

  useEffect(() => {
    registerCard({
      id,
      letter,
      homePosition: { x: initialX, y: initialY },
      position,
      velocity,
      isDragging,
      isAttached,
      cardSize,
      fontSize,
      attachedTo,
      attachIndex,
    });
    return () => {};
  }, [id, registerCard]);

  const calculateOverlap = (cardPos: Position, otherPos: Position) => {
    'worklet';
    const currentSize = cardSize.value;
    const cardRect = {
      left: cardPos.x,
      right: cardPos.x + currentSize,
      top: cardPos.y,
      bottom: cardPos.y + currentSize,
    };
    const otherRect = {
      left: otherPos.x,
      right: otherPos.x + CARD_SIZE_FLOATING,
      top: otherPos.y,
      bottom: otherPos.y + CARD_SIZE_FLOATING,
    };

    const overlapX = Math.min(cardRect.right, otherRect.right) - Math.max(cardRect.left, otherRect.left);
    const overlapY = Math.min(cardRect.bottom, otherRect.bottom) - Math.max(cardRect.top, otherRect.top);
    const overlapArea = overlapX <= 0 || overlapY <= 0 ? 0 : overlapX * overlapY;
    const otherArea = CARD_SIZE_FLOATING * CARD_SIZE_FLOATING;
    return overlapArea / otherArea;
  };

  const checkMagnet = () => {
    'worklet';
    if (!isDragging.value) return;

    const currentPos = position.value;
    let lastAttachedId = id;
    let maxIndex = 0;

    // Find the last attached card
    Object.keys(cards).forEach((otherId) => {
      if (otherId !== id && cards[otherId].attachedTo.value === id) {
        const index = cards[otherId].attachIndex.value;
        if (index > maxIndex) {
          maxIndex = index;
          lastAttachedId = otherId;
        }
      }
    });

    // Check for new cards to attach
    Object.keys(cards).forEach((otherId) => {
      if (otherId === id || cards[otherId].isAttached.value || cards[otherId].isDragging.value) return;
      const otherPos = cards[otherId].position.value;
      if (!otherPos) return;
      const overlapRatio = calculateOverlap(currentPos, otherPos);

      if (overlapRatio > MAGNET_OVERLAP_THRESHOLD) {
        runOnJS(attachCard)(otherId, lastAttachedId);
      }
    });
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      cardSize.value = withSpring(CARD_SIZE_DRAGGING, SPRING_CONFIG_MAGNET);
      fontSize.value = withSpring(FONT_SIZE_DRAGGING, SPRING_CONFIG_MAGNET);
      offset.value = { x: position.value.x, y: position.value.y };
      velocity.value = { vx: 0, vy: 0 };
      if (isAttached.value && attachedTo.value !== id) {
        runOnJS(detachCards)(id);
      }
      // Initialize the word with the dragged card's letter
      runOnJS(startDragging)(id);
      runOnJS(attachCard)(id, id, true);
    })
    .onUpdate((e) => {
      'worklet';
      position.value = {
        x: offset.value.x + e.translationX,
        y: offset.value.y + e.translationY,
      };
      checkMagnet();
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      runOnJS(checkWord)(id);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value,
    height: cardSize.value,
    zIndex: isDragging.value || attachedTo.value === id ? 2000 : 1000 - attachIndex.value,
    elevation: isDragging.value || attachedTo.value === id ? 12 : 8 - attachIndex.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.Text style={[styles.text, textStyle]}>{letter}</Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: CARD_BORDER_RADIUS,
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