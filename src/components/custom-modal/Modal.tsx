import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { getEnterFromState, getExitToState, NEUTRAL_STATE } from './animations';
import type { CustomModalProps, SwipeDirection } from './types';

// استفاده از screen به جای window برای سازگاری بهتر با ImmersiveMode
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

function normalizeSwipeDirections(
  swipeDirection?: SwipeDirection | SwipeDirection[] | null
): SwipeDirection[] {
  if (!swipeDirection) return [];
  return Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection];
}

const Modal: React.FC<CustomModalProps> = (props) => {
  const {
    isVisible,
    children,
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    animationInTiming = 300,
    animationOutTiming = 300,
    backdropColor = '#000000',
    backdropOpacity = 0.7,
    hasBackdrop = true,
    onBackdropPress,
    onBackButtonPress,
    onSwipeComplete,
    onModalShow,
    onModalHide,
    onDismiss,
    swipeDirection = null,
    swipeThreshold = 100,
    propagateSwipe = false,
    deviceWidth,
    deviceHeight,
    statusBarTranslucent = true,
    style,
  } = props;

  const width = deviceWidth ?? SCREEN_WIDTH;
  const height = deviceHeight ?? SCREEN_HEIGHT;

  const [mounted, setMounted] = useState(isVisible);

  // وضعیت اولیه را محاسبه می‌کنیم تا از چشمک زدن در رندر اول جلوگیری شود
  const initialEnter = useMemo(() => getEnterFromState(animationIn, width, height), [animationIn, width, height]);
  
  const translateX = useSharedValue(isVisible ? initialEnter.translateX : NEUTRAL_STATE.translateX);
  const translateY = useSharedValue(isVisible ? initialEnter.translateY : NEUTRAL_STATE.translateY);
  const scale = useSharedValue(isVisible ? initialEnter.scale : NEUTRAL_STATE.scale);
  const opacity = useSharedValue(isVisible ? initialEnter.opacity : NEUTRAL_STATE.opacity);
  const backdropProgress = useSharedValue(isVisible ? 0 : 0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  
  // قفل برای جلوگیری از تداخل انیمیشن سوایپ و تغییر استیتِ والد
  const isClosing = useSharedValue(false);

  const allowedDirections = useMemo(
    () => normalizeSwipeDirections(swipeDirection),
    [swipeDirection]
  );

  const canSwipeUp = allowedDirections.includes('up');
  const canSwipeDown = allowedDirections.includes('down');
  const canSwipeLeft = allowedDirections.includes('left');
  const canSwipeRight = allowedDirections.includes('right');
  const swipeEnabled = allowedDirections.length > 0;

  const handleModalShow = useCallback(() => {
    onModalShow?.();
  }, [onModalShow]);

  const handleModalHide = useCallback(() => {
    setMounted(false);
    onModalHide?.();
    onDismiss?.();
  }, [onModalHide, onDismiss]);

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection) => {
      onSwipeComplete?.({ swipingDirection: direction });
    },
    [onSwipeComplete]
  );

  const playEnter = useCallback(() => {
    isClosing.value = false; // ریست کردن قفل
    
    // مقادیر نقطه شروع
    const from = getEnterFromState(animationIn, width, height);
    translateX.value = from.translateX;
    translateY.value = from.translateY;
    scale.value = from.scale;
    opacity.value = from.opacity;

    const timingConfig = {
      duration: animationInTiming,
      easing: Easing.out(Easing.cubic),
    };

    translateX.value = withTiming(NEUTRAL_STATE.translateX, timingConfig);
    translateY.value = withTiming(NEUTRAL_STATE.translateY, timingConfig);
    scale.value = withTiming(NEUTRAL_STATE.scale, timingConfig);
    opacity.value = withTiming(NEUTRAL_STATE.opacity, timingConfig);
    backdropProgress.value = withTiming(1, timingConfig, (finished) => {
      if (finished) runOnJS(handleModalShow)();
    });
  }, [animationIn, animationInTiming, width, height, handleModalShow, translateX, translateY, scale, opacity, backdropProgress, isClosing]);

  const playExit = useCallback(() => {
    // اگر مودال قبلاً توسط سوایپ در حال بسته شدن است، انیمیشن جدید اجرا نشود!
    if (isClosing.value) return; 
    isClosing.value = true;

    const to = getExitToState(animationOut, width, height);
    const timingConfig = {
      duration: animationOutTiming,
      easing: Easing.in(Easing.cubic),
    };

    translateX.value = withTiming(to.translateX, timingConfig);
    translateY.value = withTiming(to.translateY, timingConfig);
    scale.value = withTiming(to.scale, timingConfig);
    opacity.value = withTiming(to.opacity, timingConfig);
    backdropProgress.value = withTiming(0, timingConfig, (finished) => {
      if (finished) runOnJS(handleModalHide)();
    });
  }, [animationOut, animationOutTiming, width, height, handleModalHide, translateX, translateY, scale, opacity, backdropProgress, isClosing]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isVisible) setMounted(true);
  }, [isVisible]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // در اولین رندر اگر مودال باز بود، انیمیشن ورود را می‌زنیم
      if (isVisible) playEnter();
      return;
    }

    if (!mounted) return;
    
    if (isVisible) {
      playEnter();
    } else {
      playExit();
    }
  }, [isVisible, mounted, playEnter, playExit]);

  const requestClose = useCallback(() => {
    onBackButtonPress?.();
  }, [onBackButtonPress]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value * backdropOpacity,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const panGesture = useMemo(() => {
    const offset: [number, number] = propagateSwipe ? [-15, 15] : [-5, 5];

    return Gesture.Pan()
      .enabled(swipeEnabled)
      .activeOffsetY(offset)
      .activeOffsetX(offset)
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate((e) => {
        if (canSwipeDown && e.translationY > 0) {
          translateY.value = startY.value + e.translationY;
        } else if (canSwipeUp && e.translationY < 0) {
          translateY.value = startY.value + e.translationY;
        }
        if (canSwipeRight && e.translationX > 0) {
          translateX.value = startX.value + e.translationX;
        } else if (canSwipeLeft && e.translationX < 0) {
          translateX.value = startX.value + e.translationX;
        }
      })
      .onEnd(() => {
        let direction: SwipeDirection | null = null;
        let shouldClose = false;

        if (canSwipeDown && translateY.value > swipeThreshold) {
          direction = 'down';
          shouldClose = true;
        } else if (canSwipeUp && translateY.value < -swipeThreshold) {
          direction = 'up';
          shouldClose = true;
        } else if (canSwipeRight && translateX.value > swipeThreshold) {
          direction = 'right';
          shouldClose = true;
        } else if (canSwipeLeft && translateX.value < -swipeThreshold) {
          direction = 'left';
          shouldClose = true;
        }

        if (shouldClose && direction) {
          isClosing.value = true; // فعال کردن قفل برای جلوگیری از اجرای playExit
          
          runOnJS(handleSwipeComplete)(direction); // خبر دادن به والد

          const timingConfig = {
            duration: animationOutTiming,
            easing: Easing.in(Easing.cubic),
          };
          
          const exitX = direction === 'left' ? -width : direction === 'right' ? width : translateX.value;
          const exitY = direction === 'up' ? -height : direction === 'down' ? height : translateY.value;

          translateX.value = withTiming(exitX, timingConfig);
          translateY.value = withTiming(exitY, timingConfig);
          backdropProgress.value = withTiming(0, timingConfig, (finished) => {
            if (finished) runOnJS(handleModalHide)();
          });
        } else {
          translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
          translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
        }
      });
  }, [
    swipeEnabled, propagateSwipe, canSwipeDown, canSwipeUp, canSwipeLeft, canSwipeRight, 
    swipeThreshold, animationOutTiming, width, height, handleSwipeComplete, handleModalHide, 
    translateX, translateY, startX, startY, backdropProgress, isClosing
  ]);

  const handleBackdropPress = useCallback(() => {
    onBackdropPress?.();
  }, [onBackdropPress]);

  const modifiedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<{ pointerEvents?: string }>;
      return React.cloneElement(childElement, {
        pointerEvents: childElement.props.pointerEvents || 'box-none',
      });
    }
    return child;
  });

  if (!mounted) return null;

  return (
    <RNModal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={requestClose}
      hardwareAccelerated
    >
      <GestureHandlerRootView style={styles.flexFill}>
        <View style={styles.flexFill}>
          {hasBackdrop && (
            <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: backdropColor },
                  backdropAnimatedStyle,
                ]}
              />
            </Pressable>
          )}
          <View 
            style={[
              styles.contentContainer, 
              { justifyContent: 'center', alignItems: 'center' },
              style
            ]} 
            pointerEvents="box-none"
          >
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  contentAnimatedStyle,
                ]}
                pointerEvents="box-none"
              >
                {modifiedChildren}
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
      </GestureHandlerRootView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  contentContainer: {
    flex: 1,
    margin: 0,
  },
});

export default Modal;