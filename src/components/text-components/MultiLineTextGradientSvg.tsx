import React, { useRef, useState, memo } from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  TSpan,
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
  const baseY = (y || fontSize) + paddingVertical;
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  const stopOffset = (i: number, arrLen: number) => (arrLen > 1 ? `${(i / (arrLen - 1)) * 100}%` : '100%');

  const renderTextLayer = (offsetX: number = 0, offsetY: number = 0, fill: string, filterUrl?: string, svgKey?: string | number) => (
    <SvgText
      key={svgKey}
      fill={fill}
      fontSize={fontSize}
      fontFamily={fontFamily}
      textAnchor={textAnchor}
      filter={filterUrl}
    >
      {lines.map((line, index) => (
        <TSpan
          key={index}
          x={baseX + offsetX}
          dy={index === 0 ? `${baseY + offsetY}px` : `${lines[index - 1].height}px`}
        >
          {line.text}
        </TSpan>
      ))}
    </SvgText>
  );

  return (
    <View style={{ width: totalWidth, height: totalHeight }}>
      <Svg height={totalHeight} width={totalWidth}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
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

        {glowShadow && renderTextLayer(0, 0, glowColor, `url(#${glowFilterId})`, 'glow')}

        {borderWidth > 0 &&
          [-1, 1, 0, 0, -1, 1, -1, 1].map((offset, index) => {
            const offsetX = index % 2 === 0 ? offset * borderWidth : 0;
            const offsetY = index % 2 !== 0 ? offset * borderWidth : 0;
            return renderTextLayer(offsetX, offsetY, borderColor, undefined, index);
          })}

        {renderTextLayer(0, 0, `url(#${gradientId})`, dropShadow ? `url(#${dropFilterId})` : undefined, 'main')}
      </Svg>
    </View>
  );
};

const areEqual = (prevProps: MultiLineTextGradientSvgProps, nextProps: MultiLineTextGradientSvgProps) => {
  if (prevProps.text !== nextProps.text) return false;
  if (prevProps.fontSize !== nextProps.fontSize) return false;
  if (prevProps.fontFamily !== nextProps.fontFamily) return false;
  if (prevProps.colors?.length !== nextProps.colors?.length) return false;
  for (let i = 0; i < (prevProps.colors?.length || 0); i++) {
    if (prevProps.colors?.[i] !== nextProps.colors?.[i]) return false;
  }
  if (prevProps.height !== nextProps.height) return false;
  if (prevProps.x !== nextProps.x) return false;
  if (prevProps.y !== nextProps.y) return false;
  if (prevProps.rtl !== nextProps.rtl) return false;
  if (prevProps.ltr !== nextProps.ltr) return false;
  if (prevProps.paddingHorizontal !== nextProps.paddingHorizontal) return false;
  if (prevProps.paddingVertical !== nextProps.paddingVertical) return false;
  if (prevProps.borderWidth !== nextProps.borderWidth) return false;
  if (prevProps.borderColor !== nextProps.borderColor) return false;
  if (prevProps.dropShadow !== nextProps.dropShadow) return false;
  if (prevProps.shadowColor !== nextProps.shadowColor) return false;
  if (prevProps.shadowDx !== nextProps.shadowDx) return false;
  if (prevProps.shadowDy !== nextProps.shadowDy) return false;
  if (prevProps.shadowBlur !== nextProps.shadowBlur) return false;
  if (prevProps.glowShadow !== nextProps.glowShadow) return false;
  if (prevProps.glowColor !== nextProps.glowColor) return false;
  if (prevProps.glowBlur !== nextProps.glowBlur) return false;
  if (prevProps.width !== nextProps.width) return false;
  return true;
};

export default memo(MultiLineTextGradientSvg, areEqual);