import Realm from "realm";

export class StageGameVersionControl extends Realm.Object<StageGameVersionControl> {
  _id!: Realm.BSON.ObjectId;
  version_created!: number;
  version_updated!: number;
  version_deleted!: number;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'StageGameVersionControl',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      version_created: { type: 'int', default: 0 },
      version_updated: { type: 'int', default: 0 },
      version_deleted: { type: 'int', default: 0 },
      active: { type: 'bool', default: false },
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
    },
  };
}

