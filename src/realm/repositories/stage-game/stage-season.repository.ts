import Realm, { BSON } from "realm";
import { StageSeason } from "../../schemas/stage-game/StageSeasonSchema";

// --- تابع ایجاد سند جدید ---
export const createStageSeason = (
  realm: Realm,
  data: Partial<Omit<StageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id):data._id;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const exists = realm.objectForPrimaryKey("StageSeason", objectId);
    if (exists) {
      return false;
    }
    realm.write(() => {
      realm.create("StageSeason", {
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
export const createManyStageSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<StageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
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
          const exists = realm.objectForPrimaryKey("StageSeason", objectId);
          if (!exists) {
            realm.create("StageSeason", {
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
export const updateManyStageSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<StageSeason, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const existing = realm.objectForPrimaryKey<StageSeason>("StageSeason", objectId);
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
export const deleteManyStageSeasons = (
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
          const existing = realm.objectForPrimaryKey<StageSeason>("StageSeason", objectId);
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

// --- تابع گرفتن همه اسناد بر اساس فیلد language با pagination ---
export const getStageSeasonsByLanguage = (
  realm: Realm,
  languageId: BSON.ObjectId,
  page: number = 1,
  pageSize: number = 20
): StageSeason[] => {
  const offset = (page - 1) * pageSize;

  const results = realm
    .objects<StageSeason>("StageSeason")
    .filtered("language == $0 AND is_visible == true", languageId)
    .sorted("season_number") // به‌صورت پیش‌فرض ascending
    .slice(offset, offset + pageSize);

  return results;
};

// --- تابع حذف سند بر اساس _id ---
export const deleteStageSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId
): Promise<boolean> => {
  const stageSeason = realm.objectForPrimaryKey<StageSeason>("StageSeason", id);
  if (!stageSeason) return false;

  realm.write(() => {
    realm.delete(stageSeason);
  });

  return true;
};

// --- تابع آپدیت سند بر اساس _id ---
export const updateStageSeasonById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<StageSeason, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<StageSeason>("StageSeason", objectId);
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