import React, { useRef } from 'react';
import { RealmProvider } from '.';
import { DatabaseLoader } from '../components/loader/DatabaseLoader';

interface Props {
  children: React.ReactNode;
}

export const RealmProviderWrapper = ({ children }: Props) => {
  const realmRef = useRef(null);

  return (
    <RealmProvider
      fallback={<DatabaseLoader />}
      realmRef={realmRef}
      closeOnUnmount={false}
    >
      {children}
    </RealmProvider>
  );
};