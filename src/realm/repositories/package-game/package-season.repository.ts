import Realm, { BSON } from "realm";
import { PackageSeason } from "../../schemas/package-game/PackageSeasonSchema";

// --- تابع ایجاد سند جدید ---
export const createPackageSeason = (
  realm: Realm,
  data: Partial<Omit<PackageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string"
      ? new BSON.ObjectId(data._id)
      : data._id;
    const exists = realm.objectForPrimaryKey("PackageSeason", objectId);
    if (exists) {
      return false;
    }
    realm.write(() => {
      realm.create("PackageSeason", {
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
export const createManyPackageSeasons = (
  realm: Realm,
  dataList: Array<Partial<Omit<PackageSeason, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
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
          const exists = realm.objectForPrimaryKey("PackageSeason", objectId);
          if (!exists) {
            realm.create("PackageSeason", {
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

// --- تابع گرفتن همه اسناد بر اساس فیلد package ---
export const getPackageSeasonsByPackageSorted = (
  realm: Realm,
  packageId: BSON.ObjectId | string
): PackageSeason[] => {
  const objectId = typeof packageId === "string" ? new BSON.ObjectId(packageId) : packageId;

  const results = realm.objects<PackageSeason>("PackageSeason")
    .filtered("package CONTAINS $0 AND is_visible == true", objectId);

  // تبدیل نتایج به آرایه تایپ‌شده و مرتب‌سازی دقیق
  const sortedResults: PackageSeason[] = Array.from(results) as PackageSeason[];

  return sortedResults.sort((a: PackageSeason, b: PackageSeason) => {
    const aSN = a.season_number.find((sn: any) => sn.package.equals(objectId));
    const bSN = b.season_number.find((sn: any) => sn.package.equals(objectId));
    return (aSN?.season_number ?? Infinity) - (bSN?.season_number ?? Infinity);
  });
};

// --- تابع آپدیت سند بر اساس _id ---
export const updatePackageSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId,
  updatedData: Partial<Omit<PackageSeason, "_id" | "createdAt">>
): Promise<PackageSeason | null> => {
  let packageSeason = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", id);
  if (!packageSeason) return null;

  realm.write(() => {
    for (const key in updatedData) {
      if (
        Object.prototype.hasOwnProperty.call(updatedData, key) &&
        key !== "_id" &&
        key !== "createdAt"
      ) {
        (packageSeason as any)[key] = (updatedData as any)[key];
      }
    }
    packageSeason.updatedAt = new Date();
  });

  return packageSeason;
};

// --- تابع حذف سند بر اساس _id ---
export const deletePackageSeasonById = async (
  realm: Realm,
  id: BSON.ObjectId
): Promise<boolean> => {
  const packageSeason = realm.objectForPrimaryKey<PackageSeason>("PackageSeason", id);
  if (!packageSeason) return false;

  realm.write(() => {
    realm.delete(packageSeason);
  });

  return true;
};