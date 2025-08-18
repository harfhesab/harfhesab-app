import Realm, { BSON } from "realm";
import { UserStageGameProgress } from "../../schemas/user/UserStageGameProgressSchema";


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
            // Check if input numbers are exactly one more than existing
            if (
            last_season_number === (existingProgress.last_season_number ?? 0) + 1 &&
            last_stage_number === (existingProgress.last_stage_number ?? 0) + 1
            ) {
            // Update the existing document
            existingProgress.last_season = lastSeasonId;
            existingProgress.last_season_number = last_season_number;
            existingProgress.last_stage = lastStageId;
            existingProgress.last_stage_number = last_stage_number;
            existingProgress.updatedAt = new Date();
            } else {
            // Condition not met, throw to catch block
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
            // Condition not met, throw to catch block
            throw new Error('Creation conditions not satisfied');
            }
        }
        });

        return true;
    } catch (e) {
        return false;
    }
};

type PlainUserStageGameProgress = Omit<UserStageGameProgress, keyof Realm.Object>; // این متدهای Realm رو حذف می‌کنه
export const getCurrentLanguageLastStageAndLastSeason = (
    realm: Realm,
    language_ref: BSON.ObjectId | string,
): PlainUserStageGameProgress | null => {
    try {
        const languageRefId = typeof language_ref === 'string' ? new BSON.ObjectId(language_ref) : language_ref;
        const progress = realm.objects<UserStageGameProgress>('UserStageGameProgress').filtered('language_ref == $0', languageRefId)[0];
        if (progress) {
            return progress.toJSON() as unknown as PlainUserStageGameProgress;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};