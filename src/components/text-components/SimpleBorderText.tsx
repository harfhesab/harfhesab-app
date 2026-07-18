import React, { memo, useMemo } from 'react';
import { Canvas, Text, Group, Skia, PaintStyle } from '@shopify/react-native-skia';
import { prepareRTLText } from '../../utils/prepareRTLText';
import { useGlobalFonts } from '../../context/SkiaFontProvider';

interface SimpleBorderTextProps {
  text: string;
  fontSize: number;
  width: number;
  height: number;
  rtl?: boolean;
  ltr?: boolean;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontName?: string;
}

const SimpleBorderText: React.FC<SimpleBorderTextProps> = ({ 
  text,
  fontSize,
  width,
  height,
  rtl = true,
  ltr = false,
  textColor = '#9900ef',
  borderColor = '#FFFFFF',
  borderWidth = 1.5,
  fontName = 'YekanBakh-ExtraBold',
 }) => {

  // 🌟 دریافت مدیر فونت از کانتکست
  const { customFontMgr } = useGlobalFonts();

  // 🌟 ساخت داینامیکِ شیء Font برای استفاده در کامپوننت Text
  const font = useMemo(() => {
    if (!customFontMgr) return null;

    // پیدا کردن Typeface مربوط به این نام از درون Font Manager
    // مقادیر weight: 400, width: 5, slant: 0 حالت استاندارد برای جستجوی فونت هستند
    const typeface = customFontMgr.matchFamilyStyle(fontName, { weight: 400, width: 5, slant: 0 });
    
    if (!typeface) {
      console.warn(`Font family "${fontName}" not found in customFontMgr.`);
      return null;
    }
    
    // تبدیل Typeface به شیء SkFont که برای اندازه‌گیری و رندر متن نیاز داریم
    return Skia.Font(typeface, fontSize);
  }, [customFontMgr, fontName, fontSize]);

  if (font === null || !text?.trim()) {
    return null;
  }
  
  const isRtl = rtl === true && ltr === false;
  const metrics = font.getMetrics();
  const ascent = metrics.ascent;
  const descent = metrics.descent;
  const leading = metrics.leading;
  const lineHeight = -ascent + descent + leading;

  // Function to wrap text into lines (منطق کاملاً دست‌نخورده باقی ماند)
  const wrapText = (text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLineWords: string[] = [];

    for (const word of words) {
      const testLineWords = [...currentLineWords, word];
      const testLine = testLineWords.join(' ');
      
      let testRendered = isRtl ? prepareRTLText(testLine) : testLine;
      testRendered = testRendered.replace(/\u200C/g, ''); 
      
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

  const maxTextWidth = width * 0.95;
  const lines = wrapText(text, maxTextWidth);
  
  const renderedLines = lines.map(line => {
    const preparedLine = isRtl ? prepareRTLText(line) : line;
    return preparedLine.replace(/\u200C/g, '');
  }).filter(Boolean);
  
  const lineWidths = renderedLines.map(line => font.measureText(line).width);

  if (renderedLines.length === 0) {
    return null;
  }

  const totalHeight = (renderedLines.length - 1) * lineHeight + (-ascent + descent);
  const top = (height - totalHeight) / 2;
  const firstBaseline = top - ascent;

  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color(textColor));

  const strokePaint = Skia.Paint();
  strokePaint.setColor(Skia.Color(borderColor));
  strokePaint.setStyle(PaintStyle.Stroke);
  strokePaint.setStrokeWidth(borderWidth);

  const textElements = renderedLines.reduce<React.ReactNode[]>((acc, line, index) => {
    const y = firstBaseline + index * lineHeight;
    const x = (width - lineWidths[index]) / 2;
    acc.push(
      <Text
        key={`stroke-${index}`}
        x={x}
        y={y}
        text={line}
        font={font} // 🌟 همان شیء font تولید شده پاس داده می‌شود
        paint={strokePaint}
      />,
      <Text
        key={`fill-${index}`}
        x={x}
        y={y}
        text={line}
        font={font}
        paint={textPaint}
      />
    );
    return acc;
  }, []);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        {textElements}
      </Group>
    </Canvas>
  );
};

export default memo(SimpleBorderText);