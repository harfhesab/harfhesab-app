import Realm, { BSON } from "realm";

export class UserStageGameProgress extends Realm.Object<UserStageGameProgress> {
  _id!: BSON.ObjectId;
  language_ref!: BSON.ObjectId;
  last_season?: BSON.ObjectId;
  last_season_number?: number;
  last_stage?: BSON.ObjectId;
  last_stage_number?: number;
  solved_parts!:SolvedPartsInUserStageGameProgress[];
  createdAt?: Date;
  updatedAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: "UserStageGameProgress",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      language_ref: "objectId",
      last_season: "objectId?",
      last_season_number: "int?",
      last_stage: "objectId?",
      last_stage_number: "int?",
      solved_parts: "SolvedPartsInUserStageGameProgress[]",
      createdAt: "date?",
      updatedAt: "date?",
    },
  };
}

export class SolvedPartsInUserStageGameProgress extends Realm.Object<SolvedPartsInUserStageGameProgress> {
  part!: string;
  complated_part!: boolean;
  solved_word!:string[];

  static schema: Realm.ObjectSchema = {
    name: "SolvedPartsInUserStageGameProgress",
    embedded: true,
    properties: {
      part: "string",
      complated_part : "bool",
      solved_word: "string[]"
    },
  };
}