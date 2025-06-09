import { BSON } from "realm";

export interface ILanguage {
  _id: BSON.ObjectId;
  name: string;
  badg?: string;
  stage_game?: boolean;
  package_game?: boolean;
  code: string;
  rtl: boolean;
  ltr: boolean;
  is_visible: boolean;
  is_active: boolean;
  order?: number;
  version_created?: number;
  version_updated?: number;
  version_deleted?: number;
  createdAt: Date;
  updatedAt: Date;
}
