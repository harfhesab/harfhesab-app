import { BSON } from "realm";

export interface IStageGameVersionControl {
  _id: BSON.ObjectId;
  version_created: number;
  version_updated: number;
  version_deleted: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}