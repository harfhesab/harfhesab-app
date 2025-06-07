export interface IStageGameVersionControl {
  _id: Realm.BSON.ObjectId;
  version_created: number;
  version_updated: number;
  version_deleted: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}