import Realm, { BSON } from "realm";
import { HarfAkharChallenge } from "../../schemas/harf-akhar/HarfAkharChallengeSchema";


export const saveCompletedPartAndSentenceBuildedInHarfAkhar = (
    realm: Realm,
    challengeId: BSON.ObjectId | string,
    partIndex: number,
): boolean => {
    try {
        const challengeObjectId = typeof challengeId === "string" ? new BSON.ObjectId(challengeId) : challengeId;
        const challenge = realm.objectForPrimaryKey<HarfAkharChallenge>("HarfAkharChallenge", challengeObjectId);
        if (!challenge) throw new Error("Challenge not found");
        const part = challenge.parts[partIndex];
        if (!part) throw new Error("Part not found");
        realm.write(() => {
            part.sentence_builded = true;
        });
        return true;
    } catch (e) {
        return false;
    }
};
export const saveMainWordBuildedInHarfAkharChallenge = (
    realm: Realm,
    challengeId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
): boolean => {
    try {
        // اطمینان از اینکه challengeId و wordId درست هستند
        const challengeObjectId =
            typeof challengeId === "string" ? new BSON.ObjectId(challengeId) : challengeId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن challenge
        const challenge = realm.objectForPrimaryKey<HarfAkharChallenge>("HarfAkharChallenge", challengeObjectId);
        if (!challenge) throw new Error("Challenge not found");

        // گرفتن part
        const part = challenge.parts[partIndex];
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
export const saveNewAdditionalWordsBuildedInHarfAkharChallenge = (
    realm: Realm,
    challengeId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه challengeId و wordId درست هستند
        const challengeObjectId =
            typeof challengeId === "string" ? new BSON.ObjectId(challengeId) : challengeId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن challenge
        const challenge = realm.objectForPrimaryKey<HarfAkharChallenge>("HarfAkharChallenge", challengeObjectId);
        if (!challenge) throw new Error("Challenge not found");

        // گرفتن part
        const part = challenge.parts[partIndex];
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

export const saveNewHiddenWordsBuildedInHarfAkharChallenge = (
    realm: Realm,
    challengeId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
    word: string
): boolean => {
    try {
        // اطمینان از اینکه challengeId و wordId درست هستند
        const challengeObjectId =
            typeof challengeId === "string" ? new BSON.ObjectId(challengeId) : challengeId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن challenge
        const challenge = realm.objectForPrimaryKey<HarfAkharChallenge>("HarfAkharChallenge", challengeObjectId);
        if (!challenge) throw new Error("Challenge not found");

        // گرفتن part
        const part = challenge.parts[partIndex];
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
export const saveUnknownWordCompletedInHarfAkharChallenge = (
    realm: Realm,
    challengeId: BSON.ObjectId | string,
    partIndex: number,
    wordId: BSON.ObjectId | string,
): boolean => {
    try {
        // اطمینان از اینکه challengeId و wordId درست هستند
        const challengeObjectId =
            typeof challengeId === "string" ? new BSON.ObjectId(challengeId) : challengeId;
        const wordIdStr =
            typeof wordId === "string" ? wordId : wordId.toHexString();

        // پیدا کردن challenge
        const challenge = realm.objectForPrimaryKey<HarfAkharChallenge>("HarfAkharChallenge", challengeObjectId);
        if (!challenge) throw new Error("Challenge not found");

        // گرفتن part
        const part = challenge.parts[partIndex];
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