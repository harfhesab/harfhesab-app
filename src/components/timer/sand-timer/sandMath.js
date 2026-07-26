// All functions here run on the UI thread inside Reanimated worklets, so
// every one of them must carry the 'worklet' directive — including helper
// functions that other worklets call internally. Forgetting this on any of
// them throws "Tried to synchronously call a non-worklet function...".

export function lerp(a, b, t) {
  'worklet';
  return a + (b - a) * t;
}

export function clamp01(v) {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lutXAt(y, lut) {
  'worklet';
  if (y <= lut[0].y) return lut[0].x;
  const last = lut[lut.length - 1];
  if (y >= last.y) return last.x;
  for (let i = 0; i < lut.length - 1; i++) {
    const a = lut[i];
    const b = lut[i + 1];
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return last.x;
}

// Exact (well, LUT-accurate) x position of the glass wall at a given y,
// mirrored automatically for the left side.
export function edgeXAt(y, geo) {
  'worklet';
  const lut = y <= geo.neckY ? geo.rTopLUT : geo.rBotLUT;
  const right = lutXAt(y, lut);
  return { left: 2 * geo.cx - right, right };
}

// Points tracing the right glass wall between yFrom and yTo (yFrom < yTo),
// including exact interpolated endpoints. Used so the draining sand's edge
// hugs the real glass curve instead of a straight-line shortcut.
export function rightEdgeBetween(yFrom, yTo, geo) {
  'worklet';
  const points = [];
  const push = (y) => {
    const { right } = edgeXAt(y, geo);
    points.push({ x: right, y });
  };
  push(yFrom);
  const lists = [geo.rTopLUT, geo.rBotLUT];
  for (let li = 0; li < lists.length; li++) {
    const lut = lists[li];
    for (let i = 0; i < lut.length; i++) {
      const p = lut[i];
      if (p.y > yFrom && p.y < yTo) points.push({ x: p.x, y: p.y });
    }
  }
  push(yTo);
  points.sort((a, b) => a.y - b.y);
  return points;
}

// Height of the bottom pile's peak for a given progress (0 -> 1).
export function peakYAt(progress, geo) {
  'worklet';
  return lerp(geo.bottomY, geo.neckY + (geo.bottomY - geo.neckY) * 0.06, progress);
}
