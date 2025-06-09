import Realm, { BSON } from "realm";

export class WordStage extends Realm.Object<WordStage> {
  _id!: BSON.ObjectId;
  word!: string;
  word_hint?: string;
  unknown_word?: boolean;
  letters: string[] = []; 
  additional_words: string[] = [];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "WordStage",
    embedded: true,
    properties: {
      _id: "objectId",
      word: "string",
      word_hint: "string?",
      unknown_word: { type: "bool", default: false },
      letters: "string[]",
      additional_words: "string[]",
      order: "int?",
    },
  };
}

export class PartStage extends Realm.Object<PartStage> {
  _id!: BSON.ObjectId;
  sentence!: string;
  sentence_hint?: string;
  words!: WordStage[];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "PartStage",
    embedded: true,
    properties: {
      _id: "objectId",
      sentence: "string",
      sentence_hint: "string?",
      words: "WordStage[]",
      order: "int?",
    },
  };
}