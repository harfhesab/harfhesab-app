import Realm, { BSON } from "realm";
import { PackageStage } from "../../schemas/package-game/PackageStageSchema";

// --- تابع ایجاد سند جدید ---
export const createPackageStage = (
  realm: Realm,
  data: Partial<Omit<PackageStage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const exists = realm.objectForPrimaryKey("PackageStage", objectId);
    if (exists) return false;

    realm.write(() => {
      realm.create("PackageStage", {
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
export const createManyPackageStages = (
  realm: Realm,
  dataList: Array<Partial<Omit<PackageStage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  try {
    for (let i = 0; i < dataList.length; i += 200) {
      const chunk = dataList.slice(i, i + 200);

      realm.write(() => {
        chunk.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const exists = realm.objectForPrimaryKey("PackageStage", objectId);
          if (!exists) {
            realm.create("PackageStage", {
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
export const getPackageStagesBySeasonId = (
  realm: Realm,
  seasonId: BSON.ObjectId | string
): PackageStage[] => {
  const objectId = typeof seasonId === "string" ? new BSON.ObjectId(seasonId) : seasonId;

  const results = realm
    .objects<PackageStage>("PackageStage")
    .filtered("season == $0 AND is_visible == true", objectId)
    .sorted("stage_number");

  return Array.from(results);
};

// --- تابع حذف سند بر اساس _id ---
export const deletePackageStageById = (realm: Realm, id: BSON.ObjectId | string): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const target = realm.objectForPrimaryKey("PackageStage", objectId);

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
export const updatePackageStageById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<PackageStage, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<PackageStage>("PackageStage", objectId);

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