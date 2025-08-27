import Realm from "realm";

export class WordStage extends Realm.Object<WordStage> {
  _id!: string;
  word!: string;
  word_help_used?: boolean;
  word_builded?: boolean;
  word_hint?: string;
  unknown_word?: boolean;
  unknown_word_completed?: boolean;
  letters: string[] = [];
  letters_help_used?: number[] = [];
  additional_words: string[] = [];
  additional_words_builded: string[] = [];
  hidden_words: string[] = [];
  hidden_words_builded: string[] = [];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "WordStage",
    embedded: true,
    properties: {
      _id: "string",
      word: "string",
      word_help_used: { type: "bool", default: false },
      word_builded: { type: "bool", default: false },
      word_hint: "string?",
      unknown_word: { type: "bool", default: false },
      unknown_word_completed: { type: "bool", default: false },
      letters: "string[]",
      letters_help_used: "int?",
      additional_words: "string[]",
      additional_words_builded: "string[]",
      hidden_words: "string[]",
      hidden_words_builded: "string[]",
      order: "int?",
    },
  };
}

export class PartStage extends Realm.Object<PartStage> {
  _id!: string;
  sentence!: string;
  sentence_builded?: boolean;
  sentence_hint?: string;
  words!: WordStage[];
  order?: number;

  static schema: Realm.ObjectSchema = {
    name: "PartStage",
    embedded: true,
    properties: {
      _id: "string",
      sentence: "string",
      sentence_builded: { type: "bool", default: false },
      sentence_hint: "string?",
      words: "WordStage[]",
      order: "int?",
    },
  };
}