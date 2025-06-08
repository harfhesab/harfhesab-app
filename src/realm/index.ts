import Realm from "realm";
import { StageGameVersionControl } from "./schemas/stage_game/StageGameVersionControlSchema";
import { StageSeason } from "./schemas/stage_game/StageSeasonSchema";
import { Stage } from "./schemas/stage_game/StageSchema";
import { Media } from "./schemas/general/embeddeds/MediaSchema";
import { PartStage, WordStage } from "./schemas/general/embeddeds/PartStageSchema";
import { Language } from "./schemas/general/LanguageSchema";
import { PackageSeason, SeasonNumberInPackage } from "./schemas/package_game/PackageSeasonSchema";
import { PackageStage } from "./schemas/package_game/PackageStageSchema";

const schemas = [
    StageGameVersionControl,
    StageSeason,
    Stage,
    /////////////////////////////
    PartStage,
    WordStage,
    Media,
    /////////////////////////////
    Language,
    /////////////////////////////
    PackageSeason,
    SeasonNumberInPackage,
    PackageStage
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