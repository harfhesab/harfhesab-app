import Realm, { BSON } from "realm";
import { Media } from "../general/embeddeds/MediaSchema";
import { PartStage } from "../general/embeddeds/PartStageSchema";

export class KalamAkharChallenge extends Realm.Object<KalamAkharChallenge> {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  time_limit?: number;
  remaining_time_seconds?: number;
  remaining_synced_at?: Date;
  entry_fee_coins?: number;
  subscription_required?: boolean;
  reward_coins?: number;
  reward_subscription?: number;
  end_date?: Date;
  parts!: PartStage[];
  media!: Media[];
  voice!: Media[];
  stage_hint?: string;
  language_ref?: BSON.ObjectId;
  expiration!: Date;
  static schema: Realm.ObjectSchema = {
    name: "KalamAkharChallenge",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      title: "string",
      description: "string?",
      time_limit: "int?",
      remaining_time_seconds: "int?",
      remaining_synced_at: "date?",
      entry_fee_coins: "int?",
      subscription_required: "bool?",
      reward_coins: "int?",
      reward_subscription: "int?",
      end_date: "date?",
      parts: "PartStage[]",
      media: "Media[]",
      voice: "Media[]",
      stage_hint: "string?",
      language_ref: "objectId?",
      expiration: "date",
    },
  };
}
