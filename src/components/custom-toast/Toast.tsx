import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Text, StyleSheet, ImageBackground, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import useAppTheme from '../../hooks/theme/useAppTheme';
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import { vibrate } from '../../utils/vibrationManager';

// --- تایپ‌ها ---
export type ToastType = 'success' | 'error' | 'info';
export type ToastPosition = 'top' | 'bottom';
export type ToastAnimationType = 'slide' | 'fade';

export interface ToastProps {
  defaultPosition?: ToastPosition;
  defaultAnimation?: ToastAnimationType;
  defaultDuration?: number;
  defaultTopOffset?: number;
  defaultBottomOffset?: number;
}

export interface ShowParams {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  animationType?: ToastAnimationType;
  topOffset?: number;
  bottomOffset?: number;
}

interface ConfigState extends ShowParams {
  type: ToastType;
  duration: number;
  position: ToastPosition;
  animationType: ToastAnimationType;
  topOffset: number;
  bottomOffset: number;
}

export interface ToastRefMethod {
  show: (params: ShowParams) => void;
  hide: () => void;
}

// اینترفیس متدهای داخلی کامپوننت سنگین
interface ToastContentRef {
  hideAnimated: () => void;
}

interface ToastContentProps {
  config: ConfigState;
  onDismiss: () => void; // تابعی که به پدر می‌گوید "من بسته شدم، مرا نابود کن"
}

const { width } = Dimensions.get("window");
const FRAME_WIDTH = IS_TABLET_CONDITION ? 460 : width - 40;
const FRAME_HEIGHT = FRAME_WIDTH * 0.4;

/**
 * این کامپوننت سنگین است و شامل تمام هوک‌های انیمیشن و ژست می‌باشد.
 * این کامپوننت فقط زمانی که `visible` در پدر `true` باشد، ساخته می‌شود.
 */
const ToastContent = forwardRef<ToastContentRef, ToastContentProps>(({ config, onDismiss }, ref) => {
  const insets = useSafeAreaInsets();
  
  // مقادیر انیمیشن
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // --- توابع کمکی ---
  const getOffScreenPosition = () => {
    const ESTIMATED_HEIGHT = 150;
    if (config.position === 'top') {
      return -(insets.top + config.topOffset + ESTIMATED_HEIGHT);
    } else {
      return (insets.bottom + config.bottomOffset + ESTIMATED_HEIGHT);
    }
  };

  const startAutoCloseTimer = (duration: number) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      hideInternal();
    }, duration);
    setTimer(newTimer);
  };

  const clearAutoCloseTimer = () => {
    vibrate()
    if (timer) clearTimeout(timer);
    setTimer(null);
  };

  // انیمیشن خروج
  const hideInternal = () => {
    if (config.animationType === 'slide') {
      const exitPos = getOffScreenPosition();
      translateY.value = withTiming(exitPos, { duration: 300, easing: Easing.in(Easing.ease) }, () => {
        runOnJS(onDismiss)(); // پایان کار و حذف کامپوننت
      });
    } else {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onDismiss)();
      });
    }
  };

  // اتصال متد hide به Ref برای اینکه پدر بتواند صدا بزند
  useImperativeHandle(ref, () => ({
    hideAnimated: hideInternal
  }));

  // --- Lifecycle: ورود ---
  useEffect(() => {
    // به محض ماونت شدن (ساخته شدن)، انیمیشن ورود اجرا شود
    if (config.animationType === 'slide') {
      const startPos = getOffScreenPosition();
      translateY.value = startPos;
      opacity.value = 1;
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      translateY.value = 0;
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 400 });
    }

    // شروع تایمر
    startAutoCloseTimer(config.duration);

    // پاکسازی تایمر هنگام حذف
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // فقط یک بار هنگام ساخت اجرا شود

  // --- ژست‌ها ---
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(clearAutoCloseTimer)();
    })
    .onChange((event) => {
      const isTop = config.position === 'top';
      const isMovingTowardsExit = isTop ? event.translationY < 0 : event.translationY > 0;
      
      if (isMovingTowardsExit) {
        translateY.value = event.translationY;
      } else {
        translateY.value = event.translationY * 0.7;
      }
    })
    .onFinalize((event) => {
      const isTop = config.position === 'top';
      const DISMISS_THRESHOLD = 50; 

      let shouldDismiss = false;
      if (isTop) {
        shouldDismiss = event.translationY < -DISMISS_THRESHOLD || event.velocityY < -600;
      } else {
        shouldDismiss = event.translationY > DISMISS_THRESHOLD || event.velocityY > 600;
      }

      if (shouldDismiss) {
        runOnJS(hideInternal)();
      } else {
        translateY.value = withSpring(0, { damping: 12, stiffness: 100, mass: 0.6 });
        runOnJS(startAutoCloseTimer)(config.duration);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const positionStyle = config.position === 'top'
    ? { top: insets.top + config.topOffset }
    : { bottom: insets.bottom + config.bottomOffset };
    
  const ICON_NAME = config.type == "success" ? "sticker-check" : config.type == "error" ? "sticker-alert" : config.type == "info" && "sticker-text";
  const TITLE_COLOR = config.type == "success" ? "#005020" : config.type == "error" ? "#bb0000" : config.type == "info" ? "#0044aa":"#bb0000"
  return (
    <GestureHandlerRootView style={[styles.rootContainer, positionStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.animatedContent, animatedStyle]}>
          <ImageBackground
            source={require("../../assets/image/toast_frame.png")}
            style={styles.backgroundImage}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
          >
            {
                config?.title&&
                <View style={styles.contentRow}>
                    <Icon name={ICON_NAME} type={"MaterialCommunityIcons"} style={[styles.icon, {color:TITLE_COLOR}]} />
                    <Text style={[styles.titleText,{color:TITLE_COLOR}]}>{config.title}</Text>
                </View>
            }
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, {fontSize:config?.title?12:14, textAlign:config?.title?"justify":"center"}]}>{config.message}</Text>
            </View>
          </ImageBackground>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});


const Toast = forwardRef<ToastRefMethod, ToastProps>(({
  defaultPosition = 'top',
  defaultAnimation = 'slide',
  defaultDuration = 4000,
  defaultTopOffset = 40,
  defaultBottomOffset = 40,
}, ref) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ConfigState | null>(null);

  const contentRef = useRef<ToastContentRef>(null);

  const show = useCallback((params: ShowParams) => {
    const newConfig: ConfigState = {
      message: params.message,
      title: params?.title,
      type: params.type ?? 'info',
      duration: params.duration ?? defaultDuration,
      position: params.position ?? defaultPosition,
      animationType: params.animationType ?? defaultAnimation,
      topOffset: params.topOffset ?? defaultTopOffset,
      bottomOffset: params.bottomOffset ?? defaultBottomOffset,
    };
    vibrate()
    setConfig(newConfig);
    setVisible(true); // این دستور باعث می‌شود ToastContent تازه متولد شود (Mount)
  }, [defaultPosition, defaultAnimation, defaultDuration, defaultTopOffset, defaultBottomOffset]);

  const hide = useCallback(() => {
    // به بچه (محتوای سنگین) می‌گوییم انیمیشن خروج را اجرا کن
    contentRef.current?.hideAnimated();
  }, []);

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  // اگر visible نباشد، هیچ چیزی رندر نمی‌شود (حتی هوک‌های Reanimated اجرا نمی‌شوند)
  if (!visible || !config) return null;

  return (
    <ToastContent 
      ref={contentRef} 
      config={config} 
      onDismiss={() => setVisible(false)} 
    />
  );
});

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    zIndex: 9999,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', 
  },
  animatedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: FRAME_WIDTH, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backgroundImage: {
    width: FRAME_WIDTH, 
    height: FRAME_HEIGHT, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 5 
  },
  contentRow: {
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    gap: 5, 
    paddingHorizontal: "10%"
  },
  icon: {
    fontSize: 15, 
  },
  titleText: {
    fontSize: 14, 
    fontFamily: Font.bold
  },
  messageContainer: {
    width: '100%', 
    paddingHorizontal: "11%"
  },
  messageText: {
    color: "#111111", 
    fontFamily: Font.medium, 
  }
});

export default Toast;