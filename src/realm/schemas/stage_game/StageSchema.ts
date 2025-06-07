import Realm from "realm";

export class Word extends Realm.Object<Word> {
  _id!: Realm.BSON.ObjectId;
  word!: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters?: string[];
  additional_words?: string[];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "Word",
    embedded: true,
    properties: {
      _id: "objectId",
      word: "string",
      word_hint: "string?",
      unknown_word: { type: "bool", default: false },
      letters: "string[]?",
      additional_words: "string[]?",
      order: "int?",
    },
  };
}

export class Part extends Realm.Object<Part> {
  _id!: Realm.BSON.ObjectId;
  sentence!: string;
  sentence_hint?: string;
  words!: Word[];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "Part",
    embedded: true,
    properties: {
      _id: "objectId",
      sentence: "string",
      sentence_hint: "string?",
      words: "Word[]",
      order: "int?",
    },
  };
}

export class Media extends Realm.Object<Media> {
  path!: string;
  order?: number;
  file_type?: string;
  duration?: string;

  static schema: Realm.ObjectSchema = {
    name: "Media",
    embedded: true,
    properties: {
      path: "string",
      order: "int?",
      file_type: "string?",
      duration: "string?",
    },
  };
}

export class Stage extends Realm.Object<Stage> {
  _id!: Realm.BSON.ObjectId;
  parts!: Part[];
  media!: Media[];
  voice!: Media[];
  stage_hint?: string;
  season!: Realm.BSON.ObjectId;
  language?: Realm.BSON.ObjectId;
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
      parts: "Part[]",
      media: "Media[]",
      voice: "Media[]",
      stage_hint: "string?",
      season: "objectId",
      language: "objectId?",
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
