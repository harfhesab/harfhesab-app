import { BSON, Realm } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";
import { PartStage } from "../general/embeddeds/PartStageSchema";

export class PackageStage extends Realm.Object<PackageStage> {
  _id!: BSON.ObjectId;
  parts!: PartStage[];
  media!: Media[];
  voice!: Media[];
  stage_hint?: string;
  season!: BSON.ObjectId;
  language?: BSON.ObjectId;
  stage_number!: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: "PackageStage",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      parts: "PartStage[]",
      media: "Media[]",
      voice: "Media[]",
      stage_hint: "string?",
      season: "objectId",
      language: "objectId?",
      stage_number: "int",
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
