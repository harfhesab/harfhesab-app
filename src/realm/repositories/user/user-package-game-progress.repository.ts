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