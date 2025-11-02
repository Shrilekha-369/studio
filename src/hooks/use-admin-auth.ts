'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAdminAuth() {
  const { user, claims, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If not logged in or not an admin, redirect to home page.
    if (!user || !claims?.admin) {
      router.push('/login');
    }
  }, [user, claims, isUserLoading, router]);

  return { user, claims, isUserLoading };
}
