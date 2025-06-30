import { createRealmContext } from "@realm/react";
import { realmSchemas } from "../schemas";

export const RealmContext = createRealmContext({
  schema: realmSchemas,
  schemaVersion: 1,
});

export const {
  RealmProvider,
  useRealm,
  useQuery,
  useObject,
} = RealmContext;