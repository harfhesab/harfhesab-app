import Realm, { BSON } from "realm";
import { Language } from "../../schemas/general/LanguageSchema";

// --- تابع ایجاد سند جدید ---
export const createLanguage = (
  realm: Realm,
  data: Partial<Omit<Language, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const exists = realm.objectForPrimaryKey("Language", objectId);
    if (exists) return false;

    realm.write(() => {
      realm.create("Language", {
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
export const createManyLanguages = (
  realm: Realm,
  dataList: Array<Partial<Omit<Language, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const chunk = dataList.slice(i, i + batchSize);

      realm.write(() => {
        chunk.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const exists = realm.objectForPrimaryKey("Language", objectId);
          if (!exists) {
            realm.create("Language", {
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

// تابع آپدیت گروهی اسناد
export const updateManyLanguages = (
  realm: Realm,
  dataList: Array<Partial<Omit<Language, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const existing = realm.objectForPrimaryKey<Language>("Language", objectId);
          if (existing) {
            // فقط فیلدهای مجاز را آپدیت می‌کنیم
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "_id" &&
                key !== "createdAt" &&
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
export const deleteManyLanguages = (
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
          const existing = realm.objectForPrimaryKey<Language>("Language", objectId);
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

// --- تابع گرفتن همه اسناد ---
export const getAllLanguages = (
  realm: Realm,
): Language[] => {

  const results = realm
    .objects<Language>("Language")
    .filtered("is_visible == true")
    .sorted("order");

  return Array.from(results);
};

// --- تابع حذف سند بر اساس _id ---
export const deleteLanguageById = (realm: Realm, id: BSON.ObjectId | string): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const target = realm.objectForPrimaryKey("Language", objectId);

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
export const updateLanguageById = (
  realm: Realm,
  id: BSON.ObjectId | string,
  newData: Partial<Omit<Language, "_id" | "createdAt">>
): boolean => {
  try {
    const objectId = typeof id === "string" ? new BSON.ObjectId(id) : id;
    const existing = realm.objectForPrimaryKey<Language>("Language", objectId);

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