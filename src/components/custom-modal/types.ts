import type { ViewStyle, StyleProp } from 'react-native';
import type { ReactNode } from 'react';

export type ModalAnimationInType =
  | 'fadeIn'
  | 'zoomIn'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight';

export type ModalAnimationOutType =
  | 'fadeOut'
  | 'zoomOut'
  | 'slideOutUp'
  | 'slideOutDown'
  | 'slideOutLeft'
  | 'slideOutRight';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface CustomModalProps {
  isVisible: boolean;
  children?: ReactNode;

  animationIn?: ModalAnimationInType;
  animationOut?: ModalAnimationOutType;
  animationInTiming?: number;
  animationOutTiming?: number;

  backdropColor?: string;
  backdropOpacity?: number;
  hasBackdrop?: boolean;

  onBackdropPress?: () => void;
  onBackButtonPress?: () => void;
  onSwipeComplete?: (params: { swipingDirection: SwipeDirection }) => void;
  onModalShow?: () => void;
  onModalHide?: () => void;
  onDismiss?: () => void;

  swipeDirection?: SwipeDirection | SwipeDirection[] | null;
  swipeThreshold?: number;
  propagateSwipe?: boolean;

  deviceWidth?: number;
  deviceHeight?: number;
  statusBarTranslucent?: boolean;
  coverScreen?: boolean;

  style?: StyleProp<ViewStyle>;

  // پراپ‌های قدیمی/میراث react-native-modal که فقط برای جلوگیری از خطای TS
  // پذیرفته می‌شوند ولی عملاً نادیده گرفته می‌شوند (چون انیمیشن همیشه UI-thread است)
  useNativeDriver?: boolean;
  useNativeDriverForBackdrop?: boolean;
  hideModalContentWhileAnimating?: boolean;
  avoidKeyboard?: boolean;
  [key: string]: any;
}