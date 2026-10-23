import type { FoundWords, GameModel, GameType, LettersData, Verdict } from '../types';

const GAME_TYPES: readonly GameType[] = ['stage-game', 'package-game', 'harf-akhar', 'word-game'];

const toArray = <T>(list: ArrayLike<T> | null | undefined): T[] => (list ? Array.from(list) : []);

/**
 * یک کپی ساده و یک‌باره (JS خالص) از معما می‌گیرد. `data` معمولاً یک آبجکت زنده‌ی Realm است:
 * با ذخیره‌ی پیشرفت تغییر می‌کند و نمی‌تواند وارد worklet شود؛ پس بعد از mount هیچ جا خوانده نمی‌شود.
 */
export function createGameModel(type: string, data: LettersData): GameModel {
  const gameType: GameType = (GAME_TYPES as readonly string[]).includes(type)
    ? (type as GameType)
    : 'stage-game';
  const isWordGame = gameType === 'word-game';
  const targetWords = toArray(isWordGame ? data.words : data.additional_words);
  const foundTargets = toArray(data.additional_words_builded);
  if (isWordGame) {
    // پیشرفت word-game بسته به صفحه ممکن است با هر کدام از این دو کلید ذخیره شده باشد.
    foundTargets.push(...toArray(data.words_builded));
  }

  return {
    type: gameType,
    letters: toArray(data.letters),
    mainWord: !isWordGame && data.word ? data.word : null,
    targetWords,
    hiddenWords: toArray(data.hidden_words),
    initialFound: {
      main: Boolean(data.word_builded),
      targets: new Set(foundTargets),
      hidden: new Set(toArray(data.hidden_words_builded)),
    },
    initialHelpUsed: toArray(data.letters_help_used),
  };
}

/** شکل‌های املایی‌ای را که بازیکن روی کارت از هم تشخیص نمی‌دهد یکی می‌کند. */
export function normalizeWord(text: string): string {
  return text
    .replace(/[آأإ]/g, 'ا')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, '');
}

export type WordKind = 'main' | 'target' | 'hidden';

export interface Evaluation {
  verdict: Verdict;
  kind: WordKind | null;
  /** املای خودِ معما برای کلمه‌ی پیداشده. */
  word: string | null;
}

export function evaluateWord(input: string, model: GameModel, found: FoundWords): Evaluation {
  const key = normalizeWord(input);
  const matches = (candidate: string) => normalizeWord(candidate) === key;

  if (model.mainWord !== null && matches(model.mainWord)) {
    return { verdict: found.main ? 'duplicate' : 'success', kind: 'main', word: model.mainWord };
  }
  const target = model.targetWords.find(matches);
  if (target !== undefined) {
    return { verdict: found.targets.has(target) ? 'duplicate' : 'success', kind: 'target', word: target };
  }
  const hidden = model.hiddenWords.find(matches);
  if (hidden !== undefined) {
    return { verdict: found.hidden.has(hidden) ? 'duplicate' : 'success', kind: 'hidden', word: hidden };
  }
  return { verdict: 'error', kind: null, word: null };
}

export function isPuzzleComplete(model: GameModel, found: FoundWords): boolean {
  const allTargets = model.targetWords.every(word => found.targets.has(word));
  return model.mainWord === null ? allTargets : allTargets && found.main;
}

/**
 * کلمه‌هایی که ردیف خانه دارند، به همان ترتیبی که اندیس‌های راهنما به آن‌ها اشاره می‌کنند:
 * اول کلمه‌های هدف، بعد کلمه‌ی اصلی. (اندیس‌های `letters_help_used` جایگاه حرف در رشته‌ی
 * پشت‌سرهمِ این کلمه‌ها هستند؛ پیشرفت ذخیره‌شده‌ی فعلی هم همین‌طور است.)
 */
export function slotWords(model: GameModel): string[] {
  return model.mainWord === null ? [...model.targetWords] : [...model.targetWords, model.mainWord];
}

function isSlotFound(model: GameModel, found: FoundWords, slot: number): boolean {
  return slot < model.targetWords.length ? found.targets.has(model.targetWords[slot]) : found.main;
}

/** اندیس حرف بعدی که راهنما باید آشکار کند، یا `null` اگر همه‌ی کلمه‌های پیدانشده کامل آشکار شده باشند. */
export function nextHelpIndex(model: GameModel, found: FoundWords, used: readonly number[]): number | null {
  const usedSet = new Set(used);
  let offset = 0;
  for (const [slot, word] of slotWords(model).entries()) {
    if (!isSlotFound(model, found, slot)) {
      for (let index = offset; index < offset + word.length; index++) {
        if (!usedSet.has(index)) {
          return index;
        }
      }
    }
    offset += word.length;
  }
  return null;
}

/** کلمه‌ای (به ترتیب `slotWords`) که حرفِ شماره‌ی `index` در رشته‌ی پشت‌سرهمِ کلمه‌ها به آن تعلق دارد، یا -1. */
export function slotOfLetter(model: GameModel, index: number): number {
  const words = slotWords(model);
  let end = 0;
  for (let slot = 0; slot < words.length; slot++) {
    end += words[slot].length;
    if (index < end) {
      return index >= 0 ? slot : -1;
    }
  }
  return -1;
}

/** تعداد حروف ابتدایی هر کلمه که با راهنما آشکار شده‌اند. */
export function countHelpPerSlot(model: GameModel, used: readonly number[]): number[] {
  const counts = new Array<number>(slotWords(model).length).fill(0);
  for (const index of new Set(used)) {
    const slot = slotOfLetter(model, index);
    if (slot !== -1) {
      counts[slot]++;
    }
  }
  return counts;
}

/** خانه‌های کدام کلمه‌ها پر هستند (به ترتیب `slotWords`). */
export function foundPerSlot(model: GameModel, found: FoundWords): boolean[] {
  return slotWords(model).map((_, slot) => isSlotFound(model, found, slot));
}

/** ردیفِ خانه‌های یک کلمه‌ی پیداشده، یا -1 برای کلمه‌های پنهان (که خانه ندارند). */
export function slotOfWord(model: GameModel, kind: WordKind, word: string): number {
  if (kind === 'main') {
    return model.targetWords.length;
  }
  return kind === 'target' ? model.targetWords.indexOf(word) : -1;
}

/**
 * کلمه‌هایی (نرمال‌شده) که به محض کامل شدن، بدون انتظار برای تایمر ثبت می‌شوند: هر کلمه‌ی معما —
 * اصلی، هدف یا پنهان — که پیشوندِ کلمه‌ی بلندترِ دیگری در معما نباشد؛ وگرنه شاید بازیکن هنوز در حال
 * ساختن آن کلمه‌ی بلندتر باشد.
 */
export function instantSubmitWords(model: GameModel): string[] {
  const words = [...new Set([...slotWords(model), ...model.hiddenWords].map(normalizeWord))]
    .filter(word => word.length > 0)
    .sort();
  // در ترتیب الفبایی، کلمه‌هایی که با `word` شروع می‌شوند درست بعد از خودِ `word` می‌آیند.
  return words.filter((word, i) => !(i + 1 < words.length && words[i + 1].startsWith(word)));
}
