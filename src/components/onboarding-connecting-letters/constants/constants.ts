import { Dimensions } from 'react-native';

const {width, height} = Dimensions.get("window");

export const BOUNDARY_HORIZONTAL_OFFSET = 50;
export const BOUNDARY_BOTTOM_OFFSET = 20;
export const BOUNDARY_WIDTH = (height - 120)*0.7-150;
export const BOUNDARY_HEIGHT = (height - 120)*0.7-160;
export const BOUNDARY_BORDER_RADIUS = 10;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = height - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;

const CARD_SIZE_FLOATING_CALCULATION = (width - (BOUNDARY_HORIZONTAL_OFFSET * 2)) / 5.3;
export const CARD_SIZE_FLOATING = CARD_SIZE_FLOATING_CALCULATION > 55 ? 55 : CARD_SIZE_FLOATING_CALCULATION;
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING / 1.55;
export const CARD_BORDER_RADIUS = 15;
export const MAX_VELOCITY = 140;
export const MIN_VELOCITY = 60;

export const CARD_SELECTION_DURATION = 2500;
export const FONT_SIZE_SELECTED = FONT_SIZE_FLOATING / 4;
export const CARD_ZINDEX_NORMAL = 100;