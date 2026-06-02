// import React, { useRef } from 'react';
// import { RealmProvider } from '.';
// import { DatabaseLoader } from '../components/loader/DatabaseLoader';

// interface Props {
//   children: React.ReactNode;
// }

// export const RealmProviderWrapper = ({ children }: Props) => {
//   const realmRef = useRef(null);

//   return (
//     <RealmProvider
//       fallback={<DatabaseLoader />}
//       realmRef={realmRef}
//       closeOnUnmount={false}
//     >
//       {children}
//     </RealmProvider>
//   );
// };


// RealmProviderWrapper.tsx
import React, { useEffect, useRef, useState } from 'react';
import { RealmProvider } from '.';
import { DatabaseLoader } from '../components/loader/DatabaseLoader';
import { getOrCreateRealmEncryptionKey } from './security/realmEncryptionKey';

interface Props {
  children: React.ReactNode;
}

export const RealmProviderWrapper = ({ children }: Props) => {
  const realmRef = useRef(null);
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const key = await getOrCreateRealmEncryptionKey();
        if (mounted) setEncryptionKey(key);
      } catch (error) {
        console.error('Realm encryption key init failed:', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!encryptionKey) {
    return <DatabaseLoader />;
  }

  return (
    <RealmProvider
      fallback={<DatabaseLoader />}
      realmRef={realmRef}
      closeOnUnmount={false}
      encryptionKey={encryptionKey}
    >
      {children}
    </RealmProvider>
  );
};