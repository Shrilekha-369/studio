'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function MyProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const bookingsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'users', user.uid, 'bookings'), orderBy('bookingDate', 'desc')) : null,
    [firestore, user]
  );
  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="container max-w-screen-lg mx-auto py-12 px-4 md:px-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-12 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-2 text-lg text-foreground/80">Welcome back, {user.displayName || user.email}!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Here is a history of your booked demo sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : (
             bookings && bookings.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Date Booked</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map(booking => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.className} on {booking.classDay} at {booking.classStartTime}</TableCell>
                                <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             ) : (
                <p>You haven&apos;t booked any classes yet.</p>
             )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
