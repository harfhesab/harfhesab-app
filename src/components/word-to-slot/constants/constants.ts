import { Dimensions } from "react-native";

const {width, height} = Dimensions.get("screen");

export const SLOT_GAP = 6; // فاصله اسلات ها از هم
export const SLOT_HORIZONTAL = 15; // فاصله اسلات از کنار صفحه
export const SLOT_NUMBER_IN_ROW = 7; // تعداد اسلات در یک ردیف
const PRECAUTION = 10 // برای احتیاط در محاسبه ی اندازه اسلات
const SLUT_SIZE_CALCULATION = (width - ((SLOT_HORIZONTAL*2)+((SLOT_NUMBER_IN_ROW-1)*SLOT_GAP)+PRECAUTION)) / SLOT_NUMBER_IN_ROW;
export const SLOT_SIZE = SLUT_SIZE_CALCULATION > 60?60:SLUT_SIZE_CALCULATION;
export const SLOT_SENSITIVITY_SIZE = 100;
export const SLOT_BORDER_RADIUS = 8;
export const SLOT_TEXT_FONT_SIZE = SLOT_SIZE/2.2;
export const SLOT_BOTTOM_OFFSET = 50;

export const DISTANCE_BOUNDARY_AND_SLOT = 20; // فاصله محدوده از اسلات ها

export const BOUNDARY_HORIZONTAL_OFFSET = 15; // فاصله محدوده از چپ و راست
export const BOUNDARY_BOTTOM_OFFSET = 15; // فاصله محدوده از پایین

export const BOUNDARY_WIDTH = width - (BOUNDARY_HORIZONTAL_OFFSET*2);
export const BOUNDARY_HEIGHT = height * 0.45;
export const BOUNDARY_BORDER_RADIUS = 10;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = height - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;



const CARD_SIZE_FLOATING_CALCULATION = (width - (BOUNDARY_HORIZONTAL_OFFSET*2)) / 5;
export const CARD_SIZE_FLOATING = CARD_SIZE_FLOATING_CALCULATION > 80?80:CARD_SIZE_FLOATING_CALCULATION; // سایز کارت در حالت شناور
export const CARD_SIZE_DRAGGING = CARD_SIZE_FLOATING + 20; // سایز کارت در حالت درگ
export const CARD_SIZE_SLOTTED = SLOT_SIZE - 8; // سایز کارت در حالت اسلات
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING/3.9; // فونت سایز در حالت شناور
export const FONT_SIZE_DRAGGING = CARD_SIZE_DRAGGING/3.9; // فونت سایز در حالت درگ
export const FONT_SIZE_SLOTTED = CARD_SIZE_SLOTTED/3.9; // فونت سایز در حالت اسلات
export const MAX_VELOCITY = 200;
export const MIN_VELOCITY = 50;
export const CARD_BORDER_RADIUS = 15;