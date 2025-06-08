import { BSON } from "realm";

export interface IWordStageType {
  _id: BSON.ObjectId;
  word: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters: string[]; 
  additional_words: string[];
  order?: number;
}

export interface IPartStageType {
  _id: BSON.ObjectId;
  sentence: string;
  sentence_hint?: string;
  words: IWordStageType[];
  order?: number;
}