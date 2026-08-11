import Realm, { BSON } from "realm";
import { KalamAkharChallenge } from "../../schemas/kalam-akhar/KalamAkharChallengeSchema";
import { PartStage, WordStage } from "../../schemas/general/embeddeds/PartStageSchema";
import { IPartStage, IWordStage } from "../../interfaces/general/embeddes/part-stage.interface";


function hasBoolValue(value: boolean | undefined | null): boolean {
  return value === true;
}

function hasArrayValue<T>(
  value: T[] | Realm.List<T> | undefined | null
): value is T[] | Realm.List<T> {
  return !!value && typeof (value as any).length === "number" && (value as any).length > 0;
}

function cleanParts(
  parts: IPartStage[],
  existingParts?: Realm.List<PartStage> | PartStage[] | null
): PartStage[] {
  const existingPartsMap = new Map<string, PartStage>();
  if (existingParts) {
    for (const p of existingParts) {
      if (p && p._id) existingPartsMap.set(p._id, p);
    }
  }

  const cleaned = parts
    .filter((part): part is IPartStage => part && Array.isArray(part.words))
    .map(part => {
      const oldPart = existingPartsMap.get(part._id);

      const oldWordsMap = new Map<string, WordStage>();
      if (oldPart && oldPart.words) {
        for (const w of oldPart.words) {
          if (w && w._id) oldWordsMap.set(w._id, w);
        }
      }

      return {
        _id: part._id,
        sentence: part.sentence,
        sentence_hint: part.sentence_hint ?? null,
        sentence_display: part.sentence_display ?? null,
        order: part.order ?? null,

        sentence_builded: oldPart ? hasBoolValue(oldPart.sentence_builded) : false,

        words: part.words
          .filter((word): word is IWordStage => word && typeof word.word === "string")
          .map((word: IWordStage) => {
            const oldWord = oldWordsMap.get(word._id);

            return {
              _id: word._id,
              word: word.word,
              word_hint: word.word_hint ?? null,
              unknown_word: !!word.unknown_word,
              letters: word.letters || [],
              additional_words: word.additional_words || [],
              hidden_words: word.hidden_words || [],
              order: word.order ?? null,

              word_help_used: oldWord ? hasBoolValue(oldWord.word_help_used) : false,
              word_builded: oldWord ? hasBoolValue(oldWord.word_builded) : false,
              unknown_word_completed: oldWord
                ? hasBoolValue(oldWord.unknown_word_completed)
                : false,

              letters_help_used:
                oldWord && hasArrayValue(oldWord.letters_help_used)
                  ? Array.from(oldWord.letters_help_used)
                  : [],
              additional_words_builded:
                oldWord && hasArrayValue(oldWord.additional_words_builded)
                  ? Array.from(oldWord.additional_words_builded)
                  : [],
              hidden_words_builded:
                oldWord && hasArrayValue(oldWord.hidden_words_builded)
                  ? Array.from(oldWord.hidden_words_builded)
                  : [],
            };
          }),
      };
    });

  return cleaned as unknown as PartStage[];
}

// --- تابع ایجاد/آپدیت سند ---
export const createKalamAkharChallenge = (
  realm: Realm,
  data: Partial<KalamAkharChallenge> & { _id: BSON.ObjectId | string },
  expiration: number,
  remainingTimeSeconds?: number
): boolean => {
  try {
    const objectId =
      typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;

    const languageId =
      typeof data.language_ref === "string"
        ? new BSON.ObjectId(data.language_ref)
        : data.language_ref;

    const expirationDate = new Date(Date.now() + expiration * 1000);

    // خواندن سند قبلی (در صورت وجود) پیش از نوشتن، برای حفظ فیلدهای پیشرفت
    const existingDoc = realm.objectForPrimaryKey<KalamAkharChallenge>(
      "KalamAkharChallenge",
      objectId
    );

    const documentData: any = {
      ...data,
      _id: objectId,
      language_ref: languageId,
      parts: cleanParts(data.parts || [], existingDoc?.parts),
      media: data.media || [],
      voice: data.voice || [],
      expiration: expirationDate,
    };

    // اولویت با پارامتر remainingTimeSeconds
    if (typeof remainingTimeSeconds === "number") {
      documentData.remaining_time_seconds = remainingTimeSeconds;
      documentData.remaining_synced_at = new Date();
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
  challengeId: BSON.ObjectId | string
): KalamAkharChallenge | null => {
  try {
    const objectId = typeof challengeId === "string"? new BSON.ObjectId(challengeId): challengeId;

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


