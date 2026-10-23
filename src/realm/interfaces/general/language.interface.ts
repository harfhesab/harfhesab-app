import { BSON } from "realm";

export interface ILanguage {
  _id: BSON.ObjectId;
  name: string;
  badge?: string;
  icon_image?: string;
  stage_game?: boolean;
  stage_game_active?: boolean;
  word_game?: boolean;
  word_game_active?: boolean;
  package_game?: boolean;
  package_game_active?: boolean;
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
