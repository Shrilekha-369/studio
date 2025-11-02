'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAdminAuth() {
  const { user, claims, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is resolved
    }

    if (!user) {
      // If no user, redirect to login
      router.push('/login');
      return;
    }

    if (!claims?.admin) {
      // If user is not an admin, redirect to their profile
      router.push('/my-profile');
    }
  }, [user, claims, isUserLoading, router]);

  return { user, claims, isUserLoading };
}
