import React from 'react';
import { Canvas, Text, useFont, Skia, Paint, vec, Group } from '@shopify/react-native-skia';
import { StyleProp, ViewStyle } from 'react-native';
import { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Font from '../../utils/Font';

// Define available fonts
const FONTS = {
  [Font.bakh_extra_black]: require('../../assets/fonts/YekanBakhFaNum-ExtraBlack.ttf'),
  [Font.bakh_black]: require('../../assets/fonts/YekanBakhFaNum-Black.ttf'),
} as const;

interface TextSkiaAnimatedProps {
  text: string;
  x: number | SharedValue<number>;
  y: number | SharedValue<number>;
  fontSize?: number | SharedValue<number>;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  fontFamily?: keyof typeof FONTS;
  style?: StyleProp<ViewStyle>;
}

const TextSkiaAnimated: React.FC<TextSkiaAnimatedProps> = ({
  text,
  x,
  y,
  fontSize = 32,
  gradientColors = ['#FFD700', '#FF4500'],
  borderColor = 'black',
  borderWidth = 2,
  shadowOffsetX = 4,
  shadowOffsetY = 4,
  shadowColor = 'rgba(0, 0, 0, 0.5)',
  fontFamily = Font.bakh_extra_black,
  style,
}) => {
  // Use a fixed font size for useFont to avoid dynamic hook issues
  const baseFontSize = 32;
  const font = useFont(FONTS[fontFamily] || FONTS[Font.bakh_extra_black], baseFontSize);

  if (!font) {
    return null; // Wait for font to load
  }

  // Paint for shadow layer
  const shadowPaint = Skia.Paint();
  shadowPaint.setColor(Skia.Color(shadowColor));
  shadowPaint.setAntiAlias(true);

  // Paint for border (Stroke)
  const strokePaint = Skia.Paint();
  strokePaint.setColor(Skia.Color(borderColor));
  strokePaint.setStyle(1); // 1 = Stroke
  strokePaint.setStrokeWidth(borderWidth);
  strokePaint.setAntiAlias(true);

  // Animated props for each Text layer
  const shadowAnimatedProps = useAnimatedProps(() => {
    const xValue = typeof x === 'number' ? x : x.value;
    const yValue = typeof y === 'number' ? y : y.value;
    const fontSizeVal = typeof fontSize === 'number' ? fontSize : fontSize.value || baseFontSize;
    const scale = fontSizeVal / baseFontSize;
    return {
      x: xValue + shadowOffsetX * scale,
      y: yValue + shadowOffsetY * scale,
    };
  });

  const textAnimatedProps = useAnimatedProps(() => {
    const xValue = typeof x === 'number' ? x : x.value;
    const yValue = typeof y === 'number' ? y : y.value;
    const fontSizeVal = typeof fontSize === 'number' ? fontSize : fontSize.value || baseFontSize;
    const scale = fontSizeVal / baseFontSize;
    return {
      x: xValue,
      y: yValue,
    };
  });

  // Animated transform for scaling
  const groupAnimatedProps = useAnimatedProps(() => {
    const fontSizeVal = typeof fontSize === 'number' ? fontSize : fontSize.value || baseFontSize;
    const scale = fontSizeVal / baseFontSize;
    return {
      transform: [{ scale }],
    };
  });

  // Paint for main text with gradient (using animated values)
  const fillPaintAnimatedProps = useAnimatedProps(() => {
    const xValue = typeof x === 'number' ? x : x.value;
    const yValue = typeof y === 'number' ? y : y.value;
    const fontSizeVal = typeof fontSize === 'number' ? fontSize : fontSize.value || baseFontSize;
    const scale = fontSizeVal / baseFontSize;
    const fillPaint = Skia.Paint();
    fillPaint.setShader(
      Skia.Shader.MakeLinearGradient(
        vec(xValue, yValue - (fontSizeVal / 2) * scale), // Start point
        vec(xValue + 100 * scale, yValue + (fontSizeVal / 2) * scale), // End point
        gradientColors.map(color => Skia.Color(color)), // Colors
        null, // Positions
        0 // TileMode.Clamp
      )
    );
    fillPaint.setStyle(0); // 0 = Fill
    fillPaint.setAntiAlias(true);
    return { paint: fillPaint };
  });

  return (
    <Canvas style={[{ flex: 1 }, style]}>
      <Group {...groupAnimatedProps}>
        {/* Shadow layer */}
        <Text
          text={text}
          font={font}
          paint={shadowPaint}
          {...shadowAnimatedProps}
        />
        {/* Border text */}
        <Text
          text={text}
          font={font}
          paint={strokePaint}
          {...textAnimatedProps}
        />
        {/* Main text with gradient */}
        <Text
          text={text}
          font={font}
          {...textAnimatedProps}
          {...fillPaintAnimatedProps}
        />
      </Group>
    </Canvas>
  );
};

export default TextSkiaAnimated;