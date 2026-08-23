import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { 
  Canvas, 
  Group, 
  Skia, 
  vec, 
  Paragraph, 
  TextAlign, 
  TextDirection,
  Mask,
  Rect,
  LinearGradient,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
// مسیر این ایمپورت را بر اساس ساختار پوشه‌های خود تنظیم کنید
import { useGlobalFonts } from '../../context/SkiaFontProvider';

interface AnimatedSkiaTextProps {
  text: string;
  fontSize: SharedValue<number>;
  initialFontSize: number;
  initialWidth: number;
  initialHeight: number;
  rtl?: boolean;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  fontName?: string;
}

const AnimatedSkiaText: React.FC<AnimatedSkiaTextProps> = ({ 
  text,
  fontSize,
  initialFontSize,
  initialWidth,
  initialHeight,
  rtl = true,
  gradientColors = ['#9d34da', '#3800b9'],
  borderColor = '#FFFFFF',
  borderWidth = 1,
  fontName = 'YekanBakh-Black',
}) => {

  // 🌟 دریافت مدیر فونت از کانتکست گلوبال
  const { customFontMgr } = useGlobalFonts();

  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  // تبدیل رنگ‌ها به فرمت قابل فهم برای Skia
  const parsedBorderColor = useMemo(() => Skia.Color(borderColor), [borderColor]);
  const parsedWhiteColor = useMemo(() => Skia.Color('#FFFFFF'), []);

  const { maskParagraph, borderParagraph, paraHeight, paraWidth } = useMemo(() => {
    if (!customFontMgr) return { maskParagraph: null, borderParagraph: null, paraHeight: 0, paraWidth: 0 };

    const maxWidth = initialWidth * 0.95;

    // 🌟 پاراگراف ماسک (سفید، بدون تغییر) - برای برش گرادیانت استفاده می‌شود
    const maskBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center,
      textDirection: rtl ? TextDirection.RTL : TextDirection.LTR,
    }, customFontMgr);

    maskBuilder.pushStyle({
      fontFamilies: [fontName],
      fontSize: initialFontSize,
      color: parsedWhiteColor,
    });
    maskBuilder.addText(text);
    const pMask = maskBuilder.build();
    pMask.layout(maxWidth);

    // 🌟 پاراگراف حاشیه (border) - با foregroundPaint استروک واقعی به‌جای ۸ کپی آفست
    const strokePaint = Skia.Paint();
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(borderWidth * 2); // stroke از مرکز کشیده می‌شود، برای حاشیه‌ی بیرونی معادل borderWidth دو برابرش می‌کنیم
    strokePaint.setColor(parsedBorderColor);
    strokePaint.setStrokeJoin(StrokeJoin.Round);
    strokePaint.setStrokeCap(StrokeCap.Round);
    strokePaint.setAntiAlias(true);

    const borderBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center,
      textDirection: rtl ? TextDirection.RTL : TextDirection.LTR,
    }, customFontMgr);

    borderBuilder.pushStyle(
      {
        fontFamilies: [fontName],
        fontSize: initialFontSize,
      },
      strokePaint, // 👈 foregroundPaint - همان چیزی که کیفیت حاشیه را واقعی می‌کند
    );
    borderBuilder.addText(text);
    const pBorder = borderBuilder.build();
    pBorder.layout(maxWidth);

    return {
      maskParagraph: pMask,
      borderParagraph: pBorder,
      paraHeight: pMask.getHeight(), // 👈 اندازه‌گیری از روی پاراگراف بدون استروک (متریک دقیق‌تر و بدون تاثیر ضخامت خط)
      paraWidth: maxWidth
    };
  }, [customFontMgr, text, rtl, initialFontSize, initialWidth, parsedBorderColor, parsedWhiteColor, fontName, borderWidth]); // 👈 borderWidth هم به وابستگی‌ها اضافه شد چون در strokePaint استفاده می‌شود

  if (!customFontMgr || !maskParagraph || !borderParagraph) {
    return null;
  }

  const x = (initialWidth - paraWidth) / 2;
  const y = (initialHeight - paraHeight) / 2;

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        
        {/* لایه اول: استروک (Stroke) */}
        {/* یک پاراگراف حاشیه به‌جای ۸ کپی قبلی */}
        <Paragraph 
          paragraph={borderParagraph} 
          x={x} 
          y={y} 
          width={paraWidth} 
        />

        {/* لایه دوم: گرادیانت روی متن اصلی */}
        {/* استفاده از Paragraph به عنوان یک ماسک برای بُرش دادن مستطیل گرادیانت‌دار */}
        <Mask
          mask={
            <Paragraph 
              paragraph={maskParagraph} 
              x={x} 
              y={y} 
              width={paraWidth} 
            />
          }
        >
          <Rect x={x} y={y} width={paraWidth} height={paraHeight}>
            <LinearGradient
              start={vec(0, y)}
              end={vec(0, y + paraHeight)}
              colors={gradientColors}
            />
          </Rect>
        </Mask>
        
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