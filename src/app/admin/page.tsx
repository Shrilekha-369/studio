'use client';

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassScheduleManager } from '@/components/admin/class-schedule-manager';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { user, isUserLoading } = useAdminAuth();

  if (isUserLoading || !user) {
    return (
      <div className="container max-w-screen-lg mx-auto py-12 px-4 md:px-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-12 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-foreground/80">Welcome, {user.email}. Manage your studio here.</p>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="classes" className="font-headline">Class Schedules</TabsTrigger>
          <TabsTrigger value="gallery" className="font-headline">Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <ClassScheduleManager />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
