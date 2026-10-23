import Realm from "realm";
import { UserStageGameProgress } from "../realm/schemas/user/UserStageGameProgressSchema";
import { UserWordGameProgress } from "../realm/schemas/user/UserWordGameProgressSchema";
import { UserPackage } from "../realm/schemas/user/UserPackageSchema";


const EXPERIENCED_STAGE_THRESHOLD = 7;

// LIMIT(1): Realm stops scanning at the first match instead of checking every document.
const EXPERIENCED_QUERY = "last_stage_number > $0 LIMIT(1)";

const hasStageAbove = (realm: Realm, schemaName: string): boolean =>
  !realm
    .objects(schemaName)
    .filtered(EXPERIENCED_QUERY, EXPERIENCED_STAGE_THRESHOLD)
    .isEmpty();

export const isExperiencedUser = (realm: Realm): boolean =>
  hasStageAbove(realm, UserStageGameProgress.schema.name) ||
  hasStageAbove(realm, UserWordGameProgress.schema.name) ||
  hasStageAbove(realm, UserPackage.schema.name);



// نحوه استفاده
// const realm = useRealm();
// const isExperienced = isExperiencedUser(realm); 