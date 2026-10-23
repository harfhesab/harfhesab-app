import Realm, { BSON } from "realm";
import { WordGameSeason } from "../../schemas/word-game/WordGameSeasonSchema";

// --- تابع ایجاد سند جدید ---
export const createWordGameSeason = (
  realm: Realm,
  data: Partial<Omit<WordGameSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id):data._id;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const exists = realm.objectForPrimaryKey("WordGameSeason", objectId);
    if (exists) {
      return false;
    }
    realm.write(() => {
      realm.create("WordGameSeason", {
        ...data,
        _id: objectId,
        language_ref : languageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    return true;
  } catch (error) {
    return false;
  }
};

// --- تابع ایجاد گروهی سند جدید ---
export const createManyWordGameSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<WordGameSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id):data._id;
          const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
          // بررسی اینکه سند با این _id قبلاً وجود دارد یا نه
          const exists = realm.objectForPrimaryKey("WordGameSeason", objectId);
          if (!exists) {
            realm.create("WordGameSeason", {
              ...data,
              _id: objectId,
              language_ref : languageId,
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
export const updateManyWordGameSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<WordGameSeason, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const existing = realm.objectForPrimaryKey<WordGameSeason>("WordGameSeason", objectId);
          if (existing) {
            if (data.language_ref) {
              existing.language_ref = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref) : data.language_ref;
            }
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "_id" &&
                key !== "createdAt" &&
                key !== "language_ref" &&
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
export const deleteManyWordGameSeasons = (
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
          const existing = realm.objectForPrimaryKey<WordGameSeason>("WordGameSeason", objectId);
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

// --- تابع گرفتن همه اسناد بر اساس فیلد language ---
export const getWordGameSeasonsByLanguage = (
  realm: Realm,
  language: BSON.ObjectId | string
): Realm.Results<WordGameSeason> => {
  try {
    const languageId = typeof language === "string"
      ? new BSON.ObjectId(language)
      : language;

    return realm
      .objects<WordGameSeason>("WordGameSeason")
      .filtered("language_ref == $0 AND is_visible == true", languageId)
      .sorted("season_number");
  } catch (error) {
    return [] as unknown as Realm.Results<WordGameSeason>;
  }
};

// --- تابع گرفتن همه اسناد بر اساس فیلد language با pagination ---
export const paginateWordGameSeasonsByLanguage = (
  realm: Realm,
  language: BSON.ObjectId | string,
  page: number = 1,
  pageSize: number = 20
): WordGameSeason[] => {
  try {
    const offset = (page - 1) * pageSize;
    const languageId = typeof language === "string"? new BSON.ObjectId(language) : language;
    const results = realm
      .objects<WordGameSeason>("WordGameSeason")
      .filtered("language_ref == $0 AND is_visible == true", languageId)
      .sorted("season_number") // به‌صورت پیش‌فرض ascending
      .slice(offset, offset + pageSize);

    return results;
  } catch (error) {
    return [];
  }
};

// --- تابع گرفتن یک سند بر اساس _id ---
// export const getWordGameSeasonById = (
//   realm: Realm,
//   id: BSON.ObjectId | string
// ): WordGameSeason | null => {
//   try {
//     const objectId = typeof id === "string"
//       ? new BSON.ObjectId(id)
//       : id;

//     return realm
//       .objectForPrimaryKey<WordGameSeason>("WordGameSeason", objectId) || null;
//   } catch (error) {
//     return null;
//   }
// };

// --- تابع گرفتن یک سند بر اساس _id ---
export const getWordGameSeasonById = (
  realm: Realm,
  id: BSON.ObjectId | string
): WordGameSeason | null => {
  try {
    // تبدیل id به ObjectId اگر string باشه
    const objectId = typeof id === 'string' ? new BSON.ObjectId(id) : id;

    // گرفتن سند از Realm
    const stageSeason = realm.objectForPrimaryKey<WordGameSeason>('WordGameSeason', objectId);

    if (!stageSeason) {
      return null;
    }

    // تبدیل به JSON و سپس به POJO
    const plainStageSeason = JSON.parse(
      JSON.stringify(stageSeason, (key, value) => {
        // تبدیل ObjectId به string
        if (value instanceof BSON.ObjectId) {
          return value.toString();
        }
        // اگر مقدار undefined باشه، به null تبدیل کن (برای JSON)
        if (value === undefined) {
          return null;
        }
        return value;
      })
    );

    return plainStageSeason as WordGameSeason;
  } catch (error) {
    return null;
  }
};

// --- تابع حذف سند بر اساس _id ---
export const deleteWordGameSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId
): Promise<boolean> => {
  const stageSeason = realm.objectForPrimaryKey<WordGameSeason>("WordGameSeason", id);
  if (!stageSeason) return false;

  realm.write(() => {
    realm.delete(stageSeason);
  });

  return true;
};

// --- تابع آپدیت سند بر اساس _id ---
export const updateWordGameSeasonById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<WordGameSeason, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<WordGameSeason>("WordGameSeason", objectId);
    if (!existing) return false;

    realm.write(() => {
      if (newData.language_ref) {
        existing.language_ref = typeof newData.language_ref === "string"? new BSON.ObjectId(newData.language_ref): newData.language_ref;
      }
      Object.entries(newData).forEach(([key, value]) => {
        if (
          key !== "_id" &&
          key !== "createdAt" &&
          key !== "language_ref"
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