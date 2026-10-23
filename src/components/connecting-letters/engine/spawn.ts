import { PULSE, SCALE, STRIDE, VX, VY, X, Y, type WorldConfig } from './physics';

type Random = () => number;

function shuffle<T>(items: T[], random: Random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * مرکز شروع `count` کارت: شبکه‌ای هم‌نسبت با محدوده، با خانه‌های بُرخورده تا الگویی دیده نشود
 * و هر کارت با جابه‌جایی تصادفی داخل خانه‌ی خودش. پس کارت‌ها پخش‌شده شروع می‌کنند و (اگر جا
 * باشد) هیچ‌وقت روی هم نیستند؛ فریم‌های اول «منفجر» نمی‌شوند.
 */
export function scatterTiles(
  count: number,
  width: number,
  height: number,
  tileSize: number,
  random: Random = Math.random,
): { x: number; y: number }[] {
  if (count <= 0 || width <= 0 || height <= 0) {
    return [];
  }
  const columns = Math.max(1, Math.min(count, Math.round(Math.sqrt((count * width) / height))));
  const rows = Math.ceil(count / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const jitterX = Math.max(0, cellWidth - tileSize) / 2;
  const jitterY = Math.max(0, cellHeight - tileSize) / 2;
  const half = tileSize / 2;
  const clamp = (value: number, max: number) => (max <= 2 * half ? max / 2 : Math.min(max - half, Math.max(half, value)));

  const cells = shuffle(Array.from({ length: columns * rows }, (_, i) => i), random);
  return cells.slice(0, count).map(cell => ({
    x: clamp(((cell % columns) + 0.5) * cellWidth + (random() * 2 - 1) * jitterX, width),
    y: clamp((Math.floor(cell / columns) + 0.5) * cellHeight + (random() * 2 - 1) * jitterY, height),
  }));
}

/** بافر فشرده‌ی وضعیت کارت‌ها را برای یک صفحه‌ی تازه می‌سازد (ساختارش در `physics.ts`). */
export function createBodies(count: number, world: WorldConfig, random: Random = Math.random): number[] {
  const bodies = new Array<number>(count * STRIDE).fill(0);
  const positions = scatterTiles(count, world.width, world.height, world.tileSize, random);

  positions.forEach((position, i) => {
    const o = i * STRIDE;
    const angle = random() * 2 * Math.PI;
    const speed = world.minSpeed + random() * (world.maxSpeed - world.minSpeed) * 0.6;
    bodies[o + X] = position.x;
    bodies[o + Y] = position.y;
    bodies[o + VX] = Math.cos(angle) * speed;
    bodies[o + VY] = Math.sin(angle) * speed;
    // از همان فریم اول با اندازه‌ی کامل دیده می‌شوند؛ انیمیشن ورود، شروع بازی را کند نشان می‌داد.
    bodies[o + SCALE] = 1;
    bodies[o + PULSE] = 1;
  });
  return bodies;
}
