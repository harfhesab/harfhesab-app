import Realm, { BSON } from "realm";
import { PackageStage } from "../../schemas/package-game/PackageStageSchema";
import { PartStage } from "../../schemas/general/embeddeds/PartStageSchema";
import { IPartStage, IWordStage } from "../../interfaces/general/embeddes/part-stage.interface";


function cleanParts(parts: IPartStage[]): PartStage[] {
  const cleaned = parts
    .filter((part): part is IPartStage => part && Array.isArray(part.words))
    .map(part => ({
      _id: part._id,
      sentence: part.sentence,
      sentence_hint: part.sentence_hint ?? null,
      order: part.order ?? null,
      words: part.words
        .filter((word): word is IWordStage => word && typeof word.word === 'string')
        .map((word: IWordStage) => ({
          _id: word._id,
          word: word.word,
          word_hint: word.word_hint ?? null,
          unknown_word: !!word.unknown_word,
          letters: word.letters || [],
          additional_words: word.additional_words || [],
          hidden_words: word.hidden_words || [],
          order: word.order ?? null,
        })),
    }));
  return cleaned as unknown as PartStage[];
}

// --- تابع ایجاد سند جدید ---
export const createPackageStage = (
  realm: Realm,
  data: Partial<Omit<PackageStage, "createdAt" | "updatedAt">> & { _id: BSON.ObjectId | string }
): boolean => {
  try {
    const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
    const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
    const packageId = typeof data.package === "string"? new BSON.ObjectId(data.package):data.package;
    const seasonId = typeof data.season == "string"? new BSON.ObjectId(data.season):data.season;
    const exists = realm.objectForPrimaryKey("Stage", objectId);
    if (exists) return false;

    realm.write(() => {
      realm.create("Stage", {
        ...data,
        _id: objectId,
        language_ref : languageId,
        package : packageId,
        season : seasonId,
        parts: cleanParts(data.parts || []),
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
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const chunk = dataList.slice(i, i + batchSize);

      realm.write(() => {
        chunk.forEach(data => {
          const objectId = typeof data._id === "string" ? new BSON.ObjectId(data._id) : data._id;
          const languageId = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref):data.language_ref;
          const packageId = typeof data.package === "string"? new BSON.ObjectId(data.package):data.package;
          const seasonId = typeof data.season == "string"? new BSON.ObjectId(data.season):data.season;
          const exists = realm.objectForPrimaryKey("PackageStage", objectId);
          if (!exists) {
            realm.create("PackageStage", {
              ...data,
              _id: objectId,
              language_ref : languageId,
              package : packageId,
              season : seasonId,
              parts: cleanParts(data.parts || []),
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
export const updateManyPackageStages = (
  realm: Realm,
  dataList: Array<Partial<Omit<PackageStage, "_id" | "createdAt">> & { _id: BSON.ObjectId | string }>
): boolean => {
  const batchSize = 100;
  try {
    for (let i = 0; i < dataList.length; i += batchSize) {
      const batch = dataList.slice(i, i + batchSize);
      realm.write(() => {
        batch.forEach(data => {
          const objectId = typeof data._id === "string"? new BSON.ObjectId(data._id): data._id;
          const existing = realm.objectForPrimaryKey<PackageStage>("PackageStage", objectId);
          if (existing) {
            if (data.language_ref) {
              existing.language_ref = typeof data.language_ref === "string"? new BSON.ObjectId(data.language_ref) : data.language_ref;
            }
            if (data.package) {
              existing.package = typeof data.package === "string"? new BSON.ObjectId(data.package) : data.package;
            }
            if (data.season) {
              existing.season = typeof data.season === "string"? new BSON.ObjectId(data.season):data.season;
            }
            if (data.parts) {
              existing.parts = cleanParts(data.parts);
            }
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "_id" &&
                key !== "createdAt" &&
                key !== "language_ref" &&
                key !== "package" &&
                key !== "season" &&
                key !== "parts" &&
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
export const deleteManyPackageStages = (
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
          const existing = realm.objectForPrimaryKey<PackageStage>("PackageStage", objectId);
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

// --- تابع گرفتن همه اسناد بر اساس فیلد season بدون pagination ---
export const getPackageStagesBySeasonId = (
  realm: Realm,
  seasonId: BSON.ObjectId | string
): Realm.Results<PackageStage> => {
  try {
    const objectId = typeof seasonId === "string"
      ? new BSON.ObjectId(seasonId)
      : seasonId;

    return realm
      .objects<PackageStage>("PackageStage")
      .filtered("season == $0 AND is_visible == true", objectId)
      .sorted("stage_number_in_season");
  } catch (error) {
    return [] as unknown as Realm.Results<PackageStage>;
  }
};

// --- تابع گرفتن یک سند بر اساس _id ---
export const getPackageStageById = (
  realm: Realm,
  id: BSON.ObjectId | string
): PackageStage | null => {
  try {
    const objectId = typeof id === "string"
      ? new BSON.ObjectId(id)
      : id;

    return realm
      .objectForPrimaryKey<PackageStage>("PackageStage", objectId) || null;
  } catch (error) {
    return null;
  }
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
      if (newData.language_ref) {
        existing.language_ref = typeof newData.language_ref === "string"? new BSON.ObjectId(newData.language_ref): newData.language_ref;
      }
      if (newData.package) {
        existing.package = typeof newData.package === "string"? new BSON.ObjectId(newData.package): newData.package;
      }
      if (newData.season) {
        existing.season = typeof newData.season === "string"? new BSON.ObjectId(newData.season): newData.season;
      }
      if (newData.parts) {
        existing.parts = cleanParts(newData.parts);
      }
      Object.entries(newData).forEach(([key, value]) => {
        if (
          key !== "_id" &&
          key !== "createdAt" &&
          key !== "language_ref" &&
          key !== "package" &&
          key !== "season" &&
          key !== "parts"
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
