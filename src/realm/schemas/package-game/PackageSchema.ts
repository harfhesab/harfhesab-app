import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";

export class SeasonInPackage extends Realm.Object<SeasonInPackage> {
  package_season!: BSON.ObjectId;
  season_number!: number;
  stage_number_from!: number;
  stage_number_to!: number;

  static schema: Realm.ObjectSchema = {
    name: "SeasonInPackage",
    embedded: true,
    properties: {
      package_season: "objectId",
      season_number: "int",
      stage_number_from: "int",
      stage_number_to: "int",
    },
  };
}

export class TakenSource extends Realm.Object<TakenSource> {
  title?: string;
  poet?: string;
  author?: string;
  literary_form?: string;

  static schema: Realm.ObjectSchema = {
    name: "TakenSource",
    embedded: true,
    properties: {
      title: "string?",
      poet: "string?",
      author: "string?",
      literary_form: "string?",
    },
  };
}

export class Package extends Realm.Object<Package> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  subject?: string;
  badg?: string;
  seasons!: SeasonInPackage[];
  taken_source?: TakenSource;
  content_source_type!: "original" | "derived" | "copy";
  publication_status!: "draft" | "ready" | "published" | "archived" | "rejected";
  completion_status!: "incomplete" | "in_progress" | "complete" | "finalized";
  language?: BSON.ObjectId;
  topic_category!: BSON.ObjectId[];
  package_collection!: BSON.ObjectId[];
  icon_image?: string;
  banner_image?: string;
  music?: Media;
  free!: boolean;
  free_with_subscription!: boolean;
  price!: number;
  testable!: boolean;
  number_stage?: number;
  number_season?: number;
  is_visible!: boolean;
  is_active!: boolean;
  order?: number;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Package",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      title: "string",
      description: "string?",
      subject: "string?",
      badg: "string?",
      seasons: "SeasonInPackage[]",
      taken_source: "TakenSource?",
      content_source_type: "string",
      publication_status: "string",
      completion_status: "string",
      language: "objectId?",
      topic_category: "objectId[]",
      package_collection: "objectId[]",
      icon_image: "string?",
      banner_image: "string?",
      music: "Media?",
      free: { type: "bool", default: false },
      free_with_subscription: { type: "bool", default: true },
      price: { type: "double", default: 0 },
      testable: { type: "bool", default: true },
      number_stage: "int?",
      number_season: "int?",
      is_visible: { type: "bool", default: false },
      is_active: { type: "bool", default: false },
      order: "int?",
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}