import { BSON } from "realm";

export interface IUserPackage {
  _id: BSON.ObjectId;
  package_ref: BSON.ObjectId;
  content_completed?: boolean;
  access_type: "subscription" | "free" | "coin-payment";
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
  createdAt: Date;
  updatedAt: Date;
}