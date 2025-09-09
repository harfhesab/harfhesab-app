import Realm, { BSON } from "realm";
import { UserStageGameProgress } from "../../schemas/user/UserStageGameProgressSchema";
import { Stage } from "../../schemas/stage-game/StageSchema";
import { StageSeason } from "../../schemas/stage-game/StageSeasonSchema";

type ProgressInput = {
  language_ref: BSON.ObjectId | string;
  last_season: BSON.ObjectId | string;
  last_season_number: number;
  last_stage: BSON.ObjectId | string;
  last_stage_number: number;
};
export const updateUserStageGameProgressInLogin = (
  realm: Realm,
  data: ProgressInput[]
): boolean => {
  try {
    realm.write(() => {
      // پاک کردن همه‌ی اسناد قبلی
      const allDocs = realm.objects<UserStageGameProgress>("UserStageGameProgress");
      realm.delete(allDocs);

      // ساختن اسناد جدید
      data.forEach(item => {
        const languageRefId = typeof item.language_ref === "string"? new BSON.ObjectId(item.language_ref): item.language_ref;

        const lastSeasonId =typeof item.last_season === "string"? new BSON.ObjectId(item.last_season): item.last_season;

        const lastStageId =typeof item.last_stage === "string"? new BSON.ObjectId(item.last_stage): item.last_stage;

        realm.create<UserStageGameProgress>("UserStageGameProgress", {
          _id: new BSON.ObjectId(),
          language_ref: languageRefId,
          last_season: lastSeasonId,
          last_season_number: item.last_season_number,
          last_stage: lastStageId,
          last_stage_number: item.last_stage_number,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    return true;
  } catch (e) {
    return false;
  }
};
export const updateUserStageGameProgress = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
    last_season: BSON.ObjectId | string,
    last_season_number: number,
    last_stage: BSON.ObjectId | string,
    last_stage_number: number,
): boolean => {
    try {
        // Convert inputs to ObjectId if they are strings
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const lastSeasonId = typeof last_season === 'string' ? new BSON.ObjectId(last_season) : last_season;
        const lastStageId = typeof last_stage === 'string' ? new BSON.ObjectId(last_stage) : last_stage;

        // Search for existing document by language_ref
        const existingProgress = realm.objects<UserStageGameProgress>('UserStageGameProgress').filtered('language_ref == $0', languageRefId)[0];

        realm.write(() => {
            if (existingProgress) {
                if (last_stage_number === (existingProgress.last_stage_number ?? 0) + 1) {
                    existingProgress.last_season = lastSeasonId;
                    existingProgress.last_season_number = last_season_number;
                    existingProgress.last_stage = lastStageId;
                    existingProgress.last_stage_number = last_stage_number;
                    existingProgress.updatedAt = new Date();
                } else {
                    throw new Error('Update conditions not satisfied');
                }
            } else {
                // Check if new document can be created only if both numbers are 1
                if (last_season_number === 1 && last_stage_number === 1) {
                    // Create new document
                    realm.create<UserStageGameProgress>('UserStageGameProgress', {
                        _id: new BSON.ObjectId(),
                        language_ref: languageRefId,
                        last_season: lastSeasonId,
                        last_season_number: last_season_number,
                        last_stage: lastStageId,
                        last_stage_number: last_stage_number,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                } else {
                    throw new Error('Creation conditions not satisfied');
                }
        }
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const makingStageContentReplayableInStageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
): boolean => {
    try {
        const stageObjectId = typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const getCurrentLanguageLastStageAndLastSeason = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
): Object | null => {
    try {
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const progress = realm.objects<UserStageGameProgress>('UserStageGameProgress').filtered('language_ref == $0', languageRefId)[0];
        if (progress) {
            return {
                last_stage: progress?.last_stage,
                last_stage_number: progress?.last_stage_number?.toString(),
                last_season: progress?.last_season?.toString(),
                last_season_number: progress?.last_season_number  
            }
        } else {
            const firstStage = realm.objects<Stage>('Stage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, 1)[0];
            const firstSeason = realm.objects<StageSeason>('StageSeason').filtered('language_ref == $0 AND season_number == $1', languageRefId, 1)[0];
            if(firstStage && firstSeason){
                realm.write(()=>{
                    realm.create<UserStageGameProgress>('UserStageGameProgress', {
                        _id: new BSON.ObjectId(),
                        language_ref: languageRefId,
                        last_season: firstSeason._id,
                        last_season_number: 1,
                        last_stage: firstStage._id,
                        last_stage_number: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                })
            }
            return {
                last_stage: firstStage?._id?.toString()??null,
                last_stage_number: 1,
                last_season: firstSeason?._id?.toString()??null,
                last_season_number: 1 
            }
        }
    } catch (e) {
        return null;
    }
};
export const getCurrentLanguageNextStageInformation = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
) : Object | null => {
    try {
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const current = realm.objects<UserStageGameProgress>('UserStageGameProgress').filtered('language_ref == $0', languageRefId)[0];
        if (current) {
            const currentStage = current.last_stage;
            const currentStageNumber = current.last_stage_number;
            const currentSeason = current.last_season;
            const currentSeasonNumber = current.last_season_number;
            const nextStageNumber = currentStageNumber ? currentStageNumber + 1 : 2;
            const next = realm.objects<Stage>('Stage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, nextStageNumber)[0];
            if(next){
                const nextDocument = next.toJSON()
                const nextStage = next._id.toString()
                if(currentSeason?.equals(next.season)){
                    return {
                        nextStage : nextStage.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : currentSeason.toString(),
                        nextSeasonNumber : currentSeasonNumber,
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
            const nextStageNumber = 2;
            const next = realm.objects<Stage>('Stage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, nextStageNumber)[0];
            if(next){
                const currentStageNumber = 1;
                const currentStage = realm.objects<Stage>('Stage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, currentStageNumber)[0];
                if(next.season.equals(currentStage.season)){
                    return {
                        nextStage : next._id.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : 1,
                        endCurrentSeason : false,
                        endAllStage : false
                    }
                } else {
                    return {
                        nextStage : next._id.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : 2,
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
        }
    } catch (e) {
        return null;
    }
};
export const saveUserHelpRequestsInStageGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
    lettersHelpUsed: number[]
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId به objectId یا string درست تبدیل بشن
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
        if (!stage) throw new Error("Stage not found");

        // گرفتن part
        const part = stage.parts[partIndex];
        if (!part) throw new Error("Part not found");

        // پیدا کردن word
        const word = part.words.find((w) => w._id === wordIdStr);
        if (!word) throw new Error("Word not found");

        // آپدیت داخل realm.write
        realm.write(() => {
            word.letters_help_used = lettersHelpUsed;
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveNewAdditionalWordsBuildedInStageGame = (
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
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const saveNewHiddenWordsBuildedInStageGame = (
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
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const saveMainWordBuildedInStageGame = (
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
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const saveUnknownWordCompletedInStageGame = (
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
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const saveWordHelpUsedInStageGame = (
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
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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
export const saveCompletedPartAndSentenceBuilded = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
): boolean => {
    try {
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<Stage>("Stage", stageObjectId);
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


