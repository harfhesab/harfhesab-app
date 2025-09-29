import Realm, { BSON } from "realm";
import { UserPackage } from "../../schemas/user/UserPackageSchema";
import { Package } from "../../schemas/package-game/PackageSchema";


export const checkExistUserPackageWithPakcageId = (
  realm: Realm,
  packageId: BSON.ObjectId | string
): { user_package: UserPackage | null; package: Package | null } | null => {
  try {
    const packageObjectId =
      typeof packageId === "string" ? new BSON.ObjectId(packageId) : packageId;

    // پیدا کردن UserPackage مربوطه
    const userPackage = realm
      .objects<UserPackage>("UserPackage")
      .filtered("package_ref == $0", packageObjectId)[0] ?? null;

    // پیدا کردن Package مربوطه
    const pkg = realm.objectForPrimaryKey<Package>(
      "Package",
      packageObjectId
    ) ?? null;

    return {
      user_package: userPackage,
      package: pkg,
    };
  } catch (e) {
    return null;
  }
};

export const changeCompletionStatusUserPackage = ( 
  realm: Realm,
  userPackageId: BSON.ObjectId | string,
  completionStatus: boolean,
): boolean => {
  try {
    const objectId = typeof userPackageId === "string"? new BSON.ObjectId(userPackageId): userPackageId;
    const userPackage = realm.objectForPrimaryKey<UserPackage>(
      "UserPackage",
      objectId
    );
    if (!userPackage) {
      return false;
    }
    realm.write(() => {
      userPackage.content_completed = completionStatus;
      userPackage.updatedAt = new Date(); // آپدیت زمان تغییر
    });
    return true;
  } catch (e) {
    return false;
  }
};



// --- تابع ایجاد سند جدید ---
export const createUserPackage = (
  realm: Realm,
  data: Partial<Omit<UserPackage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const packageId = typeof data.package_ref === "string"? new BSON.ObjectId(data.package_ref) : data.package_ref;
    const exists = realm.objectForPrimaryKey("UserPackage", objectId);
    if (exists) return true;

    realm.write(() => {
      realm.create("UserPackage", {
        ...data,
        _id: objectId,
        package_ref: packageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return true;
  } catch (e) {
    return false;
  }
};