import { Skia } from '@shopify/react-native-skia';

/**
 * Builds the hourglass silhouette AND the lookup tables (LUTs) that let the
 * sand piles later trace the exact same curve as the glass, instead of a
 * rough straight-line approximation.
 *
 * All of this runs once (on the JS thread) whenever width/height change —
 * never inside the per-frame animation path — so its cost is irrelevant to
 * runtime performance.
 */

function cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

function sampleCubic(p0, p1, p2, p3, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(cubicPoint(p0, p1, p2, p3, i / steps));
  }
  return pts;
}

// How many samples per curve segment. 24 is plenty smooth for this size of
// shape and is only ever read (never recomputed) during animation.
const LUT_STEPS = 24;

export function buildGeometry(width, height) {
  const bodyInset = width * 0.17;
  const neckW = Math.max(6, width * 0.09);
  const topY = height * 0.12;
  const bottomY = height * 0.88;
  const neckY = height / 2;
  const cx = width / 2;
  const capH = height * 0.045;

  // Right-side control points only — the left side is a mirror of these
  // around cx, both for drawing the glass and for sand-edge lookups.
  const rTopP0 = { x: width - bodyInset, y: topY };
  const rTopP1 = { x: width - bodyInset, y: topY + (neckY - topY) * 0.4 };
  const rTopP2 = { x: cx + neckW / 2, y: neckY - (neckY - topY) * 0.2 };
  const rTopP3 = { x: cx + neckW / 2, y: neckY };

  const rBotP0 = { x: cx + neckW / 2, y: neckY };
  const rBotP1 = { x: cx + neckW / 2, y: neckY + (bottomY - neckY) * 0.2 };
  const rBotP2 = { x: width - bodyInset, y: bottomY - (bottomY - neckY) * 0.4 };
  const rBotP3 = { x: width - bodyInset, y: bottomY };

  const rTopLUT = sampleCubic(rTopP0, rTopP1, rTopP2, rTopP3, LUT_STEPS);
  const rBotLUT = sampleCubic(rBotP0, rBotP1, rBotP2, rBotP3, LUT_STEPS);

  const outer = Skia.Path.Make();
  outer.moveTo(bodyInset, topY);
  outer.lineTo(width - bodyInset, topY);
  outer.cubicTo(rTopP1.x, rTopP1.y, rTopP2.x, rTopP2.y, rTopP3.x, rTopP3.y);
  outer.cubicTo(rBotP1.x, rBotP1.y, rBotP2.x, rBotP2.y, rBotP3.x, rBotP3.y);
  outer.lineTo(bodyInset, bottomY);
  // NOTE: these two curves are traversed in the OPPOSITE direction from
  // their right-side counterparts (corner -> neck instead of neck ->
  // corner), so both the control points AND the endpoint must be taken in
  // reverse order (P2, P1, P0) — not (P1, P2, P3). Using the forward order
  // here was the bug that broke the left wall.
  outer.cubicTo(
    2 * cx - rBotP2.x, rBotP2.y,
    2 * cx - rBotP1.x, rBotP1.y,
    2 * cx - rBotP0.x, rBotP0.y
  );
  outer.cubicTo(
    2 * cx - rTopP2.x, rTopP2.y,
    2 * cx - rTopP1.x, rTopP1.y,
    2 * cx - rTopP0.x, rTopP0.y
  );
  outer.close();

  return {
    width,
    height,
    cx,
    neckW,
    neckY,
    topY,
    bottomY,
    bodyInset,
    capH,
    outer,
    // Right-side edge lookup tables; the left edge is always `2*cx - x`.
    rTopLUT,
    rBotLUT,
  };
}