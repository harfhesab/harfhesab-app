export interface IWordStage {
  _id: string;
  word: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters: string[]; 
  additional_words: string[];
  hidden_words: string[];
  order?: number;
}

export interface IPartStage {
  _id: string;
  sentence: string;
  sentence_hint?: string;
  words: IWordStage[];
  order?: number;
}