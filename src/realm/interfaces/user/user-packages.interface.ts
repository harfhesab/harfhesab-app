import { BSON } from "realm";

export interface IUserPackages {
  _id: BSON.ObjectId;
  package: BSON.ObjectId;
  access_type: "subscription" | "free" | "coin-payment";
  last_season: BSON.ObjectId;
  last_season_number?: number;
  last_stage: BSON.ObjectId;
  last_stage_number?: number;
  createdAt: Date;
  updatedAt: Date;
}