import { BSON } from "realm";
import { IMedia } from "../general/embeddes/media.interface";
import { IPartStage } from "../general/embeddes/part-stage.interface";

export interface IKalamAkharChallenge {
  _id: BSON.ObjectId;
  title: string;
  description?: string;
  time_limit?: number;
  remaining_time_seconds?: number;
  remaining_synced_at?: Date;
  entry_fee_coins?: number;
  subscription_required?: boolean;
  reward_coins?: number;
  reward_subscription?: number;
  end_date?: Date;
  parts: IPartStage[];
  media: IMedia[];
  voice: IMedia[];
  stage_hint?: string;
  language_ref?: BSON.ObjectId;
  expiration: Date;
}