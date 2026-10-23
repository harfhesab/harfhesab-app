/**
 * شبیه‌سازی صفحه‌ی بازی؛ به صورت worklet نوشته شده تا کاملاً روی UI thread اجرا شود.
 *
 * کل وضعیت کارت‌ها در یک `number[]` تخت است، برای هر کارت `STRIDE` عدد. frame callback آن را
 * درجا تغییر می‌دهد و در هر فریم فقط یک بار منتشر می‌کند: هر فریم بدون هیچ تخصیص حافظه و با
 * فقط یک به‌روزرسانیِ shared value انجام می‌شود، تعداد کارت‌ها هر چه باشد.
 */

// جای هر کانال در بخشِ مربوط به هر کارت در بافر.
/** x مرکز، در مختصات محدوده‌ی حرکت. */
export const X = 0;
export const Y = 1;
/** سرعت، px/s. */
export const VX = 2;
export const VY = 3;
/** مقیاس نمایش، که با یک فنر حرکت می‌کند. */
export const SCALE = 4;
export const SCALE_V = 5;
/** تا وقتی کارت جزء کلمه‌ی در حال ساخت است 1، وگرنه 0. */
export const PICKED = 6;
/** پیشرفت موج لمس، 0→1؛ مقدار 1 یعنی غیرفعال. */
export const PULSE = 7;
export const STRIDE = 8;

export interface WorldConfig {
  /** اندازه‌ی محدوده‌ای که مرکز کارت‌ها در آن حرکت می‌کند. */
  width: number;
  height: number;
  tileSize: number;
  minSpeed: number;
  maxSpeed: number;
  speedRelax: number;
  restitution: number;
  pickedScale: number;
  stiffness: number;
  damping: number;
  pulseSeconds: number;
}

/** دنیا را `dt` ثانیه جلو می‌برد. */
export function stepWorld(b: number[], count: number, dt: number, w: WorldConfig): void {
  'worklet';
  const relax = Math.exp(-w.speedRelax * dt);
  const pulseStep = dt / w.pulseSeconds;
  const half = w.tileSize / 2;

  // ۱. کانال‌های انیمیشن، تنظیم سرعت و انتگرال‌گیری.
  for (let o = 0; o < count * STRIDE; o += STRIDE) {
    const target = b[o + PICKED] === 1 ? w.pickedScale : 1;
    // اویلر نیمه‌ضمنی: با این ثابت‌ها تا سقفِ dt پایدار است.
    const scaleVelocity =
      b[o + SCALE_V] + (w.stiffness * (target - b[o + SCALE]) - w.damping * b[o + SCALE_V]) * dt;
    b[o + SCALE_V] = scaleVelocity;
    b[o + SCALE] += scaleVelocity * dt;
    if (b[o + PULSE] < 1) {
      b[o + PULSE] = Math.min(1, b[o + PULSE] + pulseStep);
    }

    // سرعت را در بازه‌ی [minSpeed, maxSpeed] نگه می‌داریم، اما به‌جای بریدن ناگهانی به‌آرامی
    // برمی‌گردانیم تا اثر یک برخورد شدید نرم محو شود، نه یک‌باره.
    let vx = b[o + VX];
    let vy = b[o + VY];
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < 1e-3) {
      const angle = Math.random() * 2 * Math.PI;
      vx = Math.cos(angle) * w.minSpeed;
      vy = Math.sin(angle) * w.minSpeed;
    } else if (speed > w.maxSpeed || speed < w.minSpeed) {
      const limit = speed > w.maxSpeed ? w.maxSpeed : w.minSpeed;
      const k = (limit + (speed - limit) * relax) / speed;
      vx *= k;
      vy *= k;
    }
    b[o + VX] = vx;
    b[o + VY] = vy;
    b[o + X] += vx * dt;
    b[o + Y] += vy * dt;
  }

  // ۲. برخورد کارت با کارت (مربع‌های هم‌راستا با محورها، جرم برابر). کارت‌های انتخاب‌شده فقط
  //    با هم برخورد می‌کنند، پس از زیر بقیه‌ی کارت‌ها رد می‌شوند.
  for (let a = 0; a < count * STRIDE; a += STRIDE) {
    for (let c = a + STRIDE; c < count * STRIDE; c += STRIDE) {
      if (b[a + PICKED] !== b[c + PICKED]) {
        continue;
      }
      const reach = half * (Math.max(b[a + SCALE], 0) + Math.max(b[c + SCALE], 0));
      const dx = b[c + X] - b[a + X];
      const overlapX = reach - Math.abs(dx);
      if (overlapX <= 0) {
        continue;
      }
      const dy = b[c + Y] - b[a + Y];
      const overlapY = reach - Math.abs(dy);
      if (overlapY <= 0) {
        continue;
      }

      // جدا کردن در امتداد محوری که کمترین فرورفتگی را دارد، هر کدام نصف.
      let nx = 0;
      let ny = 0;
      let push: number;
      if (overlapX < overlapY) {
        nx = dx < 0 ? -1 : 1;
        push = overlapX / 2;
      } else {
        ny = dy < 0 ? -1 : 1;
        push = overlapY / 2;
      }
      b[a + X] -= nx * push;
      b[a + Y] -= ny * push;
      b[c + X] += nx * push;
      b[c + Y] += ny * push;

      const approach = (b[c + VX] - b[a + VX]) * nx + (b[c + VY] - b[a + VY]) * ny;
      if (approach < 0) {
        const impulse = (-(1 + w.restitution) * approach) / 2;
        b[a + VX] -= impulse * nx;
        b[a + VY] -= impulse * ny;
        b[c + VX] += impulse * nx;
        b[c + VY] += impulse * ny;
      }
    }
  }

  // ۳. دیواره‌ها در آخر، تا هیچ کارتی که با برخورد هل داده شده بیرون از محدوده نماند.
  for (let o = 0; o < count * STRIDE; o += STRIDE) {
    const h = half * Math.max(b[o + SCALE], 0);
    if (w.width <= 2 * h) {
      b[o + X] = w.width / 2;
    } else if (b[o + X] < h) {
      b[o + X] = h;
      b[o + VX] = Math.abs(b[o + VX]);
    } else if (b[o + X] > w.width - h) {
      b[o + X] = w.width - h;
      b[o + VX] = -Math.abs(b[o + VX]);
    }
    if (w.height <= 2 * h) {
      b[o + Y] = w.height / 2;
    } else if (b[o + Y] < h) {
      b[o + Y] = h;
      b[o + VY] = Math.abs(b[o + VY]);
    } else if (b[o + Y] > w.height - h) {
      b[o + Y] = w.height - h;
      b[o + VY] = -Math.abs(b[o + VY]);
    }
  }
}

/**
 * اندیس کارتِ آزادِ زیر (x, y) — اگر چند کارت روی هم باشند، آن که مرکزش نزدیک‌تر است — یا -1.
 * `slop` هر کارت را کمی بزرگ‌تر در نظر می‌گیرد که برای هدف‌های متحرک مهم است.
 */
export function tileAt(b: number[], count: number, x: number, y: number, w: WorldConfig, slop: number): number {
  'worklet';
  let best = -1;
  let bestDistance = Infinity;
  for (let i = 0; i < count; i++) {
    const o = i * STRIDE;
    if (b[o + PICKED] === 1) {
      continue;
    }
    const reach = (w.tileSize / 2) * Math.max(b[o + SCALE], 0) + slop;
    const dx = x - b[o + X];
    const dy = y - b[o + Y];
    if (Math.abs(dx) > reach || Math.abs(dy) > reach) {
      continue;
    }
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

export function pickTile(b: number[], index: number): void {
  'worklet';
  const o = index * STRIDE;
  b[o + PICKED] = 1;
  b[o + PULSE] = 0;
}

/** همه‌ی کارت‌های انتخاب‌شده را آزاد می‌کند و تعدادشان را برمی‌گرداند. */
export function releaseTiles(b: number[], count: number): number {
  'worklet';
  let released = 0;
  for (let o = 0; o < count * STRIDE; o += STRIDE) {
    if (b[o + PICKED] === 1) {
      b[o + PICKED] = 0;
      released++;
    }
  }
  return released;
}

export function countPicked(b: number[], count: number): number {
  'worklet';
  let picked = 0;
  for (let o = 0; o < count * STRIDE; o += STRIDE) {
    picked += b[o + PICKED];
  }
  return picked;
}
