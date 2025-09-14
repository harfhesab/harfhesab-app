import Realm, { BSON } from "realm";

export class Language extends Realm.Object<Language> {
  _id!: BSON.ObjectId;
  name!: string;
  badg?: string;
  icon_image?: string;
  stage_game?: boolean;
  package_game?: boolean;
  code!: string;
  rtl!: boolean;
  ltr!: boolean;
  is_visible!: boolean;
  is_active!: boolean;
  order?: number;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Language",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      name: "string",
      badg: "string?",
      icon_image: "string?",
      stage_game: { type: "bool", optional: true },
      package_game: { type: "bool", optional: true },
      code: "string",
      rtl: { type: "bool", default: true },
      ltr: { type: "bool", default: false },
      is_visible: { type: "bool", default: false },
      is_active: { type: "bool", default: false },
      order: "int?",
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: { type: "date", default: () => new Date() },
      updatedAt: { type: "date", default: () => new Date() },
    },
  };
}
