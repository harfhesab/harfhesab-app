import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';
import { encode as btoa, decode as atob } from 'base-64';

const SERVICE = 'com.harfhesab.app.realm.encryption-key';
const USERNAME = 'realm';
const KEY_SIZE = 64;

function toBase64(bytes: Uint8Array): string {
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function createRandomKey(): Uint8Array {
  const key = new Uint8Array(KEY_SIZE);

  crypto.getRandomValues(key);

  return key;
}

export async function getOrCreateRealmEncryptionKey(): Promise<Uint8Array> {
  const credentials = await Keychain.getGenericPassword({
    service: SERVICE,
  });

  // اگر قبلاً کلید ذخیره شده باشد
  if (credentials) {
    const key = fromBase64(credentials.password);

    if (key.length !== KEY_SIZE) {
      throw new Error(
        `Stored Realm encryption key has invalid length (${key.length}). Expected ${KEY_SIZE}.`
      );
    }

    return key;
  }

  // اولین اجرا
  const key = createRandomKey();

  const saved = await Keychain.setGenericPassword(
    USERNAME,
    toBase64(key),
    {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }
  );

  if (!saved) {
    throw new Error('Failed to store Realm encryption key in Keychain');
  }

  return key;
}