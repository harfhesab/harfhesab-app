import { createRealmContext } from "@realm/react";
import { StageGameVersionControl } from "../schemas/stage-game/StageGameVersionControlSchema";
import { StageSeason } from "../schemas/stage-game/StageSeasonSchema";
import { Stage } from "../schemas/stage-game/StageSchema";
import { Media } from "../schemas/general/embeddeds/MediaSchema";
import { PartStage, WordStage } from "../schemas/general/embeddeds/PartStageSchema";
import { Language } from "../schemas/general/LanguageSchema";
import { PackageSeason, SeasonNumberInPackage } from "../schemas/package-game/PackageSeasonSchema";
import { PackageStage } from "../schemas/package-game/PackageStageSchema";
import { Package, SeasonInPackage, TakenSource } from "../schemas/package-game/PackageSchema";

export const RealmContext = createRealmContext({
  schema: [
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
    TakenSource
  ],
  schemaVersion: 1,
});

export const {
  RealmProvider,
  useRealm,
  useQuery,
  useObject,
} = RealmContext;