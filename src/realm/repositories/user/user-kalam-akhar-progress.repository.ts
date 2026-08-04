import Realm, { BSON } from "realm";
import { KalamAkharChallenge } from "../../schemas/kalam-akhar/KalamAkharChallengeSchema";


export const saveCompletedPartAndSentenceBuildedInKalamAkhar = (
    realm: Realm,
    stageId: BSON.ObjectId | string,
    partIndex: number,
): boolean => {
    try {
        const stageObjectId =
            typeof stageId === "string" ? new BSON.ObjectId(stageId) : stageId;
        const stage = realm.objectForPrimaryKey<KalamAkharChallenge>("KalamAkharChallenge", stageObjectId);
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