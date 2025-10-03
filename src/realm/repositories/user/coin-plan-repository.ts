import Realm, { BSON } from "realm";
import { CoinPlan } from "../../schemas/user/CoinPlanSchema";


// --- تابع ایجاد گروهی سند جدید و پاک کردن اسناد قبلی ---
export const createCoinPlansList = (
  realm: Realm,
  dataList: Array<
    Partial<Omit<CoinPlan, "createdAt" | "updatedAt">> & {
      _id: BSON.ObjectId | string;
    }
  >
): boolean => {
  try {
    realm.write(() => {
      // حذف همه اسناد قبلی CoinPlan
      const allOld = realm.objects<CoinPlan>("CoinPlan");
      realm.delete(allOld);

      // درج لیست جدید
      dataList.forEach((data) => {
        const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id): data._id;

        realm.create(
          "CoinPlan",
          {
            ...data,
            _id: objectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          Realm.UpdateMode.Modified
        );
      });
    });

    return true;
  } catch (error) {
    return false;
  }
};

// تابع گرفتن همه اسناد
export const getAllCoinPlansList = (
  realm: Realm,
): Realm.Results<CoinPlan> => {
  try {
    const coinPlans = realm
      .objects<CoinPlan>("CoinPlan")
      .filtered("is_visible == true")
      .sorted("order", false); // false = صعودی (ascending)

    return coinPlans;
  } catch (error) {
    return [] as unknown as Realm.Results<CoinPlan>;
  }
};