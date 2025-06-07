import Realm from "realm";
import { StageGameVersionControl } from "./schemas/stage_game/StageGameVersionControlSchema";
import {
    Stage,
    Word,
    Part,
    Media
} from "./schemas/stage_game/StageSchema";
import {
  StageSeason,
  StageSeasonMedia,
  StageSeasonMusic,
} from "./schemas/stage_game/StageSeasonSchema";

const schemas = [
    StageGameVersionControl,
    /////////////////////////////
    Stage,
    Word,
    Part,
    Media,
    /////////////////////////////
    StageSeason,
    StageSeasonMedia,
    StageSeasonMusic,
    /////////////////////////////
];

let realmInstance: Realm | null = null;

export const getRealm = async (): Promise<Realm> => {
  if (realmInstance) return realmInstance;

  realmInstance = await Realm.open({
    schema: schemas,
    schemaVersion: 1,
  });

  return realmInstance;
};