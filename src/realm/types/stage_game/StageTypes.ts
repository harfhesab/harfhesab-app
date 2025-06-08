import { BSON } from "realm";
import { IMediaType } from "../general/embeddes/MediaTypes";
import { IPartStageType } from "../general/embeddes/PartStageTypes";

export interface IStageType {
  _id: BSON.ObjectId;
  parts: IPartStageType[];
  media: IMediaType[];
  voice: IMediaType[];
  stage_hint?: string;
  season: BSON.ObjectId;
  language?: BSON.ObjectId;
  stage_number_in_language: number;
  stage_number_in_season: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt?: Date;
  updatedAt?: Date;
}