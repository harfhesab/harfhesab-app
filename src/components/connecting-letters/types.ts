export type GameType = 'stage-game' | 'package-game' | 'harf-akhar' | 'word-game';

/**
 * ساختار رکورد معمایی که صفحه‌ها می‌فرستند (معمولاً یک آبجکت زنده‌ی Realm).
 * فقط یک بار، هنگام mount، خوانده می‌شود — `createGameModel` را ببینید.
 */
export interface LettersData {
  letters: ArrayLike<string>;
  word?: string;
  additional_words?: ArrayLike<string>;
  hidden_words?: ArrayLike<string>;
  /** کلمه‌های هدف حالت «word-game» (این حالت کلمه‌ی اصلی ندارد). */
  words?: ArrayLike<string>;
  word_builded?: boolean;
  additional_words_builded?: ArrayLike<string>;
  hidden_words_builded?: ArrayLike<string>;
  words_builded?: ArrayLike<string>;
  letters_help_used?: ArrayLike<number>;
}

export interface ConnectingLettersProps {
  type: GameType | string;
  data: LettersData;
  timeLimitData?: {
    time_limit?: number;
    remaining_time_seconds?: number;
    remaining_synced_at?: number;
  };
  stageNumber: number | undefined;
  saveMainWordBuilded: () => void;
  saveNewAdditionalWordsBuilded: (word: string) => void;
  saveNewHiddenWordsBuilded: (word: string) => void;
  completedOperation: () => void;
  saveUserHelpRequests: (newLettersHelpUsed: number[]) => void;
  gameTimeIsOver?: () => void;
}

export interface FoundWords {
  main: boolean;
  /** کلمه‌های هدفی که تا الان پیدا شده‌اند (`additional_words`، یا `words` در word-game). */
  targets: ReadonlySet<string>;
  hidden: ReadonlySet<string>;
}

/** کپی JS خالص از یک معما؛ امن برای ارسال به worklet و نگه داشتن بین رندرها. */
export interface GameModel {
  type: GameType;
  letters: readonly string[];
  /** کلمه‌ی نامعلوم؛ در word-game برابر `null`. */
  mainWord: string | null;
  targetWords: readonly string[];
  hiddenWords: readonly string[];
  initialFound: FoundWords;
  initialHelpUsed: readonly number[];
}

export type Verdict = 'success' | 'error' | 'duplicate';

/** آنچه نوار «کلمه‌ی فعلی» نشان می‌دهد. */
export interface WordBarState {
  letters: readonly string[];
  verdict: Verdict | null;
  fading: boolean;
  /** با شروع هر کلمه‌ی جدید عوض می‌شود تا مهره‌های حروف انیمیشن ورودشان را دوباره پخش کنند. */
  key: number;
}
