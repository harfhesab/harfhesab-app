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
    // reset width when relevant props change so measure runs again
    setTextWidth(null);
  }, [renderedText, fontSize, fontFamily]);

  useEffect(() => {
    if (!hiddenTextRef.current) return;
    const handle = findNodeHandle(hiddenTextRef.current);
    if (!handle) return;

    // UIManager.measure signature: (node, callback(x, y, width, height, pageX, pageY))
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
  const totalHeight = (height || fontSize * 1.5) + paddingVertical * 2;
  const textX = rtl && !ltr ? totalWidth - paddingHorizontal : paddingHorizontal;
  const textY = (y || fontSize) + paddingVertical;
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  // helper to compute gradient stop offset
  const stopOffset = (i: number, arrLen: number) =>
    arrLen > 1 ? `${(i / (arrLen - 1)) * 100}%` : '100%';

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

          {/* Drop shadow filter (only created if dropShadow true) */}
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

          {/* Glow filter (only created if glowShadow true) */}
          {glowShadow && (
            <Filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              {/* Blur the SourceGraphic (the duplicate colored text) */}
              <FeGaussianBlur in="SourceGraphic" stdDeviation={glowBlur} result="gblur" />
              {/* merge blurred graphic (so filter returns the blur result) */}
              <FeMerge>
                <FeMergeNode in="gblur" />
              </FeMerge>
            </Filter>
          )}
        </Defs>

        {/* ---------- GLOW LAYER: a colored copy of the text, blurred ---------- */}
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

        {/* 👇 لایه زیرین: بوردر (همان کد تو — بدون تغییر) */}
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

        {/* 👇 لایه رویی: متن اصلی با گرادینت
               اگر dropShadow فعال باشه، به این عنصر filter مربوطه اعمال می‌شود */}
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
const areEqual = (prevProps:any, nextProps:any) => {
  if (prevProps.text !== nextProps.text) return false;
  if (prevProps.fontSize !== nextProps.fontSize) return false;
  if (prevProps.fontFamily !== nextProps.fontFamily) return false;
  return true;
};
export default memo(TextGradientSvg, areEqual);
