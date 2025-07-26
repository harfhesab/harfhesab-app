import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BOUNDARY_HORIZONTAL_OFFSET = 15;
export const BOUNDARY_BOTTOM_OFFSET = 15;
export const BOUNDARY_WIDTH = width - (BOUNDARY_HORIZONTAL_OFFSET * 2);
export const BOUNDARY_HEIGHT = height * 0.4;
export const BOUNDARY_BORDER_RADIUS = 10;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = height - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;

const CARD_SIZE_FLOATING_CALCULATION = (width - (BOUNDARY_HORIZONTAL_OFFSET * 2)) / 8;
export const CARD_SIZE_FLOATING = CARD_SIZE_FLOATING_CALCULATION > 80 ? 80 : CARD_SIZE_FLOATING_CALCULATION;
export const CARD_SIZE_DRAGGING = CARD_SIZE_FLOATING + 30;
export const CARD_SIZE_ATTACHED = CARD_SIZE_FLOATING + 30;
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING / 2.1;
export const FONT_SIZE_DRAGGING = CARD_SIZE_DRAGGING / 2.1;
export const FONT_SIZE_ATTACHED = CARD_SIZE_ATTACHED / 2.1;
export const MAX_VELOCITY = 200;
export const MIN_VELOCITY = 50;
export const CARD_BORDER_RADIUS = 10;
export const MAGNET_OVERLAP_THRESHOLD = 0.7; // حداقل 70% همپوشانی
export const ATTACH_OFFSET_X = 3; // اختلاف 3 پیکسل در محور x
export const ATTACH_OFFSET_Y = 3; // اختلاف 3 پیکسل در محور y
export const SPRING_CONFIG_MAGNET = { stiffness: 150, damping: 15, mass: 1.2, overshootClamping: false };