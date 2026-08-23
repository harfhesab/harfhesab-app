import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { 
  Canvas, 
  Group, 
  Skia, 
  vec, 
  TileMode, 
  Paragraph,
  TextAlign,
  TextDirection,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
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
  gradientColors = ['#512da8', '#7b1fa2'],
  borderColor = '#FFFFFF',
  borderWidth = 1.5,
  fontName = 'YekanBakh-ExtraBlack',
 }) => {

  // 🌟 دریافت مدیر فونت از کانتکست گلوبال
  const { customFontMgr } = useGlobalFonts();

  const isRtl = rtl === true && ltr === false;

  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  const { fillParagraph, borderParagraph, paraWidth, paraHeight, offsetX, offsetY } = useMemo(() => {
    if (!customFontMgr || !text?.trim()) {
      return { fillParagraph: null, borderParagraph: null, paraWidth: 0, paraHeight: 0, offsetX: 0, offsetY: 0 };
    }

    const maxWidth = initialWidth * 0.95;

    // 🌟 پاراگراف اصلی (fill) - گرادیانت مستقیماً به‌عنوان foregroundPaint اعمال می‌شود
    // 👈 دیگه نیازی به تکنیک Mask + Rect + LinearGradient نیست، چون foregroundPaint
    //    خودش می‌تونه یک Paint با shader (گرادیانت) باشه و مستقیم روی متن اعمال می‌شه
    const gradientShader = Skia.Shader.MakeLinearGradient(
      vec(0, 0),
      vec(maxWidth, 0),
      gradientColors.map((c) => Skia.Color(c)),
      null,
      TileMode.Clamp
    );
    const gradientPaint = Skia.Paint();
    gradientPaint.setShader(gradientShader);
    gradientPaint.setAntiAlias(true);

    const fillBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center,
      textDirection: isRtl ? TextDirection.RTL : TextDirection.LTR,
    }, customFontMgr);

    fillBuilder.pushStyle(
      {
        fontFamilies: [fontName],
        fontSize: initialFontSize,
      },
      gradientPaint, // 👈 foregroundPaint با شیدر گرادیانت
    );
    fillBuilder.addText(text);
    const pFill = fillBuilder.build();
    pFill.layout(maxWidth);

    // 🌟 پاراگراف حاشیه (border) - با foregroundPaint استروک واقعی
    const strokePaint = Skia.Paint();
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(borderWidth * 2); // stroke از مرکز کشیده می‌شود
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
        fontSize: initialFontSize,
      },
      strokePaint,
    );
    borderBuilder.addText(text);
    const pBorder = borderBuilder.build();
    pBorder.layout(maxWidth);

    const width = pFill.getLongestLine();
    const height = pFill.getHeight();

    return {
      fillParagraph: pFill,
      borderParagraph: pBorder,
      paraWidth: maxWidth,
      paraHeight: height,
      offsetX: (initialWidth - maxWidth) / 2,
      offsetY: (initialHeight - height) / 2,
    };
  }, [customFontMgr, text, isRtl, initialFontSize, initialWidth, initialHeight, gradientColors, borderColor, borderWidth, fontName]);

  if (!customFontMgr || !fillParagraph || !borderParagraph) {
    return null;
  }

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        {/* بوردر - یک پاراگراف با استروک واقعی به‌جای Text با strokePaint */}
        <Paragraph
          paragraph={borderParagraph}
          x={offsetX}
          y={offsetY}
          width={paraWidth}
        />
        {/* متن اصلی با گرادیانت - مستقیم از طریق foregroundPaint، بدون Mask */}
        <Paragraph
          paragraph={fillParagraph}
          x={offsetX}
          y={offsetY}
          width={paraWidth}
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