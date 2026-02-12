import React, { useEffect, useRef, useState, memo } from 'react';
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
import { View, Text, findNodeHandle, UIManager } from 'react-native';
import { convertRtl } from 'react-native-rtl-reshaper';
import Font from '../../utils/Font';

interface TextGradientSvgProps {
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
}

const TextGradientSvg: React.FC<TextGradientSvgProps> = ({
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
}) => {
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const hiddenTextRef = useRef<any>(null);

  const renderedText = rtl && !ltr ? convertRtl(text) : text;
  const gradientId = `grad-${Math.random().toString(36).substring(7)}`;
  const dropFilterId = `ds-${Math.random().toString(36).substring(7)}`;
  const glowFilterId = `glow-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    setTextWidth(null);
  }, [renderedText, fontSize, fontFamily]);

  useEffect(() => {
    if (!hiddenTextRef.current) return;
    const handle = findNodeHandle(hiddenTextRef.current);
    if (!handle) return;

    UIManager.measure(handle, (_x: number, _y: number, width: number, _height: number, _pX: number, _pY: number) => {
      setTextWidth(width);
    });
  }, [hiddenTextRef.current, renderedText, fontSize, fontFamily]);

  if (textWidth === null) {
    return (
      <Text
        style={{
          position: 'absolute',
          opacity: 0,
          fontSize,
          fontFamily,
        }}
        ref={hiddenTextRef}
      >
        {renderedText}
      </Text>
    );
  }

  const totalWidth = textWidth + paddingHorizontal * 2;
  // ارتفاع کل ویو محاسبه می‌شود
  const totalHeight = (height || fontSize * 1.5) + paddingVertical * 2;
  const textX = rtl && !ltr ? totalWidth - paddingHorizontal : paddingHorizontal;
  const textY = (y || fontSize) + paddingVertical;
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  const stopOffset = (i: number, arrLen: number) =>
    arrLen > 1 ? `${(i / (arrLen - 1)) * 100}%` : '100%';

  return (
    <View style={{ width: totalWidth, height: totalHeight }}>
      <Svg height={totalHeight} width={totalWidth}>
        <Defs>
          {/* اصلاح مهم:
            1. gradientUnits="userSpaceOnUse" اضافه شد تا مختصات بر اساس کل بوم SVG باشد نه فقط متن.
            2. y2={totalHeight} قرار گرفت تا گرادینت از بالای کادر تا پایین کادر کشیده شود.
          */}
          <LinearGradient 
            id={gradientId} 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={totalHeight} 
            gradientUnits="userSpaceOnUse"
          >
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

        {glowShadow && (
          <SvgText
            fill={glowColor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            x={textX}
            y={textY}
            textAnchor={textAnchor}
            filter={`url(#${glowFilterId})`}
          >
            {renderedText}
          </SvgText>
        )}

        {borderWidth > 0 &&
          [-1, 1, 0, 0, -1, 1, -1, 1].map((offset, index) => (
            <SvgText
              key={index}
              fill={borderColor}
              fontSize={fontSize}
              fontFamily={fontFamily}
              x={textX + (index % 2 === 0 ? offset * borderWidth : 0)}
              y={textY + (index % 2 !== 0 ? offset * borderWidth : 0)}
              textAnchor={textAnchor}
            >
              {renderedText}
            </SvgText>
          ))}

        <SvgText
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontFamily={fontFamily}
          x={textX}
          y={textY}
          textAnchor={textAnchor}
          filter={dropShadow ? `url(#${dropFilterId})` : undefined}
        >
          {renderedText}
        </SvgText>
      </Svg>
    </View>
  );
};

export default memo(TextGradientSvg);