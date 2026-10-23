import Realm, { BSON } from "realm";
import { WordGameStage } from "../../schemas/word-game/WordGameStageSchema";


// --- تابع ایجاد سند جدید ---
export const createWordGameStage = (
  realm: Realm,
  data: Partial<Omit<WordGameStage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const seasonId = typeof data.season == "string"? new BSON.ObjectId(data.season):data.season;
    const exists = realm.objectForPrimaryKey("Stage", objectId);
    if (exists) return false;

    realm.write(() => {
      realm.create("WordGameStage", {
        ...data,
        _id: objectId,
        hidden_words: data?.hidden_words??[],
        language_ref : languageId,
        season : seasonId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  } catch (e) {
    return false;
  }
};

// --- تابع ایجاد گروهی سند جدید ---
export const createManyWordGameStages = (
  realm: Realm,
  dataList: Array<Partial<Omit<WordGameStage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const chunk = dataList.slice(i, i + batchSize);

      realm.write(() => {
        chunk.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
          const seasonId = typeof data.season == "string"? new BSON.ObjectId(data.season):data.season;
          const exists = realm.objectForPrimaryKey("WordGameStage", objectId);
          if (!exists) {
            realm.create("WordGameStage", {
              ...data,
              _id: objectId,
              hidden_words: data?.hidden_words??[],
              language_ref : languageId,
              season : seasonId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        });
      });
    }

    return true;
  } catch (error) {
    return false;
  }
};

// تابع آپدیت گروهی اسناد
export const updateManyWordGameStages = (
  realm: Realm,
  dataList: Array<Partial<Omit<WordGameStage, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const existing = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", objectId);
          if (existing) {
            if (data.language_ref) {
              existing.language_ref =
                typeof data.language_ref === "string" ? new BSON.ObjectId(data.language_ref) : data.language_ref;
            }
            if (data.season) {
              existing.season = typeof data.season === "string" ? new BSON.ObjectId(data.season) : data.season;
            }
            if (data.letters) {
              existing.letters = [...data.letters];
            }
            if (data.words) {
              existing.words = [...data.words];
            }
            if (data.hidden_words) {
              existing.hidden_words = [...data.hidden_words];
            }
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "_id" &&
                key !== "createdAt" &&
                key !== "language_ref" &&
                key !== "season" &&
                key !== "letters" &&
                key !== "words" &&
                key !== "hidden_words" &&
                value !== undefined &&
                Object.prototype.hasOwnProperty.call(existing, key)
              ) {
                (existing as any)[key] = value;
              }
            });
            existing.updatedAt = new Date();
          }
        });
      });
    }
    return true;
  } catch (e) {
    return false;
  }
};

// تابع حذف گروهی اسناد
export const deleteManyWordGameStages = (
  realm: Realm,
  dataList: Array<{ _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(({ _id }) => {
          const objectId = typeof _id === "string" ? new BSON.ObjectId(_id) : _id;
          const existing = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", objectId);
          if (existing) {
            realm.delete(existing);
          }
        });
      });
    }
    return true;
  } catch (e) {
    return false;
  }
};

// --- تابع گرفتن همه اسناد بر اساس فیلد season بدون pagination ---
export const getWordGameStagesBySeasonId = (
  realm: Realm,
  seasonId: BSON.ObjectId | string
): Realm.Results<WordGameStage> => {
  try {
    const objectId = typeof seasonId === "string"
      ? new BSON.ObjectId(seasonId)
      : seasonId;

    return realm
      .objects<WordGameStage>("WordGameStage")
      .filtered("season == $0 AND is_visible == true", objectId)
      .sorted("stage_number_in_season");
  } catch (error) {
    return [] as unknown as Realm.Results<WordGameStage>;
  }
};

// --- تابع گرفتن یک سند بر اساس _id ---
export const getWordGameStageById = (
  realm: Realm,
  id: BSON.ObjectId | string
): WordGameStage | null => {
  try {
    const objectId = typeof id === "string"
      ? new BSON.ObjectId(id)
      : id;

    return realm
      .objectForPrimaryKey<WordGameStage>("WordGameStage", objectId) || null;
  } catch (error) {
    return null;
  }
};

// --- تابع حذف سند بر اساس _id ---
export const deleteWordGameStageById = (realm: Realm, id: BSON.ObjectId | string): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const target = realm.objectForPrimaryKey("WordGameStage", objectId);

    if (!target) return false;

    realm.write(() => {
      realm.delete(target);
    });

    return true;
  } catch (e) {
    return false;
  }
};

// --- تابع آپدیت سند بر اساس _id ---
export const updateWordGameStageById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<WordGameStage, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<WordGameStage>("WordGameStage", objectId);
    if (!existing) return false;

    realm.write(() => {
      if (newData.language_ref) {
        existing.language_ref =
          typeof newData.language_ref === "string" ? new BSON.ObjectId(newData.language_ref) : newData.language_ref;
      }
      if (newData.season) {
        existing.season = typeof newData.season === "string" ? new BSON.ObjectId(newData.season) : newData.season;
      }
      if (newData.letters) {
        existing.letters = [...newData.letters];
      }
      if (newData.words) {
        existing.words = [...newData.words];
      }
      if (newData.hidden_words) {
        existing.hidden_words = [...newData.hidden_words];
      }
      Object.entries(newData).forEach(([key, value]) => {
        if (
          key !== "_id" &&
          key !== "createdAt" &&
          key !== "language_ref" &&
          key !== "season" &&
          key !== "letters" &&
          key !== "words" &&
          key !== "hidden_words"
        ) {
          (existing as any)[key] = value;
        }
      });
      existing.updatedAt = new Date();
    });

    return true;
  } catch (e) {
    return false;
  }
};
