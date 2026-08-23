import React, { useMemo, memo } from 'react';
import { 
  Canvas, 
  Skia, 
  Paragraph, 
  TextAlign, 
  TextDirection,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from '@shopify/react-native-skia';
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
  const { customFontMgr } = useGlobalFonts();

  const isRtl = rtl === true && ltr === false;

  const { fillParagraph, borderParagraph, layoutWidth, offsetX, offsetY } = useMemo(() => {
    if (!customFontMgr || !text?.trim()) {
      return { fillParagraph: null, borderParagraph: null, layoutWidth: 0, offsetX: 0, offsetY: 0 };
    }

    // 🌟 فضای بیشتری برای stroke نگه می‌داریم چون خط حاشیه از مرکز به بیرون/داخل کشیده می‌شه
    const paddingForBorder = borderWidth * 2;
    const maxTextWidth = width * 0.95;
    const availableWidth = Math.max(maxTextWidth - paddingForBorder, 0);

    // 🌟 پاراگراف متن اصلی (fill) - رنگ ساده
    const fillBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center,
      textDirection: isRtl ? TextDirection.RTL : TextDirection.LTR,
    }, customFontMgr);

    fillBuilder.pushStyle({
      fontFamilies: [fontName],
      fontSize: fontSize,
      color: Skia.Color(textColor),
    });
    fillBuilder.addText(text);
    const pFill = fillBuilder.build();
    pFill.layout(availableWidth);

    // 🌟 پاراگراف حاشیه (border) - با foregroundPaint به‌صورت Stroke واقعی
    const strokePaint = Skia.Paint();
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(borderWidth * 2); // ضخامت واقعی حاشیه‌ی بیرونی
    strokePaint.setColor(Skia.Color(borderColor));
    strokePaint.setStrokeJoin(StrokeJoin.Round);
    strokePaint.setStrokeCap(StrokeCap.Round);
    strokePaint.setAntiAlias(true);

    const borderBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center,
      textDirection: isRtl ? TextDirection.RTL : TextDirection.LTR,
    }, customFontMgr);

    borderBuilder.pushStyle(
      {
        fontFamilies: [fontName],
        fontSize: fontSize,
      },
      strokePaint, // 👈 foregroundPaint - همون چیزی که کیفیت حاشیه رو واقعی می‌کنه
    );
    borderBuilder.addText(text);
    const pBorder = borderBuilder.build();
    pBorder.layout(availableWidth);

    // 🌟 سنتر کردن بلاک متن به‌صورت افقی و عمودی داخل width/height ثابت
    const x = (width - availableWidth) / 2;
    const y = (height - pFill.getHeight()) / 2;

    return {
      fillParagraph: pFill,
      borderParagraph: pBorder,
      layoutWidth: availableWidth,
      offsetX: x,
      offsetY: y,
    };
  }, [customFontMgr, text, textColor, borderColor, width, height, fontSize, borderWidth, fontName, isRtl]);

  if (!customFontMgr || !fillParagraph || !borderParagraph) {
    return null;
  }

  return (
    <Canvas style={{ width, height }}>
      {/* حاشیه اول (زیر) بعد متن اصلی (رو) */}
      <Paragraph
        paragraph={borderParagraph}
        x={offsetX}
        y={offsetY}
        width={layoutWidth}
      />
      <Paragraph
        paragraph={fillParagraph}
        x={offsetX}
        y={offsetY}
        width={layoutWidth}
      />
    </Canvas>
  );
};

export default memo(SimpleBorderText);