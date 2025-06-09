import { BSON } from "realm";

export interface IWordStage {
  _id: BSON.ObjectId;
  word: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters: string[]; 
  additional_words: string[];
  order?: number;
}

export interface IPartStage {
  _id: BSON.ObjectId;
  sentence: string;
  sentence_hint?: string;
  words: IWordStage[];
  order?: number;
}