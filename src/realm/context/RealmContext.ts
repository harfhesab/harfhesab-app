import { createRealmContext } from "@realm/react";
import { realmSchemas } from "../schemas";

export const RealmContext = createRealmContext({
  schema: realmSchemas,
  schemaVersion: 1,
  onMigration: (oldRealm, newRealm) => {
    // نمونه تابع مایگریشن
    // if (oldRealm.schemaVersion < 2) {
    //   const oldProgress = oldRealm.objects('UserStageGameProgress');
    //   const newProgress = newRealm.objects('UserStageGameProgress');
      
    //   for (let i = 0; i < oldProgress.length; i++) {
    //     // برای سندهایی که قبلاً تکمیل شده‌اند، زمان تکمیل را به عنوان lastPlayedAt بگذار
    //     if (oldProgress[i].isCompleted) {
    //       newProgress[i].lastPlayedAt = oldProgress[i].completedAt;
    //     } 
    //     // برای سندهای ناتکمیل، زمان فعلی را به عنوان lastPlayedAt بگذار
    //     else {
    //       newProgress[i].lastPlayedAt = new Date();
    //     }
    //   }
    // }
  },
  // deleteRealmIfMigrationNeeded: true,
});

export const {
  RealmProvider,
  useRealm,
  useQuery,
  useObject,
} = RealmContext;
