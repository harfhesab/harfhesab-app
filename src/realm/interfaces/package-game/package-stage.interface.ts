import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";
import { IPartStage } from "../general/embeddes/part-stage.interface";

export interface IPackageStage {
  _id: BSON.ObjectId;
  parts: IPartStage[];
  media: IMedia[];
  voice: IMedia[];
  stage_hint?: string;
  season: BSON.ObjectId;
  language?: BSON.ObjectId;
  stage_number: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;
}