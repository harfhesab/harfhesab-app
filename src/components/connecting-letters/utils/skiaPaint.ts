import { PaintStyle, Skia, StrokeJoin, TileMode, vec, type SkPaint } from '@shopify/react-native-skia';

export const roundedRect = (x: number, y: number, width: number, height: number, radius: number) =>
  Skia.RRectXY(Skia.XYWHRect(x, y, width, height), radius, radius);

export function solidPaint(color: string): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  return paint;
}

export function strokePaint(color: string, width: number): SkPaint {
  const paint = solidPaint(color);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(width);
  paint.setStrokeJoin(StrokeJoin.Round);
  return paint;
}

/** گرادیان عمودی از `top` تا `bottom` (در مختصات محلی شکل). */
export function verticalGradientPaint(top: number, bottom: number, colors: readonly string[]): SkPaint {
  const paint = solidPaint('#000000');
  paint.setShader(
    Skia.Shader.MakeLinearGradient(
      vec(0, top),
      vec(0, bottom),
      colors.map(color => Skia.Color(color)),
      null,
      TileMode.Clamp,
    ),
  );
  return paint;
}
