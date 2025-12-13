import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";

export class Package extends Realm.Object<Package> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  subject?: string;
  badge?: string;
  language_ref?: BSON.ObjectId;
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
      badge: "string?",
      language_ref: "objectId?",
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
      createdAt: "date",
      updatedAt: "date",
    },
  };
}