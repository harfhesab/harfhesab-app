import type { ModalAnimationInType, ModalAnimationOutType } from './types';

export type TransformState = {
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
};

export const NEUTRAL_STATE: TransformState = {
  translateX: 0,
  translateY: 0,
  scale: 1,
  opacity: 1,
};

/**
 * وضعیت شروع انیمیشن ورود (progress = 0)
 * مثلاً برای slideInUp، مودال از پایین صفحه (translateY = height) شروع می‌کند
 * و به سمت وضعیت خنثی (0) حرکت می‌کند.
 */
export function getEnterFromState(
  type: ModalAnimationInType | undefined,
  width: number,
  height: number
): TransformState {
  switch (type) {
    case 'fadeIn':
      return { ...NEUTRAL_STATE, opacity: 0 };
    case 'zoomIn':
      return { ...NEUTRAL_STATE, opacity: 0, scale: 0.85 };
    case 'slideInUp':
      return { ...NEUTRAL_STATE, translateY: height };
    case 'slideInDown':
      return { ...NEUTRAL_STATE, translateY: -height };
    case 'slideInLeft':
      return { ...NEUTRAL_STATE, translateX: -width };
    case 'slideInRight':
      return { ...NEUTRAL_STATE, translateX: width };
    default:
      return { ...NEUTRAL_STATE, opacity: 0 };
  }
}

/**
 * وضعیت پایان انیمیشن خروج (progress = 1)
 * مستقل از جهت animationIn تعریف می‌شود چون در react-native-modal این دو
 * می‌توانند نامتقارن باشند (مثلاً slideInDown + slideOutDown همزمان).
 */
export function getExitToState(
  type: ModalAnimationOutType | undefined,
  width: number,
  height: number
): TransformState {
  switch (type) {
    case 'fadeOut':
      return { ...NEUTRAL_STATE, opacity: 0 };
    case 'zoomOut':
      return { ...NEUTRAL_STATE, opacity: 0, scale: 0.85 };
    case 'slideOutUp':
      return { ...NEUTRAL_STATE, translateY: -height };
    case 'slideOutDown':
      return { ...NEUTRAL_STATE, translateY: height };
    case 'slideOutLeft':
      return { ...NEUTRAL_STATE, translateX: -width };
    case 'slideOutRight':
      return { ...NEUTRAL_STATE, translateX: width };
    default:
      return { ...NEUTRAL_STATE, opacity: 0 };
  }
}