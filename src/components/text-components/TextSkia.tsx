import React, { memo, useEffect, useRef, useState } from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  Mask,
  Rect,
} from 'react-native-svg';
import { View, Text, findNodeHandle, UIManager } from 'react-native';
import Font from '../../utils/Font';
import { prepareRTLText } from '../../utils/prepareRTLText';

interface TextGradientSvgProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  colors?: string[];             // fill gradient
  strokeColors?: string[];       // stroke gradient (optional)
  borderColor?: string;          // fallback solid border color (optional)
  height?: number;
  x?: number;
  y?: number;
  rtl?: boolean;
  ltr?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  borderWidth?: number;          // stroke thickness
}

const TextGradientSvg: React.FC<TextGradientSvgProps> = ({
  text,
  fontSize = 20,
  fontFamily = Font.medium,
  colors = ['#FF512F', '#DD2476'],
  strokeColors,
  borderColor = '#FFFFFF',
  height,
  x = 0,
  y,
  rtl = true,
  ltr = false,
  paddingHorizontal = 5,
  paddingVertical = 1,
  borderWidth = 0,
}) => {
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const hiddenTextRef = useRef<Text | null>(null);

  const renderedText = rtl && !ltr ? prepareRTLText(text) : text;
  const fillGradientId = `grad-fill-${Math.random().toString(36).substring(7)}`;
  const strokeGradientId = `grad-stroke-${Math.random().toString(36).substring(7)}`;
  const maskId = `mask-stroke-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    // Reset width when text changes so we re-measure
    setTextWidth(null);
  }, [renderedText, fontSize, fontFamily]);

  useEffect(() => {
    // Measure the hidden text to get its width
    if (!hiddenTextRef.current) return;
    const handle = findNodeHandle(hiddenTextRef.current);
    if (!handle) return;

    // measure: (x, y, width, height, pageX, pageY)
    UIManager.measure(
      handle,
      (_x: number, _y: number, width: number /*, h, pX, pY */) => {
        setTextWidth(width);
      }
    );
  }, [hiddenTextRef.current, renderedText, fontSize, fontFamily]);

  // While measuring, render an invisible Text to measure
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

  const xPos = rtl && !ltr ? totalWidth - paddingHorizontal : paddingHorizontal;
  const yPos = (y || fontSize) + paddingVertical;
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  // helper for offsets in gradient stops (safe for single-color arrays)
  const stopOffset = (i: number, arrLen: number) =>
    arrLen > 1 ? `${(i / (arrLen - 1)) * 100}%` : '100%';

  return (
    <View style={{ width: totalWidth, height: totalHeight }}>
      <Svg height={totalHeight} width={totalWidth}>
        <Defs>
          {/* fill gradient */}
          <LinearGradient id={fillGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((c, i) => (
              <Stop key={i} offset={stopOffset(i, colors.length)} stopColor={c} stopOpacity="1" />
            ))}
          </LinearGradient>

          {/* stroke gradient (if provided) */}
          {strokeColors && strokeColors.length > 0 && (
            <LinearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {strokeColors.map((c, i) => (
                <Stop key={i} offset={stopOffset(i, strokeColors.length)} stopColor={c} stopOpacity="1" />
              ))}
            </LinearGradient>
          )}

          {/* Mask that paints only the stroke area of the text (white = visible) */}
          {strokeColors && strokeColors.length > 0 && borderWidth > 0 && (
            <Mask
              id={maskId}
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              maskUnits="userSpaceOnUse"
            >
              {/* Important: we render the TEXT with stroke so the mask alpha covers stroke area.
                  Use fill="white" and stroke="white" so stroke area is opaque in mask. */}
              <SvgText
                fill="white"
                stroke="white"
                strokeWidth={borderWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                fontSize={fontSize}
                fontFamily={fontFamily}
                x={xPos}
                y={yPos}
                textAnchor={textAnchor}
              >
                {renderedText}
              </SvgText>
            </Mask>
          )}
        </Defs>

        {/* If stroke gradient is requested: draw a full rect with strokeGradient and mask it */}
        {strokeColors && strokeColors.length > 0 && borderWidth > 0 ? (
          <Rect
            x={0}
            y={0}
            width={totalWidth}
            height={totalHeight}
            fill={`url(#${strokeGradientId})`}
            mask={`url(#${maskId})`}
          />
        ) : (
          // fallback: if no stroke gradient but borderWidth > 0, draw standard stroke (may have letter gaps)
          borderWidth > 0 && (
            <SvgText
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              fontSize={fontSize}
              fontFamily={fontFamily}
              x={xPos}
              y={yPos}
              textAnchor={textAnchor}
            >
              {renderedText}
            </SvgText>
          )
        )}

        {/* Main filled text (on top) with gradient fill */}
        <SvgText
          fill={`url(#${fillGradientId})`}
          fontSize={fontSize}
          fontFamily={fontFamily}
          x={xPos}
          y={yPos}
          textAnchor={textAnchor}
        >
          {renderedText}
        </SvgText>
      </Svg>
    </View>
  );
};

export default memo(TextGradientSvg);
