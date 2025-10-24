import Realm, { BSON } from "realm";
import { UserPackage } from "../../schemas/user/UserPackageSchema";
import { Package } from "../../schemas/package-game/PackageSchema";
import { PackageStage } from "../../schemas/package-game/PackageStageSchema";


export const checkExistUserPackageWithPakcageId = (
  realm: Realm,
  packageId: BSON.ObjectId | string
): { user_package: UserPackage | null; package: Package | null } | null => {
  try {
    const packageObjectId =
      typeof packageId === "string" ? new BSON.ObjectId(packageId) : packageId;

    // پیدا کردن UserPackage مربوطه
    const userPackage = realm
      .objects<UserPackage>("UserPackage")
      .filtered("package_ref == $0", packageObjectId)[0] ?? null;

    // پیدا کردن Package مربوطه
    const pkg = realm.objectForPrimaryKey<Package>(
      "Package",
      packageObjectId
    ) ?? null;

    return {
      user_package: userPackage,
      package: pkg,
    };
  } catch (e) {
    return null;
  }
};
export const changeCompletionStatusUserPackage = ( 
  realm: Realm,
  userPackageId: BSON.ObjectId | string,
  completionStatus: boolean,
): boolean => {
  try {
    const objectId = typeof userPackageId === "string"? new BSON.ObjectId(userPackageId): userPackageId;
    const userPackage = realm.objectForPrimaryKey<UserPackage>(
      "UserPackage",
      objectId
    );
    if (!userPackage) {
      return false;
    }
    realm.write(() => {
      userPackage.content_completed = completionStatus;
      userPackage.updatedAt = new Date(); // آپدیت زمان تغییر
    });
    return true;
  } catch (e) {
    return false;
  }
};
export const createUserPackage = (
  realm: Realm,
  data: Partial<Omit<UserPackage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const packageId = typeof data.package_ref === "string"? new BSON.ObjectId(data.package_ref) : data.package_ref;
    const exists = realm.objectForPrimaryKey("UserPackage", objectId);
    if (exists) return true;

    realm.write(() => {
      realm.create("UserPackage", {
        ...data,
        _id: objectId,
        package_ref: packageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  } catch (e) {
    return false;
  }
};
export const saveWordHelpUsedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
): boolean => {
    try {
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");
        const wordStage = part.words.find((w) => w._id === wordIdStr);
        if (!wordStage) throw new Error("Word not found");
        realm.write(() => {
            wordStage.word_help_used = true;
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveCompletedPartAndSentenceBuildedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
): boolean => {
    try {
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");
        realm.write(() => {
            part.sentence_builded = true;
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const getCurrentPackageNextStageInformation = (
    realm: Realm,
    packageRef: BSON.ObjectId | string,
    userPackage: BSON.ObjectId | string,
) : Object | null => {
    try {
        const userPackageId = typeof userPackage === 'string' ? new BSON.ObjectId(userPackage) : userPackage;
        const packageId = typeof packageRef === 'string' ? new BSON.ObjectId(packageRef) : packageRef;
        const current = realm.objectForPrimaryKey<UserPackage>("UserPackage", userPackageId) || null;
        if (current) {
            const currentStage = current?.last_stage;
            const currentStageNumber = current?.last_stage_number;
            const currentSeason = current?.last_season;
            const currentSeasonNumber = current?.last_season_number;
            const nextStageNumber = currentStageNumber ? currentStageNumber + 1 : 2;
            const next = realm.objects<PackageStage>('PackageStage').filtered('package == $0 AND stage_number_in_package == $1', packageId, nextStageNumber)[0];
            if(next){
                const nextStage = next._id.toString()
                if((currentSeason && currentSeason?.equals(next.season)) || !currentSeason){
                    return {
                        nextStage : nextStage.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next?.season.toString(),
                        nextSeasonNumber : currentSeasonNumber??1,
                        endCurrentSeason : false,
                        endAllStage : false
                    }
                } else {
                    return {
                        nextStage : nextStage.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : currentSeasonNumber ? currentSeasonNumber + 1 : 2,
                        endCurrentSeason : true,
                        endAllStage : false
                    }
                }
            } else {
                return {
                    nextStage : null,
                    nextStageNumber : null,
                    nextSeason : null,
                    nextSeasonNumber : null,
                    endCurrentSeason : false,
                    endAllStage : true
                }
            }
        } else {
          return null;
        }
    } catch (e) {
        return null;
    }
};
export const updateUserPackageGameProgress = (
    realm: Realm,
    userPackage: BSON.ObjectId | string,
    last_season: BSON.ObjectId | string,
    last_season_number: number,
    last_stage: BSON.ObjectId | string,
    last_stage_number: number,
): boolean => {
    try {
        // Convert inputs to ObjectId if they are strings
        const userPackageId = typeof userPackage === 'string' ? new BSON.ObjectId(userPackage) : userPackage;
        const lastSeasonId = typeof last_season === 'string' ? new BSON.ObjectId(last_season) : last_season;
        const lastStageId = typeof last_stage === 'string' ? new BSON.ObjectId(last_stage) : last_stage;
        const existingProgress = realm.objectForPrimaryKey<UserPackage>("UserPackage", userPackageId);

        realm.write(() => {
            if (existingProgress) {
                if (last_stage_number === (existingProgress.last_stage_number ?? 1) + 1) {
                    existingProgress.last_season = lastSeasonId;
                    existingProgress.last_season_number = last_season_number;
                    existingProgress.last_stage = lastStageId;
                    existingProgress.last_stage_number = last_stage_number;
                    existingProgress.updatedAt = new Date();
                } else {
                    return false;
                }
            }
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const makingStageContentReplayableInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
): boolean => {
    try {
        const stageObjectId = typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");
        realm.write(() => {
            stage.parts.forEach((part) => {
                part.words.forEach((word) => {
                    if (word.unknown_word) {
                        word.word_builded = false;
                        word.unknown_word_completed = false;
                        word.additional_words_builded = [];
                    }
                });
                part.sentence_builded = false
            });
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const saveMainWordBuildedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");

        // گرفتن part
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");

        // پیدا کردن word
        const wordStage = part.words.find((w) => w._id === wordIdStr);
        if (!wordStage) throw new Error("Word not found");

        // آپدیت word_builded داخل write
        realm.write(() => {
            wordStage.word_builded = true;
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveNewAdditionalWordsBuildedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");

        // گرفتن part
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");

        // پیدا کردن word
        const wordStage = part.words.find((w) => w._id === wordIdStr);
        if (!wordStage) throw new Error("Word not found");

        // اضافه کردن word به additional_words_builded داخل write
        realm.write(() => {
            if (!wordStage.additional_words_builded) {
                wordStage.additional_words_builded = [];
            }
            if (!wordStage.additional_words_builded.includes(word)) {
                wordStage.additional_words_builded.push(word);
            }
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveNewHiddenWordsBuildedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");

        // گرفتن part
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");

        // پیدا کردن word
        const wordStage = part.words.find((w) => w._id === wordIdStr);
        if (!wordStage) throw new Error("Word not found");

        // اضافه کردن word به additional_words_builded داخل write
        realm.write(() => {
            if (!wordStage.hidden_words_builded) {
                wordStage.hidden_words_builded = [];
            }
            if (!wordStage.hidden_words_builded.includes(word)) {
                wordStage.hidden_words_builded.push(word);
            }
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const saveUnknownWordCompletedInPackageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<PackageStage>("PackageStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");

        // گرفتن part
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");

        // پیدا کردن word
        const wordStage = part.words.find((w) => w._id === wordIdStr);
        if (!wordStage) throw new Error("Word not found");

        // آپدیت word_builded داخل write
        realm.write(() => {
            wordStage.unknown_word_completed = true;
        });

        return true;
    } catch (e) {
        return false;
    }
};
