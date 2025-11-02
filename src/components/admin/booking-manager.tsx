'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Booking, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


type BookingWithUser = Booking & { user?: UserProfile };

export function BookingManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsQuery = query(collectionGroup(firestore, 'bookings'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(bookingsQuery);
      
      const bookingsData: BookingWithUser[] = [];
      
      // Use a map to fetch each user only once
      const userCache = new Map<string, UserProfile>();

      for (const bookingDoc of querySnapshot.docs) {
        const booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
        let userProfile: UserProfile | undefined = userCache.get(booking.userId);

        if (!userProfile) {
            const userDocRef = doc(firestore, 'users', booking.userId);
            const userDoc = await getDocs(query(collectionGroup(firestore, 'users'), where('id', '==', booking.userId)));
            
            if (!userDoc.empty) {
                const userDocData = userDoc.docs[0].data() as UserProfile;
                userProfile = { id: userDoc.docs[0].id, ...userDocData};
                userCache.set(booking.userId, userProfile);
            }
        }
        
        bookingsData.push({ ...booking, user: userProfile });
      }

      setBookings(bookingsData);
    } catch (error: any) {
      toast({ title: 'Error fetching bookings', description: error.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  useState(() => {
    fetchBookings();
  });

  const handleUpdateStatus = (booking: Booking, newStatus: 'approved' | 'rejected') => {
    const bookingDocRef = doc(firestore, 'users', booking.userId, 'bookings', booking.id);
    updateDocumentNonBlocking(bookingDocRef, { status: newStatus });
    
    setBookings(prev => prev.filter(b => b.id !== booking.id));

    toast({
      title: `Booking ${newStatus}`,
      description: `The booking for ${booking.className} has been ${newStatus}.`,
    });
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-headline">Manage Bookings</h2>
         <Button onClick={fetchBookings} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
      </div>

      {isLoading && <p>Loading pending bookings...</p>}
      
      {!isLoading && bookings.length === 0 && <p>No pending bookings found.</p>}

      {!isLoading && bookings.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date Booked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                    <div>{booking.user?.firstName} {booking.user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                </TableCell>
                <TableCell>{booking.className}</TableCell>
                <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(booking, 'approved')}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(booking, 'rejected')}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
