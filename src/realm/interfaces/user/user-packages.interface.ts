import { BSON } from "realm";

export interface IUserPackages {
  _id: BSON.ObjectId;
  package: BSON.ObjectId;
  last_season: BSON.ObjectId;
  last_season_number?: number;
  last_stage: BSON.ObjectId;
  last_stage_number?: number;
  createdAt: Date;
  updatedAt: Date;
}