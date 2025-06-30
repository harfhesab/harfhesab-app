import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";

export interface IPackageSeason {
  _id?: BSON.ObjectId;
  package: BSON.ObjectId[];
  title: string;
  description?: string;
  language_ref?: BSON.ObjectId;
  media: IMedia[];
  music?: IMedia;
  badg?: string;
  season_number: ISeasonNumberInPackage[];
  number_stage?: number;
  is_visible?: boolean;
  is_active?: boolean;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISeasonNumberInPackage {
  package: BSON.ObjectId;
  season_number: number;
  stage_number_from: number;
  stage_number_to: number;
}