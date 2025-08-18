import { StageGameVersionControl } from "./stage-game/StageGameVersionControlSchema";
import { StageSeason } from "./stage-game/StageSeasonSchema";
import { Stage } from "./stage-game/StageSchema";
import { Media } from "./general/embeddeds/MediaSchema";
import { PartStage, WordStage } from "./general/embeddeds/PartStageSchema";
import { Language } from "./general/LanguageSchema";
import { PackageSeason, SeasonNumberInPackage } from "./package-game/PackageSeasonSchema";
import { PackageStage } from "./package-game/PackageStageSchema";
import { Package, SeasonInPackage, TakenSource } from "./package-game/PackageSchema";
import { UserStageGameProgress } from "./user/UserStageGameProgressSchema";

export const realmSchemas = [
  StageGameVersionControl,
  StageSeason,
  Stage,
  PartStage,
  WordStage,
  Media,
  Language,
  PackageSeason,
  SeasonNumberInPackage,
  PackageStage,
  Package,
  SeasonInPackage,
  TakenSource,
  UserStageGameProgress,
];