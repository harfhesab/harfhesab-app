import Realm, { BSON } from "realm";
import { Package } from "../package-game/PackageSchema";

export class UserPackages extends Realm.Object<UserPackages> {
  _id!: BSON.ObjectId;
  package_ref!: BSON.ObjectId;
  access_type!: "subscription" | "free" | "coin-payment";
  last_season?: BSON.ObjectId;
  last_season_number?: number;
  last_stage?: BSON.ObjectId;
  last_stage_number?: number;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: "UserPackages",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      package_ref: "objectId",
      access_type: "string",
      last_season: "objectId?",
      last_season_number: "int?",
      last_stage: "objectId?",
      last_stage_number: "int?",
      version_created: "int?",
      version_updated: "int?",
      version_deleted: "int?",
      createdAt: "date?",
      updatedAt: "date?",
    },
  };
}