export interface IWordStage {
  _id: string;
  word: string;
  word_builded?: boolean;
  word_hint?: string;
  unknown_word?: boolean;
  unknown_word_completed?: boolean;
  letters: string[]; 
  additional_words: string[];
  additional_words_builded?: string[];
  hidden_words: string[];
  hidden_words_builded?: string[];
  order?: number;
}

export interface IPartStage {
  _id: string;
  sentence: string;
  sentence_builded?: boolean;
  sentence_hint?: string;
  words: IWordStage[];
  order?: number;
}