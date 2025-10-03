import Realm, { BSON } from "realm";
import { SubscriptionPlan } from "../../schemas/user/SubscriptionPlanSchema";


// --- تابع ایجاد گروهی سند جدید و پاک کردن اسناد قبلی ---
export const createSubscriptionPlansList = (
  realm: Realm,
  dataList: Array<
    Partial<Omit<SubscriptionPlan, "createdAt" | "updatedAt">> & {
      _id: BSON.ObjectId | string;
    }
  >
): boolean => {
  try {
    realm.write(() => {
      // حذف همه اسناد قبلی SubscriptionPlan
      const allOld = realm.objects<SubscriptionPlan>("SubscriptionPlan");
      realm.delete(allOld);

      // درج لیست جدید
      dataList.forEach((data) => {
        const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id): data._id;

        realm.create(
          "SubscriptionPlan",
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
export const getAllSubscriptionPlansList = (
  realm: Realm,
): Realm.Results<SubscriptionPlan> => {
  try {
    const subscriptionPlans = realm
      .objects<SubscriptionPlan>("SubscriptionPlan")
      .filtered("is_visible == true")
      .sorted("order", false); // false = صعودی (ascending)

    return subscriptionPlans;
  } catch (error) {
    return [] as unknown as Realm.Results<SubscriptionPlan>;
  }
};