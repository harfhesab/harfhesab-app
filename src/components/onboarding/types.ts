import React from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface SlideItem {
  id: string;
  title: string;
  description: string;
  lottieSource?: any;
  imageSource?: any;
  imageStyle?: StyleProp<ImageStyle>;
  backgroundColor?: string;
  CustomComponent?: React.ComponentType<any>;
}

export interface OnboardingProps {
  data: SlideItem[];
  onFinish: () => void;
  isRTL?: boolean; // اضافه شدن پشتیبانی از دایرکشن
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  nextButtonColor?: string;
  doneButtonColor?: string;
}