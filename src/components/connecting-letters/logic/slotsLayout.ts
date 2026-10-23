/**
 * چیدمان خانه‌های خالیِ حروفِ همه‌ی کلمه‌ها.
 *
 * کلمه‌ها در ستون‌های متوازن پخش می‌شوند — ۷ کلمه می‌شود ۴ + ۳ و ۱۳ کلمه ۵ + ۴ + ۴ — و تعداد
 * ستون‌ها طوری انتخاب می‌شود که بزرگ‌ترین خانه‌هایی که در فضای موجود جا می‌شوند به دست آید.
 * ترتیب خواندن راست‌به‌چپ است: ستون اول راست‌ترین ستون است و کلمه‌ها در ستون خود راست‌چین
 * می‌شوند. کلمه‌ی اصلی ردیف جداگانه و بزرگ‌تری در پایین دارد.
 */

/** فاصله‌ها، به صورت کسری از اندازه‌ی خانه. */
const LETTER_GAP = 0.14;
const ROW_GAP = 0.3;
const COLUMN_GAP = 0.9;
const MAIN_GAP = 0.75;
/** اندازه‌ی خانه‌های کلمه‌ی اصلی نسبت به خانه‌های معمولی. */
const MAIN_SCALE = 1.4;

const MAX_BOX = 34;
const MAX_MAIN_BOX = 46;
/** هیچ ستونی بیش از این تعداد کلمه ندارد، پس فهرست‌های بلند همیشه تقسیم می‌شوند. */
const MAX_ROWS = 6;
const MAX_COLUMNS = 4;
/** ستون کمتر برنده است، مگر این‌که ستون بیشتر خانه‌ها را دست‌کم این‌قدر بزرگ‌تر کند (1 / 0.88 ≈ 14%). */
const FEWER_COLUMNS_BIAS = 0.88;

export interface SlotBox {
  cx: number;
  cy: number;
  letter: string;
}

export interface SlotRow {
  size: number;
  boxes: SlotBox[];
}

export interface SlotsLayout {
  /** برای هر کلمه‌ی هدف یک ردیف، به ترتیب `words`. */
  rows: SlotRow[];
  main: SlotRow | null;
  columns: number;
  /** کادر دربرگیرنده‌ی همه‌ی موارد بالا، برای کشیدن پنل پس‌زمینه. */
  bounds: { x: number; y: number; width: number; height: number };
}

export interface SlotsLayoutInput {
  words: readonly string[];
  mainWord: string | null;
  width: number;
  height: number;
  /**
   * اندازه‌ی دکمه‌ای که در گوشه‌ی بالای این ناحیه قرار دارد. چیدمان یا از زیر آن شروع می‌شود یا
   * به‌طور قرینه باریک می‌شود تا از کنارش رد شود — هر کدام خانه‌های بزرگ‌تری بدهد.
   */
  obstacle?: { width: number; height: number };
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Fit {
  area: Area;
  columnSizes: number[];
  columnLengths: number[];
  size: number;
}

/** `count` مورد را به `columns` گروه تقسیم می‌کند که اندازه‌شان حداکثر یکی با هم فرق دارد. */
export function balanceColumns(count: number, columns: number): number[] {
  const base = Math.floor(count / columns);
  const extra = count % columns;
  return Array.from({ length: columns }, (_, column) => base + (column < extra ? 1 : 0));
}

const rowWidthUnits = (letters: number) => (letters > 0 ? letters + (letters - 1) * LETTER_GAP : 0);

function fitColumns(lengths: readonly number[], mainLength: number, columns: number, area: Area): Fit {
  const columnSizes = columns > 0 ? balanceColumns(lengths.length, columns) : [];
  const columnLengths: number[] = [];
  let start = 0;
  for (const count of columnSizes) {
    columnLengths.push(Math.max(...lengths.slice(start, start + count)));
    start += count;
  }

  const rows = columnSizes[0] ?? 0;
  const widthUnits =
    columnLengths.reduce((sum, letters) => sum + rowWidthUnits(letters), 0) +
    Math.max(0, columns - 1) * COLUMN_GAP;
  const heightUnits =
    (rows > 0 ? rows + (rows - 1) * ROW_GAP : 0) +
    (mainLength > 0 ? (rows > 0 ? MAIN_GAP : 0) + MAIN_SCALE : 0);
  const mainWidthUnits = rowWidthUnits(mainLength) * MAIN_SCALE;

  const size = Math.min(
    MAX_BOX,
    widthUnits > 0 ? area.width / widthUnits : Infinity,
    heightUnits > 0 ? area.height / heightUnits : Infinity,
    mainWidthUnits > 0 ? area.width / mainWidthUnits : Infinity,
  );
  return { area, columnSizes, columnLengths, size: Math.max(0, size) };
}

function bestFit(lengths: readonly number[], mainLength: number, area: Area): Fit {
  const count = lengths.length;
  if (count === 0) {
    return fitColumns(lengths, mainLength, 0, area);
  }

  const minColumns = Math.ceil(count / MAX_ROWS);
  const maxColumns = Math.max(minColumns, Math.min(count, MAX_COLUMNS));
  const fits: Fit[] = [];
  for (let columns = minColumns; columns <= maxColumns; columns++) {
    fits.push(fitColumns(lengths, mainLength, columns, area));
  }
  const biggest = Math.max(...fits.map(fit => fit.size));
  return fits.find(fit => fit.size >= biggest * FEWER_COLUMNS_BIAS) ?? fits[0];
}

export function computeSlotsLayout({ words, mainWord, width, height, obstacle }: SlotsLayoutInput): SlotsLayout {
  const lengths = words.map(word => Array.from(word).length);
  const mainLetters = mainWord ? Array.from(mainWord) : [];

  const full: Area = { x: 0, y: 0, width, height };
  let fit = bestFit(lengths, mainLetters.length, full);
  if (obstacle) {
    const below = bestFit(lengths, mainLetters.length, {
      x: 0,
      y: obstacle.height,
      width,
      height: Math.max(0, height - obstacle.height),
    });
    const beside = bestFit(lengths, mainLetters.length, {
      x: obstacle.width,
      y: 0,
      width: Math.max(0, width - obstacle.width * 2),
      height,
    });
    fit = below.size > beside.size ? below : beside;
  }

  const { area, columnSizes, columnLengths, size } = fit;
  const gap = size * LETTER_GAP;
  const rowGap = size * ROW_GAP;
  const columnGap = size * COLUMN_GAP;
  const mainSize = Math.min(size * MAIN_SCALE, MAX_MAIN_BOX);
  const mainGap = mainSize * LETTER_GAP;

  const columnWidths = columnLengths.map(letters => letters * size + Math.max(0, letters - 1) * gap);
  const blockWidth =
    columnWidths.reduce((sum, w) => sum + w, 0) + Math.max(0, columnWidths.length - 1) * columnGap;
  const rows = columnSizes[0] ?? 0;
  const blockHeight = rows > 0 ? rows * size + (rows - 1) * rowGap : 0;
  const mainWidth = mainLetters.length * mainSize + Math.max(0, mainLetters.length - 1) * mainGap;
  const mainOffset = mainLetters.length > 0 ? (rows > 0 ? size * MAIN_GAP : 0) : 0;
  const contentWidth = Math.max(blockWidth, mainWidth);
  const contentHeight = blockHeight + mainOffset + (mainLetters.length > 0 ? mainSize : 0);
  const top = area.y + (area.height - contentHeight) / 2;

  // راست‌به‌چپ: ستون اول راست‌ترین است و حروف از راست به چپ چیده می‌شوند.
  const rowsOut: SlotRow[] = [];
  let columnRight = area.x + (area.width + blockWidth) / 2;
  let wordIndex = 0;
  columnSizes.forEach((count, column) => {
    for (let row = 0; row < count; row++, wordIndex++) {
      const cy = top + row * (size + rowGap) + size / 2;
      rowsOut.push({
        size,
        boxes: Array.from(words[wordIndex]).map((letter, i) => ({
          cx: columnRight - size / 2 - i * (size + gap),
          cy,
          letter,
        })),
      });
    }
    columnRight -= columnWidths[column] + columnGap;
  });

  let main: SlotRow | null = null;
  if (mainLetters.length > 0) {
    const mainRight = area.x + (area.width + mainWidth) / 2;
    const cy = top + blockHeight + mainOffset + mainSize / 2;
    main = {
      size: mainSize,
      boxes: mainLetters.map((letter, i) => ({ cx: mainRight - mainSize / 2 - i * (mainSize + mainGap), cy, letter })),
    };
  }

  return {
    rows: rowsOut,
    main,
    columns: columnSizes.length,
    bounds: {
      x: area.x + (area.width - contentWidth) / 2,
      y: top,
      width: contentWidth,
      height: contentHeight,
    },
  };
}
