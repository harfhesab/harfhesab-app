import React, {memo} from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Text, useFont, Group, Skia, vec, TileMode, PaintStyle, Shadow } from '@shopify/react-native-skia';
import Animated, { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { prepareRTLText } from '../../utils/prepareRTLText';

interface SkiaLetterProps {
  text: string;
  fontSize: SharedValue<number>;
  initialFontSize: number;
  initialWidth: number;
  initialHeight: number;
  rtl?: boolean;
  ltr?: boolean;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
}

const SkiaLetter: React.FC<SkiaLetterProps> = ({ 
  text,
  fontSize,
  initialFontSize,
  initialWidth,
  initialHeight,
  rtl = true,
  ltr = false,
  gradientColors = ['#512da8',  '#7b1fa2'],
  borderColor = '#FFFFFF',
  borderWidth = 2,
 }) => {

  const gradient = Skia.Shader.MakeLinearGradient(
    vec(0, 0),
    vec(initialWidth, 0),
    gradientColors.map((c) => Skia.Color(c)),
    null,
    TileMode.Clamp
  );
  const gradientPaint = Skia.Paint();
  gradientPaint.setShader(gradient);

  const font = useFont(require('../../assets/fonts/YekanBakhFaNum-ExtraBlack.ttf'), initialFontSize); // مسیر فونت را جایگزین کنید
  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  if (font === null) {
    return null;
  }
  
  const renderedText = (rtl == true && ltr == false)?prepareRTLText(text):text;
  const textWidth = font.measureText(renderedText).width;
  const metrics = font.getMetrics();
  const x = ((initialWidth) - textWidth) / 2;
  const y = initialHeight / 1.25 + (metrics.ascent + metrics.descent) / 2;

  if (font === null) {
    return null;
  }

  const strokePaint = Skia.Paint();
  strokePaint.setColor(Skia.Color(borderColor));
  strokePaint.setStyle(PaintStyle.Stroke);
  strokePaint.setStrokeWidth(borderWidth);

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        {/* بوردر */}
        <Text
          x={x}
          y={y}
          text={renderedText}
          font={font}
          paint={strokePaint}
        />
        <Text
          text={renderedText}
          font={font}
          x={x}
          y={y} // تنظیم موقعیت عمودی
          paint={gradientPaint}
        />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default memo(SkiaLetter);