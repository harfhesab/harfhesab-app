import { IMediaType } from "../general/embeddes/MediaTypes";

export interface IStageSeason {
  _id?: Realm.BSON.ObjectId;
  title: string;
  description?: string;
  language?: Realm.BSON.ObjectId;

  media: IMediaType[];
  music?: IMediaType;

  badg?: string;
  season_number?: number;
  stage_number_from?: number;
  stage_number_to?: number;
  number_stage?: number;

  is_visible?: boolean;
  is_active?: boolean;

  content_source_type: "original" | "derived" | "copy";
  publication_status: "draft" | "ready" | "published" | "archived" | "rejected";
  completion_status: "incomplete" | "in_progress" | "complete" | "finalized";

  version_created?: number;
  version_updated?: number;
  version_deleted?: number;

  createdAt: Date;
  updatedAt: Date;
}
