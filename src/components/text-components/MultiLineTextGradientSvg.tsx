import React, { useRef, useState, memo } from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  FeDropShadow,
  Filter,
} from 'react-native-svg';
import { View, Text } from 'react-native';
import { convertRtl } from 'react-native-rtl-reshaper';
import Font from '../../utils/Font';

interface MultiLineTextGradientSvgProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  colors?: string[];
  height?: number;
  x?: number;
  y?: number;
  rtl?: boolean;
  ltr?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  borderWidth?: number;
  borderColor?: string;
  dropShadow?: boolean;
  shadowColor?: string;
  shadowDx?: number;
  shadowDy?: number;
  shadowBlur?: number;
  glowShadow?: boolean;
  glowColor?: string;
  glowBlur?: number;
  width?: number;
}

const MultiLineTextGradientSvg: React.FC<MultiLineTextGradientSvgProps> = ({
  text,
  fontSize = 20,
  fontFamily = Font.medium,
  colors = ['#4e2fffff', '#9c2f2fff'],
  height,
  x = 0,
  y,
  rtl = true,
  ltr = false,
  paddingHorizontal = 5,
  paddingVertical = 1,
  borderWidth = 0,
  borderColor = '#FFFFFF',
  dropShadow = false,
  shadowColor = '#000000',
  shadowDx = 2,
  shadowDy = 2,
  shadowBlur = 2,
  glowShadow = false,
  glowColor = '#FFFFFF',
  glowBlur = 4,
  width,
}) => {
  const [lines, setLines] = useState<{ text: string; height: number; width: number }[] | null>(null);
  const [textHeight, setTextHeight] = useState<number | null>(null);
  const hiddenTextRef = useRef<Text>(null);

  const renderedText = rtl && !ltr ? convertRtl(text) : text;
  const gradientId = `grad-${Math.random().toString(36).substring(7)}`;
  const dropFilterId = `ds-${Math.random().toString(36).substring(7)}`;
  const glowFilterId = `glow-${Math.random().toString(36).substring(7)}`;

  const textMaxWidth = width ? width - paddingHorizontal * 2 : undefined;

  // محاسبه خطوط متن (Layout Calculation)
  if (lines === null || textHeight === null) {
    return (
      <Text
        ref={hiddenTextRef}
        style={{
          opacity: 0,
          fontSize,
          fontFamily,
          ...(textMaxWidth ? { width: textMaxWidth } : {}),
          textAlign: rtl && !ltr ? 'right' : 'left',
        }}
        numberOfLines={textMaxWidth ? undefined : 1}
        onTextLayout={(e) => {
          const newLines = e.nativeEvent.lines.map((l) => ({ text: l.text, height: l.height, width: l.width }));
          setLines(newLines);
          setTextHeight(newLines.reduce((sum, l) => sum + l.height, 0));
        }}
      >
        {renderedText}
      </Text>
    );
  }

  const maxLineWidth = Math.max(...lines.map((l) => l.width));
  const totalWidth = width || maxLineWidth + paddingHorizontal * 2;
  const totalHeight = (height || textHeight) + paddingVertical * 2;
  const baseX = rtl && !ltr ? totalWidth - paddingHorizontal : paddingHorizontal;
  // شروع Y کمی تغییر کرد تا با SvgText تکی هماهنگ شود
  const baseY = (y || fontSize) + paddingVertical; 
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  const stopOffset = (i: number, arrLen: number) => (arrLen > 1 ? `${(i / (arrLen - 1)) * 100}%` : '100%');

  // تابع رندر کردن لایه‌های متن
  const renderTextLayer = (offsetX: number = 0, offsetY: number = 0, fill: string, filterUrl?: string, svgKey?: string | number) => {
    let currentY = baseY + offsetY;
    
    return lines.map((line, index) => {
      // محاسبه موقعیت Y برای هر خط به صورت جداگانه
      const lineY = currentY;
      // افزایش ارتفاع برای خط بعدی (اگر از TSpan استفاده می‌کردیم dy این کار را می‌کرد، اینجا دستی انجام می‌دهیم)
      if (index < lines.length - 1) {
          currentY += line.height;
      } else {
        // برای خط اول یا حلقه‌های بعدی، باید لاجیک ریست شود اگر خارج از این اسکوپ استفاده شود.
        // اما چون map هر بار اجرا می‌شود، مشکلی نیست. فقط باید دقت کرد خط اول y صحیح داشته باشد.
        // لاجیک بهتر:
      }
      
      // محاسبه دقیق ارتفاع تجمعی برای هر خط
      const accumulatedHeight = lines.slice(0, index).reduce((sum, l) => sum + l.height, 0);
      const positionY = baseY + offsetY + accumulatedHeight;

      return (
        <SvgText
          key={`${svgKey}-${index}`}
          fill={fill}
          fontSize={fontSize}
          fontFamily={fontFamily}
          textAnchor={textAnchor}
          filter={filterUrl}
          x={baseX + offsetX}
          y={positionY}
        >
          {line.text}
        </SvgText>
      );
    });
  };

  return (
    <View style={{ width: totalWidth, height: totalHeight }}>
      <Svg height={totalHeight} width={totalWidth}>
        <Defs>
          {/* تغییر مهم: گرادینت از بالا به پایین (Vertical) */}
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={stopOffset(index, colors.length)}
                stopColor={color}
                stopOpacity="1"
              />
            ))}
          </LinearGradient>

          {dropShadow && (
            <Filter id={dropFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <FeDropShadow
                dx={shadowDx}
                dy={shadowDy}
                stdDeviation={shadowBlur}
                floodColor={shadowColor}
              />
            </Filter>
          )}

          {glowShadow && (
            <Filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation={glowBlur} result="gblur" />
              <FeMerge>
                <FeMergeNode in="gblur" />
              </FeMerge>
            </Filter>
          )}
        </Defs>

        {/* لایه درخشش (Glow) */}
        {glowShadow && renderTextLayer(0, 0, glowColor, `url(#${glowFilterId})`, 'glow')}

        {/* لایه حاشیه (Border/Stroke) */}
        {borderWidth > 0 &&
          [-1, 1, 0, 0, -1, 1, -1, 1].map((offset, index) => {
            const offsetX = index % 2 === 0 ? offset * borderWidth : 0;
            const offsetY = index % 2 !== 0 ? offset * borderWidth : 0;
            return renderTextLayer(offsetX, offsetY, borderColor, undefined, `border-${index}`);
          })}

        {/* لایه اصلی متن با گرادینت */}
        {renderTextLayer(0, 0, `url(#${gradientId})`, dropShadow ? `url(#${dropFilterId})` : undefined, 'main')}
      </Svg>
    </View>
  );
};

export default memo(MultiLineTextGradientSvg);