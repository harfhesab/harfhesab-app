import React, { memo, useEffect, useRef } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDragDrop, useDragDropRegistry } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import {
  SLOT_SIZE,
  SLOT_SENSITIVITY_SIZE,
  BOUNDARY_WIDTH,
  BOUNDARY_HEIGHT,
  BOUNDARY_X,
  BOUNDARY_Y,
  CARD_BORDER_RADIUS,
  CARD_SIZE_FLOATING,
  CARD_SIZE_DRAGGING,
  CARD_SIZE_SLOTTED,
  FONT_SIZE_FLOATING,
  FONT_SIZE_DRAGGING,
  FONT_SIZE_SLOTTED,
} from "../constants/constants";
import AnimatedSkiaText from '../../text-components/AnimatedSkiaText';
import { dropWordToSlotCardInFloatingSound, dropWordToSlotCardInSlotSound, onStartDragWordToSlotCardSound, tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import { vibrate } from '../../../utils/vibrationManager';
import { navigate } from '../../../main/navigationService';
import Icon from '../../../utils/Icon';
import { getFontScale } from '../utils/getFontScale';

// تنظیمات انیمیشن برای نرم‌تر شدن
const SPRING_CONFIG_SOFT = { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false }; // برای درگ و بازگشت به شناور
const SPRING_CONFIG_SOFT_SLOT = { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false }; // برای چسبیدن به اسلات

interface Props {
  _id: string;
  word: string;
  index: number;
  unknown_word : boolean | null | undefined;
  unknown_word_completed : boolean | null | undefined;
}

interface Position {
  x: number;
  y: number;
}

function FloatingCard({_id, word, index, unknown_word, unknown_word_completed }: Props) {
  const { registerCard, assignCardToSlot, unassignCardFromSlot, numberOfCards, lockedPan, type, stageId, playingPartIndex } = useDragDrop();
  const { getSlotPosition, getSlotOfCard } = useDragDropRegistry();
  const fontSizeScale = getFontScale(word);
  const FONT_SIZE_FLOATING_SCALED = FONT_SIZE_FLOATING * fontSizeScale;
  const FONT_SIZE_DRAGGING_SCALED = FONT_SIZE_DRAGGING * fontSizeScale;
  const FONT_SIZE_SLOTTED_SCALED = FONT_SIZE_SLOTTED * fontSizeScale;
  const id = `${word}_${index}`;
  const initialX = BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3));
  const initialY = BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING);
  const position = useSharedValue({ x: initialX, y: initialY });
  const velocity = useSharedValue({
    vx: (Math.random() - 0.5) * 200,
    vy: (Math.random() - 0.5) * 200,
  });
  const offset = useSharedValue({ x: 0, y: 0 });
  const isDragging = useSharedValue(false);
  const dragZIndex = useSharedValue(1);
  const isAssigned = useSharedValue(false);
  const dragFromSlot = useSharedValue<number | null>(null);
  const cardSize = useSharedValue(CARD_SIZE_FLOATING);
  const fontSize = useSharedValue(FONT_SIZE_FLOATING_SCALED);

  
  const completedRef = useRef(false);
  completedRef.current ||= unknown_word === true && unknown_word_completed === true;
  const effectiveUnknownCompleted = unknown_word ? completedRef.current : false;

  useEffect(() => {
    registerCard({
      id,
      word,
      homePosition: { x: initialX, y: initialY },
      position,
      velocity,
      isDragging,
      dragZIndex,
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

    const fromSlot = dragFromSlot.value; // استفاده از dragFromSlot به جای getSlotOfCard

    if (closestSlot !== -1 && maxOverlap > 0) {
      isAssigned.value = true;
      cardSize.value = withSpring(CARD_SIZE_SLOTTED, SPRING_CONFIG_SOFT_SLOT);
      fontSize.value = withSpring(FONT_SIZE_SLOTTED_SCALED, SPRING_CONFIG_SOFT_SLOT);
      const slotPos = getSlotPosition(closestSlot)!;
      position.value = withSpring(
        {
          x: slotPos.x - ((CARD_SIZE_SLOTTED*1.3) + (SLOT_SIZE*1.3)) / 4,
          y: slotPos.y - (CARD_SIZE_SLOTTED + SLOT_SIZE) / 4,
        },
        SPRING_CONFIG_SOFT_SLOT
      );
      runOnJS(assignCardToSlot)(id, closestSlot, fromSlot);
      runOnJS(dropWordToSlotCardInSlotSound)();
    } else {
      cardSize.value = withSpring(CARD_SIZE_FLOATING, SPRING_CONFIG_SOFT);
      fontSize.value = withSpring(FONT_SIZE_FLOATING_SCALED, SPRING_CONFIG_SOFT);
      const newPos = {
        x: BOUNDARY_X + Math.random() * (BOUNDARY_WIDTH - (CARD_SIZE_FLOATING*1.3)),
        y: BOUNDARY_Y + Math.random() * (BOUNDARY_HEIGHT - CARD_SIZE_FLOATING),
      };
      position.value = withSpring(newPos, SPRING_CONFIG_SOFT);
      velocity.value = {
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
      };
      isAssigned.value = false;
      if (fromSlot !== null) {
        runOnJS(unassignCardFromSlot)(fromSlot);
      }
      runOnJS(dropWordToSlotCardInFloatingSound)();
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .enabled(!lockedPan && ((unknown_word && effectiveUnknownCompleted) || (!unknown_word)))
    .onStart(() => {
      'worklet';
      isDragging.value = true;
      dragZIndex.value = 2000 + Math.floor(Math.random() * 10000);
      runOnJS(onStartDragWordToSlotCardSound)();
      runOnJS(vibrate)();
      cardSize.value = withSpring(CARD_SIZE_DRAGGING, SPRING_CONFIG_SOFT);
      fontSize.value = withSpring(FONT_SIZE_DRAGGING_SCALED, SPRING_CONFIG_SOFT);
      // ذخیره موقعیت فعلی به عنوان افست
      offset.value = { x: position.value.x, y: position.value.y };
      // جبران موقعیت برای حفظ مرکز کارت هنگام تغییر اندازه
      position.value = {
        x: position.value.x - ((CARD_SIZE_DRAGGING*1.3) - (cardSize.value*1.3)) / 2,
        y: position.value.y - (CARD_SIZE_DRAGGING - cardSize.value) / 2,
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
      'worklet';
      position.value = {
        x: offset.value.x + e.translationX - ((cardSize.value*1.3) - (CARD_SIZE_SLOTTED*1.3)) / 2,
        y: offset.value.y + e.translationY - (cardSize.value - CARD_SIZE_SLOTTED) / 2,
      };
    })
    .onEnd(() => {
      isDragging.value = false;
      dragZIndex.value = 1;
      snapToSlot();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
    width: cardSize.value*1.3,
    height: cardSize.value,
    zIndex: dragZIndex.value,
    elevation: isDragging.value ? 12 : 5,
  }));

  const handleNavigate = () => {
    if(type == "stage-game"){
      navigate('ConnectingLettersStageGame', {stageId:stageId, partIndex:playingPartIndex, wordId:_id});
    } else if(type == "package-game") {
      navigate('ConnectingLettersPackageGame', {stageId:stageId, partIndex:playingPartIndex, wordId:_id});
    } else if(type == "kalam-akhar") {
      navigate('useConnectingLetterStageGameMusic', {stageId:stageId, partIndex:playingPartIndex, wordId:_id});
    }
  };

  const touch = Gesture.Tap()
  .enabled(unknown_word == true && effectiveUnknownCompleted == false)
  .onTouchesDown(() => {
    'worklet';
    runOnJS(tabScreenSoundInOnClick)()
    runOnJS(vibrate)();
    runOnJS(handleNavigate)()
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, touch)}>
      <Animated.View style={[styles.card, cardStyle]}>
        <ImageBackground
          source={require("../../../assets/image/word-card.png")}
          resizeMode="stretch"
          style={{ width: '100%', height: '100%', alignItems:'center', justifyContent:'center' }}
        >
          {
            (unknown_word && !effectiveUnknownCompleted)?
            <View style={{width:CARD_SIZE_FLOATING-20, height:CARD_SIZE_FLOATING-20, borderColor:"#CC000090", backgroundColor:"#CC000020", borderWidth:1.5, borderRadius:CARD_SIZE_FLOATING/2, alignItems:'center', justifyContent:'center'}}>
              <Icon name={"question"} type={"FontAwesome5"} style={{color:"#CC0000", fontSize:CARD_SIZE_FLOATING-35}}/>
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
    </GestureDetector>
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