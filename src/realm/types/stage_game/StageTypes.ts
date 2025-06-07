import { BSON } from "realm";

export interface WordType {
  _id: BSON.ObjectId;
  word: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters?: string[];
  additional_words?: string[];
  order?: number;
};

export interface PartType {
  _id: BSON.ObjectId;
  sentence: string;
  sentence_hint?: string;
  words: WordType[];
  order?: number;
};

export interface MediaType {
  path: string;
  order?: number;
  file_type?: string;
  duration?: string;
};

export interface IStageType {
  _id: BSON.ObjectId;
  parts: PartType[];
  media: MediaType[];
  voice: MediaType[];
  stage_hint?: string;
  season: BSON.ObjectId;
  language?: BSON.ObjectId;
  stage_number_in_language: number;
  stage_number_in_season: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;
}