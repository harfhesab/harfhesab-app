import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";

export interface ISeasonInPackage {
  package_season: BSON.ObjectId;
  season_number: number;
  stage_number_from: number;
  stage_number_to: number;
}

export interface ITakenSource {
  title?: string;
  poet?: string;
  author?: string;
  literary_form?: string;
}

export interface IPackage {
  _id: BSON.ObjectId;
  title: string;
  description?: string;
  subject?: string;
  badg?: string;
  seasons: ISeasonInPackage[];
  taken_source?: ITakenSource;
  content_source_type: "original" | "derived" | "copy";
  publication_status: "draft" | "ready" | "published" | "archived" | "rejected";
  completion_status: "incomplete" | "in_progress" | "complete" | "finalized";
  language?: BSON.ObjectId;
  topic_category: BSON.ObjectId[];
  package_collection: BSON.ObjectId[];
  icon_image?: string;
  banner_image?: string;
  music?: IMedia;
  free: boolean;
  free_with_subscription: boolean;
  price: number;
  testable: boolean;
  number_stage?: number;
  number_season?: number;
  is_visible: boolean;
  is_active: boolean;
  order?: number;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt: Date;
  updatedAt: Date;
}
