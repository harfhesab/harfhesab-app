import Realm, { BSON } from "realm";
import { KalamAkharChallenge } from "../../schemas/kalam-akhar/KalamAkharChallengeSchema";
import { PartStage } from "../../schemas/general/embeddeds/PartStageSchema";
import { IPartStage, IWordStage } from "../../interfaces/general/embeddes/part-stage.interface";


function cleanParts(parts: IPartStage[]): PartStage[] {
  const cleaned = parts
    .filter((part): part is IPartStage => part && Array.isArray(part.words))
    .map(part => ({
      _id: part._id,
      sentence: part.sentence,
      sentence_hint: part.sentence_hint ?? null,
      sentence_display: part.sentence_display ?? null,
      order: part.order ?? null,
      words: part.words
        .filter((word): word is IWordStage => word && typeof word.word === 'string')
        .map((word: IWordStage) => ({
          _id: word._id,
          word: word.word,
          word_hint: word.word_hint ?? null,
          unknown_word: !!word.unknown_word,
          letters: word.letters || [],
          additional_words: word.additional_words || [],
          hidden_words: word.hidden_words || [],
          order: word.order ?? null,
        })),
    }));
  return cleaned as unknown as PartStage[];
}

// --- تابع ایجاد سند جدید ---
export const createKalamAkharChallenge = (
  realm: Realm,
  data: Partial<KalamAkharChallenge> & {_id: BSON.ObjectId | string;},
  expiration: number,
  timeLimit?: number,
): boolean => {
  try {
    const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id): data._id;

    const languageId =typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref): data.language_ref;

    const expirationDate = new Date(
      Date.now() + expiration * 1000
    );

    const documentData: any = {
      ...data,
      _id: objectId,
      language_ref: languageId,
      parts: cleanParts(data.parts || []),
      media: data.media || [],
      voice: data.voice || [],
      expiration: expirationDate,
    };

    // اولویت با پارامتر timeLimit
    if (typeof timeLimit === "number") {
      documentData.time_limit = timeLimit;
    } else if (typeof data.time_limit === "number") {
      documentData.time_limit = data.time_limit;
    }

    realm.write(() => {
      realm.create(
        "KalamAkharChallenge",
        documentData,
        Realm.UpdateMode.Modified
      );
    });

    return true;
  } catch (e) {
    return false;
  }
};

export const removeExpiredKalamAkharChallenges = (
  realm: Realm
): number => {
  try {
    const now = new Date();
    const expiredChallenges = realm
      .objects("KalamAkharChallenge")
      .filtered("expiration <= $0", now);

    const deletedCount = expiredChallenges.length;
    
    if (deletedCount > 0) {
      realm.write(() => {
        realm.delete(expiredChallenges);
      });
    }
    return deletedCount;
  } catch (e) {
    return 0;
  }
};

// --- تابع گرفتن یک سند بر اساس _id ---
export const getKalamAkharChallengeById = (
  realm: Realm,
  id: BSON.ObjectId | string
): KalamAkharChallenge | null => {
  try {
    const objectId = typeof id === "string"? new BSON.ObjectId(id): id;

    return realm
      .objectForPrimaryKey<KalamAkharChallenge>("KalamAkharChallenge", objectId) || null;
  } catch (error) {
    return null;
  }
};

// --- تابع حذف سند بر اساس _id ---
export const deleteKalamAkharChallengeById = (realm: Realm, id: BSON.ObjectId | string): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const target = realm.objectForPrimaryKey("KalamAkharChallenge", objectId);

    if (!target) return false;

    realm.write(() => {
      realm.delete(target);
    });

    return true;
  } catch (e) {
    return false;
  }
};


