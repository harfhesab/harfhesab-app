import Realm, { BSON } from "realm";

export class UserPackage extends Realm.Object<UserPackage> {
  _id!: BSON.ObjectId;
  package_ref!: BSON.ObjectId;
  content_completed?: boolean;
  access_type!: "subscription" | "free" | "coin-payment";
  number_coin_paid?: number;
  last_season?: BSON.ObjectId;
  last_season_number?: number;
  last_stage?: BSON.ObjectId;
  last_stage_number?: number;
  ended_game?: Date;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  activation_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: "UserPackage",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      package_ref: "objectId",
      content_completed: "bool?",
      access_type: "string",
      number_coin_paid: "int?",
      last_season: "objectId?",
      last_season_number: "int?",
      last_stage: "objectId?",
      last_stage_number: "int?",
      ended_game: "date?",
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      activation_date: "date?",
      createdAt: "date?",
      updatedAt: "date?",
    },
  };
}