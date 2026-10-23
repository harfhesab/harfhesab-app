import Realm, { BSON } from "realm";
import { WordGameStage } from "../../schemas/word-game/WordGameStageSchema";
import { UserWordGameProgress } from "../../schemas/user/UserWordGameProgressSchema";
import { WordGameSeason } from "../../schemas/word-game/WordGameSeasonSchema";

type ProgressInput = {
  language_ref: BSON.ObjectId | string;
  last_season: BSON.ObjectId | string;
  last_season_number: number;
  last_stage: BSON.ObjectId | string;
  last_stage_number: number;
};
export const updateUserWordGameProgressInLogin = (
  realm: Realm,
  data: ProgressInput[]
): boolean => {
  try {
    realm.write(() => {
      // پاک کردن همه‌ی اسناد قبلی
      const allDocs = realm.objects<UserWordGameProgress>("UserWordGameProgress");
      realm.delete(allDocs);

      // ساختن اسناد جدید
      data.forEach(item => {
        const languageRefId = typeof item.language_ref === "string"? new BSON.ObjectId(item.language_ref): item.language_ref;

        const lastSeasonId =typeof item.last_season === "string"? new BSON.ObjectId(item.last_season): item.last_season;

        const lastStageId =typeof item.last_stage === "string"? new BSON.ObjectId(item.last_stage): item.last_stage;

        realm.create<UserWordGameProgress>("UserWordGameProgress", {
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
export const updateUserWordGameProgress = (
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
        const existingProgress = realm.objects<UserWordGameProgress>('UserWordGameProgress').filtered('language_ref == $0', languageRefId)[0];

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
                    realm.create<UserWordGameProgress>('UserWordGameProgress', {
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
export const makingStageContentReplayableInWordGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
): boolean => {
    try {
        const stageObjectId = typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", stageObjectId);
        if (!stage) throw new Error("Stage not found");
        realm.write(() => {
            stage.words_builded = []
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const getCurrentWordGameLanguageLastStageAndLastSeason = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
): Object | null => {
    try {
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const progress = realm.objects<UserWordGameProgress>('UserWordGameProgress').filtered('language_ref == $0', languageRefId)[0];
        if (progress) {
            return {
                last_stage: progress?.last_stage,
                last_stage_number: progress?.last_stage_number?.toString(),
                last_season: progress?.last_season?.toString(),
                last_season_number: progress?.last_season_number  
            }
        } else {
            const firstStage = realm.objects<WordGameStage>('WordGameStage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, 1)[0];
            const firstSeason = realm.objects<WordGameSeason>('WordGameSeason').filtered('language_ref == $0 AND season_number == $1', languageRefId, 1)[0];
            if(firstStage && firstSeason){
                realm.write(()=>{
                    realm.create<UserWordGameProgress>('UserWordGameProgress', {
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
export const getCurrentWordGameLanguageNextStageInformation = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
) : Object | null => {
    try {
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const current = realm.objects<UserWordGameProgress>('UserWordGameProgress').filtered('language_ref == $0', languageRefId)[0];
        if (current) {
            const currentStage = current.last_stage;
            const currentStageNumber = current.last_stage_number;
            const currentSeason = current.last_season;
            const currentSeasonNumber = current.last_season_number;
            const nextStageNumber = currentStageNumber ? currentStageNumber + 1 : 2;
            const next = realm.objects<WordGameStage>('WordGameStage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, nextStageNumber)[0];
            if(next){
                const nextStage = next._id.toString()
                if(currentSeason?.equals(next.season)){
                    const nextSeasonName = realm.objectForPrimaryKey<WordGameSeason>(
                        'WordGameSeason',
                        new BSON.ObjectId(currentSeason.toString())
                    )?.title ?? null;
                    return {
                        nextStage : nextStage.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : currentSeason.toString(),
                        nextSeasonNumber : currentSeasonNumber,
                        nextSeasonName : nextSeasonName,
                        endCurrentSeason : false,
                        endAllStage : false
                    }
                } else {
                    const nextSeasonName = realm.objectForPrimaryKey<WordGameSeason>(
                        'WordGameSeason',
                        new BSON.ObjectId(next.season.toString())
                    )?.title ?? null;
                    return {
                        nextStage : nextStage.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : currentSeasonNumber ? currentSeasonNumber + 1 : 2,
                        nextSeasonName : nextSeasonName,
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
                    nextSeasonName : null,
                    endCurrentSeason : false,
                    endAllStage : true
                }
            }
        } else {
            const nextStageNumber = 2;
            const next = realm.objects<WordGameStage>('WordGameStage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, nextStageNumber)[0];
            if(next){
                const currentStageNumber = 1;
                const currentStage = realm.objects<WordGameStage>('WordGameStage').filtered('language_ref == $0 AND stage_number_in_language == $1', languageRefId, currentStageNumber)[0];
                const nextSeasonName = realm.objectForPrimaryKey<WordGameSeason>(
                    'WordGameSeason',
                    new BSON.ObjectId(next.season.toString())
                )?.title ?? null;
                if(next.season.equals(currentStage.season)){
                    return {
                        nextStage : next._id.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : 1,
                        nextSeasonName : nextSeasonName,
                        endCurrentSeason : false,
                        endAllStage : false
                    }
                } else {
                    return {
                        nextStage : next._id.toString(),
                        nextStageNumber : nextStageNumber,
                        nextSeason : next.season.toString(),
                        nextSeasonNumber : 2,
                        nextSeasonName : nextSeasonName,
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
                    nextSeasonName : null,
                    endCurrentSeason : false,
                    endAllStage : true
                }
            }
        }
    } catch (e) {
        return null;
    }
};
export const saveUserHelpRequestsInWordGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    lettersHelpUsed: number[]
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId به objectId یا string درست تبدیل بشن
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", stageObjectId);
        if (!stage) throw new Error("WordGameStage not found");

        // آپدیت داخل realm.write
        realm.write(() => {
            stage.letters_help_used = lettersHelpUsed;
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveNewWordsBuildedInWordGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", stageObjectId);
        if (!stage) throw new Error("WordGameStage not found");

        // اضافه کردن word به additional_words_builded داخل write
        realm.write(() => {
            if (!stage.words_builded) {
                stage.words_builded = [];
            }
            if (!stage.words_builded.includes(word)) {
                stage.words_builded.push(word);
            }
        });

        return true;
    } catch (e) {
        return false;
    }
};
export const saveNewHiddenWordsBuildedInWordGame = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه stageId و wordId درست هستند
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;

        // پیدا کردن stage
        const stage = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", stageObjectId);
        if (!stage) throw new Error("WordGameStage not found");

        // اضافه کردن word به additional_words_builded داخل write
        realm.write(() => {
            if (!stage.hidden_words_builded) {
                stage.hidden_words_builded = [];
            }
            if (!stage.hidden_words_builded.includes(word)) {
                stage.hidden_words_builded.push(word);
            }
        });
        return true;
    } catch (e) {
        return false;
    }
};


