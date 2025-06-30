import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";

export class PackageSeason extends Realm.Object<PackageSeason> {
  _id!: BSON.ObjectId;
  package!: BSON.ObjectId[];
  title!: string;
  description?: string;
  language_ref?: BSON.ObjectId;
  media!: Media[];
  music?: Media;
  badg?: string;
  season_number!: SeasonNumberInPackage[];
  number_stage?: number;
  is_visible: boolean = true;
  is_active: boolean = true;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "PackageSeason",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      package: "objectId[]",
      title: "string",
      description: "string?",
      language_ref: "objectId?",
      media: "Media[]",
      music: "Media",
      badg: "string?",
      season_number: "SeasonNumberInPackage[]",
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

export class SeasonNumberInPackage extends Realm.Object<SeasonNumberInPackage> {
  package!: BSON.ObjectId;
  season_number!: number;
  stage_number_from!: number;
  stage_number_to!: number;

  static schema: Realm.ObjectSchema = {
    name: "SeasonNumberInPackage",
    embedded: true,
    properties: {
      package: "objectId",
      season_number: "int",
      stage_number_from: "int",
      stage_number_to: "int",
    },
  };
}
