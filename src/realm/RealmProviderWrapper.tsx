// import React, { useRef } from 'react';
// import { RealmProvider } from '.';
// import { ProvidersLoader } from '../components/loader/ProvidersLoader';

// interface Props {
//   children: React.ReactNode;
// }

// export const RealmProviderWrapper = ({ children }: Props) => {
//   const realmRef = useRef(null);

//   return (
//     <RealmProvider
//       fallback={<ProvidersLoader />}
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
import { getOrCreateRealmEncryptionKey } from './security/realmEncryptionKey';
import { ProvidersLoader } from '../components/loader/ProvidersLoader';

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
    return <ProvidersLoader />;
  }

  return (
    <RealmProvider
      fallback={<ProvidersLoader />}
      realmRef={realmRef}
      closeOnUnmount={false}
      encryptionKey={encryptionKey}
    >
      {children}
    </RealmProvider>
  );
};