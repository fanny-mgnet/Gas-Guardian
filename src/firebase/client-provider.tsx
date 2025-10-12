'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo is appropriate here to ensure getSdks is called only once.
  const sdks = useMemo(() => getSdks(), []);

  return (
    <FirebaseProvider
      firebaseApp={sdks?.firebaseApp ?? null}
      auth={sdks?.auth ?? null}
      firestore={sdks?.firestore ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}
