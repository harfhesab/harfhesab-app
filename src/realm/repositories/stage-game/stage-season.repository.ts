import Realm, { BSON } from "realm";
import { StageSeason } from "../../schemas/stage-game/StageSeasonSchema";

// --- تابع ایجاد سند جدید ---
export const createStageSeason = (
  realm: Realm,
  data: Partial<Omit<StageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string"
      ? new BSON.ObjectId(data._id)
      : data._id;
    const exists = realm.objectForPrimaryKey("StageSeason", objectId);
    if (exists) {
      return false;
    }
    realm.write(() => {
      realm.create("StageSeason", {
        ...data,
        _id: objectId,
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
  const batchSize = 200;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string"
            ? new BSON.ObjectId(data._id)
            : data._id;

          // بررسی اینکه سند با این _id قبلاً وجود دارد یا نه
          const exists = realm.objectForPrimaryKey("StageSeason", objectId);
          if (!exists) {
            realm.create("StageSeason", {
              ...data,
              _id: objectId,
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

// --- تابع آپدیت سند بر اساس _id ---
export const updateStageSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId,
  updatedData: Partial<Omit<StageSeason, "_id" | "createdAt">>
): Promise<StageSeason | null> => {
  let stageSeason = realm.objectForPrimaryKey<StageSeason>("StageSeason", id);
  if (!stageSeason) return null;

  realm.write(() => {
    for (const key in updatedData) {
      if (
        Object.prototype.hasOwnProperty.call(updatedData, key) &&
        key !== "_id" &&
        key !== "createdAt"
      ) {
        (stageSeason as any)[key] = (updatedData as any)[key];
      }
    }
    stageSeason.updatedAt = new Date();
  });

  return stageSeason;
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