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