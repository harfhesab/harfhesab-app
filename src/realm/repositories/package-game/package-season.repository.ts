import Realm, { BSON } from "realm";
import { PackageSeason } from "../../schemas/package-game/PackageSeasonSchema";

// --- تابع ایجاد سند جدید ---
export const createPackageSeason = (
  realm: Realm,
  data: Partial<Omit<PackageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id):data._id;
    const packageId = typeof data.package === "string"? new BSON.ObjectId(data.package):data.package;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const exists = realm.objectForPrimaryKey("PackageSeason", objectId);
    if (exists) {
      return false;
    }
    realm.write(() => {
      realm.create("PackageSeason", {
        ...data,
        _id: objectId,
        package: packageId,
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
export const createManyPackageSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<PackageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id):data._id;
          const packageId = typeof data.package === "string"? new BSON.ObjectId(data.package):data.package;
          const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
          // بررسی اینکه سند با این _id قبلاً وجود دارد یا نه
          const exists = realm.objectForPrimaryKey("PackageSeason", objectId);
          if (!exists) {
            realm.create("PackageSeason", {
              ...data,
              _id: objectId,
              package: packageId,
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
export const updateManyPackageSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<PackageSeason, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const existing = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", objectId);
          if (existing) {
            if (data.language_ref) {
              existing.language_ref = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref) : data.language_ref;
            }
            if (data.package) {
              existing.package = typeof data.package === "string"? new BSON.ObjectId(data.package) : data.package
            }
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "_id" &&
                key !== "createdAt" &&
                key !== "package" &&
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
export const deleteManyPackageSeasons = (
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
          const existing = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", objectId);
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
// --- تابع گرفتن همه اسناد بر اساس فیلد package ---
export const getPackageSeasonsByPackage = (
  realm: Realm,
  packageId: BSON.ObjectId | string
): Realm.Results<PackageSeason> => {
  try {
    const _id = typeof packageId === "string"
      ? new BSON.ObjectId(packageId)
      : packageId;

    return realm
      .objects<PackageSeason>("PackageSeason")
      .filtered("package == $0 AND is_visible == true", _id)
      .sorted("season_number");
  } catch (error) {
    return [] as unknown as Realm.Results<PackageSeason>;
  }
};

// --- تابع گرفتن همه اسناد بر اساس فیلد package با pagination ---
export const paginatePackageSeasonsByPackage = (
  realm: Realm,
  packageId: BSON.ObjectId | string,
  page: number = 1,
  pageSize: number = 20
): PackageSeason[] => {
  try {
    const offset = (page - 1) * pageSize;
    const _id = typeof packageId === "string"? new BSON.ObjectId(packageId) : packageId;
    const results = realm
      .objects<PackageSeason>("PackageSeason")
      .filtered("package == $0 AND is_visible == true", _id)
      .sorted("season_number") // به‌صورت پیش‌فرض ascending
      .slice(offset, offset + pageSize);

    return results;
  } catch (error) {
    return [];
  }
};

// --- تابع گرفتن یک سند بر اساس _id ---
export const getPackageSeasonById = (
  realm: Realm,
  id: BSON.ObjectId | string
): PackageSeason | null => {
  try {
    // تبدیل id به ObjectId اگر string باشه
    const objectId = typeof id === 'string' ? new BSON.ObjectId(id) : id;

    // گرفتن سند از Realm
    const packageSeason = realm.objectForPrimaryKey<PackageSeason>('PackageSeason', objectId);

    if (!packageSeason) {
      return null;
    }

    // تبدیل به JSON و سپس به POJO
    const plainPackageSeason = JSON.parse(
      JSON.stringify(packageSeason, (key, value) => {
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

    return plainPackageSeason as PackageSeason;
  } catch (error) {
    return null;
  }
};

// --- تابع حذف سند بر اساس _id ---
export const deletePackageSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId
): Promise<boolean> => {
  const pacakgeSeason = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", id);
  if (!pacakgeSeason) return false;

  realm.write(() => {
    realm.delete(pacakgeSeason);
  });

  return true;
};

// --- تابع آپدیت سند بر اساس _id ---
export const updatePackageSeasonById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<PackageSeason, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", objectId);
    if (!existing) return false;

    realm.write(() => {
      if (newData.language_ref) {
        existing.language_ref = typeof newData.language_ref === "string"? new BSON.ObjectId(newData.language_ref): newData.language_ref;
      }
      if (newData.package) {
        existing.package = typeof newData.package === "string"? new BSON.ObjectId(newData.package): newData.package;
      }
      Object.entries(newData).forEach(([key, value]) => {
        if (
          key !== "_id" &&
          key !== "package" &&
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

