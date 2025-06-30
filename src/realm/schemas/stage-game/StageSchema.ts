import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";
import { PartStage } from "../general/embeddeds/PartStageSchema";

export class Stage extends Realm.Object<Stage> {
  _id!: BSON.ObjectId;
  parts!: PartStage[];
  media!: Media[];
  voice!: Media[];
  stage_hint?: string;
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
    name: "Stage",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      parts: "PartStage[]",
      media: "Media[]",
      voice: "Media[]",
      stage_hint: "string?",
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
