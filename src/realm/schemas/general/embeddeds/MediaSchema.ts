import Realm from "realm";

export class Media extends Realm.Object<Media> {
  path!: string;
  order?: number;
  file_type?: string;
  duration?: string;

  static schema: Realm.ObjectSchema = {
    name: "Media",
    embedded: true,
    properties: {
      path: "string",
      order: "int?",
      file_type: "string?",
      duration: "string?",
    },
  };
}