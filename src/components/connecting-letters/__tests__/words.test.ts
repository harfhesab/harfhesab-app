import {
  countHelpPerSlot,
  createGameModel,
  evaluateWord,
  foundPerSlot,
  instantSubmitWords,
  isPuzzleComplete,
  nextHelpIndex,
  normalizeWord,
  slotOfLetter,
  slotOfWord,
} from '../logic/words';
import type { FoundWords } from '../types';

const stage = createGameModel('stage-game', {
  letters: ['ک', 'ت', 'ا', 'ب'],
  word: 'کتاب',
  additional_words: ['تاب', 'آب'],
  hidden_words: ['کتا'],
  additional_words_builded: ['تاب'],
  letters_help_used: [3],
});

const found = (patch: Partial<FoundWords> = {}): FoundWords => ({
  main: false,
  targets: new Set(),
  hidden: new Set(),
  ...patch,
});

describe('createGameModel', () => {
  it('snapshots the puzzle into plain arrays', () => {
    expect(stage.mainWord).toBe('کتاب');
    expect(stage.targetWords).toEqual(['تاب', 'آب']);
    expect([...stage.initialFound.targets]).toEqual(['تاب']);
    expect(stage.initialHelpUsed).toEqual([3]);
  });

  it('uses `words` and no main word in word-game', () => {
    const model = createGameModel('word-game', {
      letters: ['ا', 'ب'],
      word: 'ignored',
      words: ['اب', 'با'],
      words_builded: ['با'],
    });
    expect(model.mainWord).toBeNull();
    expect(model.targetWords).toEqual(['اب', 'با']);
    expect(model.initialFound.targets.has('با')).toBe(true);
  });
});

describe('evaluateWord', () => {
  it('treats آ and ا (and Arabic ي / ك) as the same letter', () => {
    expect(normalizeWord('آبي')).toBe(normalizeWord('ابی'));
    expect(evaluateWord('اب', stage, found())).toEqual({ verdict: 'success', kind: 'target', word: 'آب' });
  });

  it('checks the main word, then targets, then hidden words', () => {
    expect(evaluateWord('کتاب', stage, found()).kind).toBe('main');
    expect(evaluateWord('تاب', stage, found()).kind).toBe('target');
    expect(evaluateWord('کتا', stage, found()).kind).toBe('hidden');
    expect(evaluateWord('بات', stage, found()).verdict).toBe('error');
  });

  it('reports words found before as duplicates', () => {
    expect(evaluateWord('کتاب', stage, found({ main: true })).verdict).toBe('duplicate');
    expect(evaluateWord('تاب', stage, found({ targets: new Set(['تاب']) })).verdict).toBe('duplicate');
    expect(evaluateWord('کتا', stage, found({ hidden: new Set(['کتا']) })).verdict).toBe('duplicate');
  });
});

describe('isPuzzleComplete', () => {
  it('needs every target and the main word', () => {
    expect(isPuzzleComplete(stage, found({ targets: new Set(['تاب', 'آب']) }))).toBe(false);
    expect(isPuzzleComplete(stage, found({ main: true, targets: new Set(['تاب']) }))).toBe(false);
    expect(isPuzzleComplete(stage, found({ main: true, targets: new Set(['تاب', 'آب']) }))).toBe(true);
  });
});

describe('hints', () => {
  // کلمه‌ها: 'تاب' (اندیس 0 تا 2)، 'آب' (3 تا 4)، 'کتاب' (5 تا 8).
  it('reveals the next letter of the first unfound word, skipping found words', () => {
    const progress = found({ targets: new Set(['تاب']) });
    expect(nextHelpIndex(stage, progress, [3])).toBe(4);
    expect(nextHelpIndex(stage, progress, [3, 4])).toBe(5);
  });

  it('returns null once every unfound word is fully revealed', () => {
    const progress = found({ targets: new Set(['تاب', 'آب']) });
    expect(nextHelpIndex(stage, progress, [5, 6, 7, 8])).toBeNull();
    expect(nextHelpIndex(stage, found({ main: true, targets: progress.targets }), [])).toBeNull();
  });

  it('counts revealed letters per word', () => {
    expect(countHelpPerSlot(stage, [0, 3, 4, 5, 5])).toEqual([1, 2, 1]);
  });
});

describe('slots', () => {
  it('maps hint indices and found words to their slot', () => {
    expect([0, 2, 3, 4, 5, 8, 9].map(index => slotOfLetter(stage, index))).toEqual([0, 0, 1, 1, 2, 2, -1]);
    expect(slotOfLetter(stage, -1)).toBe(-1);
    expect(slotOfWord(stage, 'target', 'آب')).toBe(1);
    expect(slotOfWord(stage, 'main', 'کتاب')).toBe(2);
    expect(slotOfWord(stage, 'hidden', 'کتا')).toBe(-1);
    expect(foundPerSlot(stage, stage.initialFound)).toEqual([true, false, false]);
  });
});

describe('instantSubmitWords', () => {
  it('submits a complete word at once unless it starts a longer puzzle word', () => {
    // 'کتا' (پنهان) پیشوند 'کتاب' است، پس منتظر تایمر می‌ماند؛ 'آب' به شکل نرمال‌شده‌ی 'اب' ثبت می‌شود.
    expect(instantSubmitWords(stage).sort()).toEqual(['اب', 'تاب', 'کتاب'].sort());
  });

  it('keeps waiting for every prefix in a chain', () => {
    const model = createGameModel('word-game', { letters: ['ا', 'ب', 'ر', 'و'], words: ['ابر', 'ابرو', 'رو', 'ب'] });
    expect(instantSubmitWords(model).sort()).toEqual(['ابرو', 'رو', 'ب'].sort());
  });
});
