import Realm, { BSON } from "realm";
import { Package } from "../../schemas/package-game/PackageSchema";


// --- تابع ایجاد سند جدید ---
export const createPackage = (
  realm: Realm,
  data: Partial<Omit<Package, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const exists = realm.objectForPrimaryKey("Package", objectId);
    if (exists) return true;

    realm.write(() => {
      realm.create("Package", {
        ...data,
        _id: objectId,
        language_ref : languageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  } catch (e) {
    return false;
  }
};


// --- تابع بروزرسانی با جایگزینی کامل ---
export const updatePreviousPackage = (
  realm: Realm,
  packageId: BSON.ObjectId | string,
  data: Partial<Omit<Package, "_id" | "createdAt" | "updatedAt">>
): boolean => {
  try {
    const objectId = typeof packageId === "string" ? new BSON.ObjectId(packageId) : packageId;
    const exists = realm.objectForPrimaryKey<Package>("Package", objectId);
    if (!exists) return false;
    const languageId =typeof data.language_ref === "string" ? new BSON.ObjectId(data.language_ref): data.language_ref ?? null;
    realm.write(() => {
      realm.create(
        "Package",
        {
          _id: objectId,
          title: data.title ?? exists?.title,
          free: data.free ?? exists?.free,
          free_with_subscription: data.free_with_subscription ?? exists?.free_with_subscription,
          price: data.price ?? exists?.price,
          testable: data.testable ?? true,
          is_visible: data.is_visible ?? exists?.is_visible,
          is_active: data.is_active ?? exists?.is_active,
          description: data.description ?? null,
          subject: data.subject ?? null,
          badge: data.badge ?? null,
          language_ref: languageId,
          icon_image: data.icon_image ?? exists?.icon_image,
          banner_image: data.banner_image ?? exists?.banner_image,
          music: data.music ?? null,
          number_stage: data.number_stage ?? exists?.number_stage,
          number_season: data.number_season ?? exists?.number_season,
          createdAt: exists.createdAt,
          updatedAt: new Date(),
        },
        Realm.UpdateMode.Modified
      );
    });

    return true;
  } catch (e) {
    return false;
  }
};
