import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";

export class WordGameStage extends Realm.Object<WordGameStage> {
  _id!: BSON.ObjectId;
  letters!: string[];
  letters_help_used?: number[] = [];
  words!: string[];
  words_builded?: string[] = [];
  hidden_words!: string[];
  hidden_words_builded?: string[] = [];
  media!: Media[];
  voice!: Media[];
  season!: BSON.ObjectId;
  language_ref?: BSON.ObjectId;
  stage_number_in_language!: number;
  stage_number_in_season!: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: "WordGameStage",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      letters: "string[]",
      letters_help_used: "int[]",
      words: "string[]",
      words_builded: "string[]",
      hidden_words: "string[]",
      hidden_words_builded: "string[]",
      media: "Media[]",
      voice: "Media[]",
      season: "objectId",
      language_ref: "objectId?",
      stage_number_in_language: "int",
      stage_number_in_season: "int",
      is_visible: { type: "bool", default: true },
      is_active: { type: "bool", default: true },
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: "date?",
      updatedAt: "date?",
    },
  };
}
