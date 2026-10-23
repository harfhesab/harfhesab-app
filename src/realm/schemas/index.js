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
import { HarfAkharChallenge } from "./harf-akhar/HarfAkharChallengeSchema";
import { WordGameSeason } from "./word-game/WordGameSeasonSchema";
import { WordGameStage } from "./word-game/WordGameStageSchema";
import { WordGameVersionControl } from "./word-game/WordGameVersionControlSchema";
import { UserWordGameProgress } from "./user/UserWordGameProgressSchema";

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
  SubscriptionPlan,
  HarfAkharChallenge,
  WordGameSeason,
  WordGameStage,
  WordGameVersionControl,
  UserWordGameProgress
];