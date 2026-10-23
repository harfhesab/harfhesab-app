interface Position {
  x: number;
  y: number;
}

/**
 * موقعیت‌های شروع کارت‌ها را به‌صورت یک شبکه‌ی به‌هم‌ریخته (grid + jitter) تولید می‌کند
 * تا کارت‌ها در کل فضای باکس پخش شوند، نه اینکه همه در یک گوشه‌ی ثابت روی هم بیفتند.
 *
 * چرا این کار لازم است:
 * نسخه‌ی قبلی از یک عدد ثابت (200x200) برای موقعیت اولیه استفاده می‌کرد که ربطی به
 * اندازه‌ی واقعی باکس نداشت. نتیجه: در باکس‌های بزرگ‌تر همه‌ی کارت‌ها در یک گوشه
 * روی هم تلنبار می‌شدند و در فریم اول به‌خاطر resolve شدن هم‌پوشانی‌های شدید،
 * با سرعت غیرطبیعی به اطراف پرتاب می‌شدند (یک «انفجار» بصری در شروع بازی).
 *
 * راه‌حل: فضای قابل استفاده را به یک شبکه‌ی cols*rows تقسیم می‌کنیم، ترتیب خانه‌ها را
 * شافل می‌کنیم (تا الگوی شبکه‌ای به چشم نیاید) و داخل هر خانه یک jitter تصادفی
 * می‌دهیم که از اندازه‌ی کارت کوچک‌تر است (پس هم‌پوشانی اولیه عملاً حذف می‌شود).
 */
export function generateInitialPositions(
  count: number,
  usableWidth: number,
  usableHeight: number,
  cardSize: number
): Position[] {
  if (count <= 0 || usableWidth <= 0 || usableHeight <= 0) return [];

  const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt((count * usableWidth) / usableHeight))));
  const rows = Math.max(1, Math.ceil(count / cols));

  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  // فضای jitter داخل هر خانه؛ اگر خانه از کارت کوچک‌تر باشد jitter صفر می‌شود
  // (در آن حالت شبکه به‌تنهایی جلوی هم‌پوشانی شدید را می‌گیرد، فیزیک بقیه را حل می‌کند)
  const jitterX = Math.max(0, cellWidth - cardSize);
  const jitterY = Math.max(0, cellHeight - cardSize);

  const cellIndices = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }

  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    const cellIndex = cellIndices[i];
    const col = cellIndex % cols;
    const row = Math.floor(cellIndex / cols);

    positions.push({
      x: col * cellWidth + Math.random() * jitterX,
      y: row * cellHeight + Math.random() * jitterY,
    });
  }

  return positions;
}