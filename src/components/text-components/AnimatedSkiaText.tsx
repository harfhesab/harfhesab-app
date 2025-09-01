import React, {memo} from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Text, useFont, Group, Skia, vec, TileMode, PaintStyle } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { prepareRTLText } from '../../utils/prepareRTLText';

interface AnimatedSkiaTextProps {
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

const AnimatedSkiaText: React.FC<AnimatedSkiaTextProps> = ({ 
  text,
  fontSize,
  initialFontSize,
  initialWidth,
  initialHeight,
  rtl = true,
  ltr = false,
  gradientColors = ['#9900ef',  '#662d86', '#3a194d'],
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

  const font = useFont(require('../../assets/fonts/YekanBakhFaNum-Black.ttf'), initialFontSize); // مسیر فونت را جایگزین کنید
  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  if (font === null) {
    return null;
  }
  
  const isRtl = rtl === true && ltr === false;
  const metrics = font.getMetrics();
  const ascent = metrics.ascent;
  const descent = metrics.descent;
  const leading = metrics.leading;
  const lineHeight = -ascent + descent + leading;

  // Function to wrap text into lines
  const wrapText = (text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLineWords: string[] = [];

    for (const word of words) {
      const testLineWords = [...currentLineWords, word];
      const testLine = testLineWords.join(' ');
      const testRendered = isRtl ? prepareRTLText(testLine) : testLine;
      const testWidth = font.measureText(testRendered).width;
      if (testWidth <= maxWidth) {
        currentLineWords = testLineWords;
      } else {
        if (currentLineWords.length > 0) {
          const currentLine = currentLineWords.join(' ');
          lines.push(currentLine);
        }
        currentLineWords = [word];
      }
    }
    if (currentLineWords.length > 0) {
      const currentLine = currentLineWords.join(' ');
      lines.push(currentLine);
    }
    return lines;
  };

  const maxTextWidth = initialWidth * 0.95; // Slightly less to avoid overflow
  const lines = wrapText(text, maxTextWidth);
  const renderedLines = lines.map(line => isRtl ? prepareRTLText(line) : line);
  const lineWidths = renderedLines.map(line => font.measureText(line).width);

  const totalHeight = (lines.length - 1) * lineHeight + (-ascent + descent);
  const top = (initialHeight - totalHeight) / 2;
  const firstBaseline = top - ascent;

  const strokePaint = Skia.Paint();
  strokePaint.setColor(Skia.Color(borderColor));
  strokePaint.setStyle(PaintStyle.Stroke);
  strokePaint.setStrokeWidth(borderWidth);

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        {lines.map((logicalLine, index) => {
          const line = renderedLines[index];
          const y = firstBaseline + index * lineHeight;
          const x = (initialWidth - lineWidths[index]) / 2;
          return (
            <React.Fragment key={index}>
              {/* بوردر */}
              <Text
                x={x}
                y={y}
                text={line}
                font={font}
                paint={strokePaint}
              />
              <Text
                x={x}
                y={y}
                text={line}
                font={font}
                paint={gradientPaint}
              />
            </React.Fragment>
          );
        })}
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

export default memo(AnimatedSkiaText);