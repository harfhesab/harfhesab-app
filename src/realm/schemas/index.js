import { StageGameVersionControl } from "./stage-game/StageGameVersionControlSchema";
import { StageSeason } from "./stage-game/StageSeasonSchema";
import { Stage } from "./stage-game/StageSchema";
import { Media } from "./general/embeddeds/MediaSchema";
import { PartStage, WordStage } from "./general/embeddeds/PartStageSchema";
import { Language } from "./general/LanguageSchema";
import { PackageSeason } from "./package-game/PackageSeasonSchema";
import { PackageStage } from "./package-game/PackageStageSchema";
import { Package } from "./package-game/PackageSchema";
import { UserStageGameProgress } from "./user/UserStageGameProgressSchema";
import { UserPackage } from "./user/UserPackageSchema";
import { CoinPlan } from "./user/CoinPlanSchema";
import { SubscriptionPlan } from "./user/SubscriptionPlanSchema";

export const realmSchemas = [
  StageGameVersionControl,
  StageSeason,
  Stage,
  PartStage,
  WordStage,
  Media,
  Language,
  PackageSeason,
  PackageStage,
  Package,
  UserStageGameProgress,
  UserPackage,
  CoinPlan,
  SubscriptionPlan
];