import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";

export interface IWordGameStage {
  _id: BSON.ObjectId;
  letters: string[];
  letters_help_used?: number[];
  words: string[];
  words_builded?: string[];
  hidden_words: string[];
  hidden_words_builded?: string[];
  media: IMedia[];
  voice: IMedia[];
  season: BSON.ObjectId;
  language_ref?: BSON.ObjectId;
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