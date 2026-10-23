import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";

export class WordGameSeason extends Realm.Object<WordGameSeason> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  language_ref?: BSON.ObjectId;
  media!: Media[];
  music?: Media;
  badge?: string;
  season_number?: number;
  stage_number_from?: number;
  stage_number_to?: number;
  number_stage?: number;
  is_visible: boolean = true;
  is_active: boolean = true;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "WordGameSeason",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      title: "string",
      description: "string?",
      language_ref: "objectId?",
      media: "Media[]",
      music: "Media",
      badge: "string?",
      season_number: "int?",
      stage_number_from: "int?",
      stage_number_to: "int?",
      number_stage: "int?",
      is_visible: { type: "bool", default: true },
      is_active: { type: "bool", default: true },
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}
