import Realm, { BSON } from "realm";
import { Stage } from "../../schemas/stage-game/StageSchema";

// --- تابع ایجاد سند جدید ---
export const createStage = (
  realm: Realm,
  data: Partial<Omit<Stage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const exists = realm.objectForPrimaryKey("Stage", objectId);
    if (exists) return false;

    realm.write(() => {
      realm.create("Stage", {
        ...data,
        _id: objectId,
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
export const createManyStages = (
  realm: Realm,
  dataList: Array<Partial<Omit<Stage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  try {
    for (let i = 0; i < dataList.length; i += 200) {
      const chunk = dataList.slice(i, i + 200);

      realm.write(() => {
        chunk.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const exists = realm.objectForPrimaryKey("Stage", objectId);
          if (!exists) {
            realm.create("Stage", {
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
  } catch (e) {
    return false;
  }
};

// --- تابع گرفتن همه اسناد بر اساس فیلد season بدون pagination ---
export const getStagesBySeasonId = (
  realm: Realm,
  seasonId: BSON.ObjectId | string
): Stage[] => {
  const objectId = typeof seasonId === "string" ? new BSON.ObjectId(seasonId) : seasonId;

  const results = realm
    .objects<Stage>("Stage")
    .filtered("season == $0 AND is_visible == true", objectId)
    .sorted("stage_number_in_season");

  return Array.from(results);
};


// --- تابع حذف سند بر اساس _id ---
export const deleteStageById = (realm: Realm, id: BSON.ObjectId | string): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const target = realm.objectForPrimaryKey("Stage", objectId);

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
export const updateStageById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<Stage, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<Stage>("Stage", objectId);

    if (!existing) return false;

    realm.write(() => {
      Object.entries(newData).forEach(([key, value]) => {
        (existing as any)[key] = value;
      });
      existing.updatedAt = new Date();
    });

    return true;
  } catch (e) {
    return false;
  }
};