import React from 'react';
import {
  Canvas,
  Text,
  useFont,
  Skia,
  Paint,
  vec,
  Shadow,
  Group,
  TileMode,
  PaintStyle,
} from '@shopify/react-native-skia';
import { View, StyleSheet } from 'react-native';
import Font from '../../utils/Font';
import { prepareRTLText } from '../../utils/prepareRTLText';


interface TextSkiaProps {
  text: string;
  fontSize?: number;
  width?: number;
  height?: number;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  fontFamily?: keyof typeof FONTS;
}

// Define available fonts
const FONTS = {
  [Font.bakh_extra_black]: require('../../assets/fonts/YekanBakhFaNum-ExtraBlack.ttf'),
  [Font.bakh_black]: require('../../assets/fonts/YekanBakhFaNum-Black.ttf'),
} as const;

export const TextSkia: React.FC<TextSkiaProps> = ({
  text,
  fontSize = 48,
  width = 300,
  height = 120,
  gradientColors = ['#ff8a00', '#e52e71'],
  borderColor = '#ffffff',
  borderWidth = 2,
  shadowColor = '#000000',
  shadowOffsetX = 4,
  shadowOffsetY = 4,
  shadowBlur = 4,
  fontFamily = Font.bakh_extra_black,
}) => {
  const font = useFont(FONTS[fontFamily] || FONTS[Font.bakh_extra_black], fontSize);
  if (!font) return null;

  const renderedText = prepareRTLText(text);

  const textWidth = font.measureText(renderedText).width;
  const x = (width - textWidth) / 2;
  const y = height / 2 + fontSize / 3;

  // گرادینت
  const gradient = Skia.Shader.MakeLinearGradient(
    vec(0, 0),
    vec(width, 0),
    gradientColors.map((c) => Skia.Color(c)),
    null,
    TileMode.Clamp
  );

  const gradientPaint = Skia.Paint();
  gradientPaint.setShader(gradient);

  const strokePaint = Skia.Paint();
  strokePaint.setColor(Skia.Color(borderColor));
  strokePaint.setStyle(PaintStyle.Stroke);
  strokePaint.setStrokeWidth(borderWidth);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {/* سایه */}
          <Shadow
            dx={shadowOffsetX}
            dy={shadowOffsetY}
            blur={shadowBlur}
            color={shadowColor}
          />

          {/* بوردر */}
          <Text
            x={x}
            y={y}
            text={renderedText}
            font={font}
            paint={strokePaint}
          />

          {/* متن رنگی با گرادینت */}
          <Text
            x={x}
            y={y}
            text={renderedText}
            font={font}
            paint={gradientPaint}
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default TextSkia;
