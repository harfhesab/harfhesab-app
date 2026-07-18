import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { 
  Canvas, 
  Text, 
  Group, 
  Skia, 
  vec, 
  TileMode, 
  PaintStyle 
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { prepareRTLText } from '../../utils/prepareRTLText';
import { useGlobalFonts } from '../../context/SkiaFontProvider';

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
  fontName?: string;
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
  fontName = 'YekanBakh-ExtraBlack',
 }) => {

  // 🌟 دریافت مدیر فونت از کانتکست گلوبال
  const { customFontMgr } = useGlobalFonts();

  // 🌟 ساخت داینامیک فونت با استفاده از Typeface
  const font = useMemo(() => {
    if (!customFontMgr) return null;

    const typeface = customFontMgr.matchFamilyStyle(fontName, { weight: 400, width: 5, slant: 0 });
    
    if (!typeface) {
      console.warn(`Font family "${fontName}" not found in customFontMgr.`);
      return null;
    }
    
    return Skia.Font(typeface, initialFontSize);
  }, [customFontMgr, fontName, initialFontSize]);

  const gradient = Skia.Shader.MakeLinearGradient(
    vec(0, 0),
    vec(initialWidth, 0),
    gradientColors.map((c) => Skia.Color(c)),
    null,
    TileMode.Clamp
  );
  const gradientPaint = Skia.Paint();
  gradientPaint.setShader(gradient);

  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  if (font === null) {
    return null;
  }
  
  const renderedText = (rtl === true && ltr === false) ? prepareRTLText(text) : text;
  const textWidth = font.measureText(renderedText).width;
  const metrics = font.getMetrics();
  const x = ((initialWidth) - textWidth) / 2;
  const y = initialHeight / 1.25 + (metrics.ascent + metrics.descent) / 2;

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
        {/* متن اصلی با گرادیانت */}
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