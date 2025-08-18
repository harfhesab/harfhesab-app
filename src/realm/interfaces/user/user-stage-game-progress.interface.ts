import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";

export interface IUserStageGameProgress {
  _id: BSON.ObjectId;
  language_ref: BSON.ObjectId;
  last_season: BSON.ObjectId;
  last_season_number?: number;
  last_stage: BSON.ObjectId;
  last_stage_number?: number;
  createdAt: Date;
  updatedAt: Date;
}