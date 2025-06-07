import { BSON, Realm } from "realm";

export class StageSeason extends Realm.Object<StageSeason> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  language?: BSON.ObjectId;
  media!: {
    path: string;
    order?: number;
    file_type?: string;
    duration?: string;
  }[];
  music?: {
    path?: string;
    file_type?: string;
    duration?: string;
  };
  badg?: string;
  season_number?: number;
  stage_number_from?: number;
  stage_number_to?: number;
  number_stage?: number;
  is_visible: boolean = false;
  is_active: boolean = false;
  content_source_type!: "original" | "derived" | "copy";
  publication_status!: "draft" | "ready" | "published" | "archived" | "rejected";
  completion_status!: "incomplete" | "in_progress" | "complete" | "finalized";
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "StageSeason",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      title: "string",
      description: "string?",
      language: "objectId?",
      media: {
        type: "list",
        objectType: "StageSeasonMedia",
      },
      music: "StageSeasonMusic?",
      badg: "string?",
      season_number: "int?",
      stage_number_from: "int?",
      stage_number_to: "int?",
      number_stage: "int?",
      is_visible: { type: "bool", default: false },
      is_active: { type: "bool", default: false },
      content_source_type: "string?",
      publication_status: "string?",
      completion_status: "string?",
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}

// Embedded object for media
export class StageSeasonMedia extends Realm.Object<StageSeasonMedia> {
  path!: string;
  order?: number;
  file_type?: string;
  duration?: string;

  static schema: Realm.ObjectSchema = {
    name: "StageSeasonMedia",
    embedded: true,
    properties: {
      path: "string",
      order: "int?",
      file_type: "string?",
      duration: "string?",
    },
  };
}

// Embedded object for music
export class StageSeasonMusic extends Realm.Object<StageSeasonMusic> {
  path?: string;
  file_type?: string;
  duration?: string;

  static schema: Realm.ObjectSchema = {
    name: "StageSeasonMusic",
    embedded: true,
    properties: {
      path: "string?",
      file_type: "string?",
      duration: "string?",
    },
  };
}
