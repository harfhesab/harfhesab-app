import { balanceColumns, computeSlotsLayout } from '../logic/slotsLayout';

const words = (count: number, length = 4) => Array.from({ length: count }, () => 'ابپتثجچخ'.slice(0, length));

const wordsPerColumn = (layout: ReturnType<typeof computeSlotsLayout>) => {
  // ردیف‌هایی که x راست‌ترین خانه‌شان یکی است، در یک ستون‌اند.
  const columns = new Map<number, number>();
  for (const row of layout.rows) {
    const right = Math.round(row.boxes[0].cx);
    columns.set(right, (columns.get(right) ?? 0) + 1);
  }
  return [...columns.entries()].sort((a, b) => b[0] - a[0]).map(([, count]) => count);
};

describe('balanceColumns', () => {
  it('splits 7 words into 4 + 3, never 6 + 1', () => {
    expect(balanceColumns(7, 2)).toEqual([4, 3]);
  });

  it('keeps every column within one word of the others', () => {
    for (let count = 1; count <= 30; count++) {
      for (let columns = 1; columns <= 4; columns++) {
        const sizes = balanceColumns(count, columns);
        expect(sizes.reduce((a, b) => a + b, 0)).toBe(count);
        expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('computeSlotsLayout', () => {
  const phone = { width: 336, height: 230 };

  it('lays 7 words out as 4 + 3, first column on the right', () => {
    const layout = computeSlotsLayout({ words: words(7, 5), mainWord: 'کلمات', ...phone });
    expect(layout.columns).toBe(2);
    expect(wordsPerColumn(layout)).toEqual([4, 3]);
    // کلمه‌ی 0 اول ستون راست است و کلمه‌ی 4 اول ستون چپ.
    expect(layout.rows[0].boxes[0].cx).toBeGreaterThan(layout.rows[4].boxes[0].cx);
    expect(layout.rows[0].boxes[0].cy).toBe(layout.rows[4].boxes[0].cy);
  });

  it('splits 13 words evenly over three columns', () => {
    const layout = computeSlotsLayout({ words: words(13, 3), mainWord: null, width: 336, height: 400 });
    expect(wordsPerColumn(layout)).toEqual([5, 4, 4]);
  });

  it('runs letters right-to-left inside a word', () => {
    const layout = computeSlotsLayout({ words: ['سلام'], mainWord: null, ...phone });
    const xs = layout.rows[0].boxes.map(box => box.cx);
    expect([...xs].sort((a, b) => b - a)).toEqual(xs);
    expect(layout.rows[0].boxes.map(box => box.letter).join('')).toBe('سلام');
  });

  it('keeps every box, including the larger main word, inside the area', () => {
    for (let count = 0; count <= 16; count++) {
      for (const height of [120, 230, 420]) {
        const layout = computeSlotsLayout({
          words: words(count, 3 + (count % 4)),
          mainWord: 'ناشناخته',
          width: 336,
          height,
        });
        for (const row of [...layout.rows, ...(layout.main ? [layout.main] : [])]) {
          for (const box of row.boxes) {
            expect(box.cx - row.size / 2).toBeGreaterThanOrEqual(-1e-6);
            expect(box.cx + row.size / 2).toBeLessThanOrEqual(336 + 1e-6);
            expect(box.cy - row.size / 2).toBeGreaterThanOrEqual(-1e-6);
            expect(box.cy + row.size / 2).toBeLessThanOrEqual(height + 1e-6);
          }
        }
        if (layout.main && layout.rows.length > 0) {
          expect(layout.main.size).toBeGreaterThan(layout.rows[0].size);
        }
      }
    }
  });

  it('keeps clear of the corner button', () => {
    const obstacle = { width: 44, height: 50 };
    const layout = computeSlotsLayout({ words: words(8, 6), mainWord: 'کلمه', ...phone, obstacle });
    for (const row of layout.rows) {
      for (const box of row.boxes) {
        const inCornerX = box.cx - row.size / 2 < obstacle.width || box.cx + row.size / 2 > phone.width - obstacle.width;
        const inCornerY = box.cy - row.size / 2 < obstacle.height;
        expect(inCornerX && inCornerY).toBe(false);
      }
    }
  });

  it('never overlaps two boxes', () => {
    const layout = computeSlotsLayout({ words: words(9, 5), mainWord: 'واژگان', ...phone });
    const all = [...layout.rows, ...(layout.main ? [layout.main] : [])].flatMap(row =>
      row.boxes.map(box => ({ ...box, size: row.size })),
    );
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const overlapX = Math.abs(a.cx - b.cx) < (a.size + b.size) / 2 - 1e-6;
        const overlapY = Math.abs(a.cy - b.cy) < (a.size + b.size) / 2 - 1e-6;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });
});
