'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // If user is already signed in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If no user, sign in anonymously and then redirect
        initiateAnonymousSignIn(auth);
      }
    }
  }, [user, isUserLoading, auth, router]);

  // While checking auth state, you can show a loading indicator
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}
