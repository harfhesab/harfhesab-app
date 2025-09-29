import { BSON } from "realm";

export interface IUserPackage {
  _id: BSON.ObjectId;
  package_ref: BSON.ObjectId;
  content_completed?: boolean;
  access_type: "subscription" | "free" | "coin-payment";
  last_season?: BSON.ObjectId;
  last_season_number?: number;
  last_stage?: BSON.ObjectId;
  last_stage_number?: number;
  createdAt: Date;
  updatedAt: Date;
}