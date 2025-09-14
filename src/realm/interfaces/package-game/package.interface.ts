import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";

export interface IPackage {
  _id: BSON.ObjectId;
  title: string;
  description?: string;
  subject?: string;
  badg?: string;
  language_ref?: BSON.ObjectId;
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
