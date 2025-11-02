'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collectionGroup, query, where, getDocs, doc, DocumentSnapshot, getDoc, DocumentData, DocumentReference } from 'firebase/firestore';
import type { Booking, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, RefreshCw } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type BookingWithUser = Booking & { user?: UserProfile };

export function BookingManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    if (!firestore) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const bookingsQuery = query(collectionGroup(firestore, 'bookings'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(bookingsQuery);
      
      const bookingsData: BookingWithUser[] = [];
      const userCache = new Map<string, UserProfile>();

      for (const bookingDoc of querySnapshot.docs) {
        // The booking document's path is /users/{userId}/bookings/{bookingId}
        // We need to get the parent's parent to get the userId
        const userId = bookingDoc.ref.parent.parent?.id;

        if (!userId) {
          console.warn('Could not determine userId for booking:', bookingDoc.id);
          continue; 
        }

        const booking = { id: bookingDoc.id, userId, ...bookingDoc.data() } as Booking;
        let userProfile: UserProfile | undefined = userCache.get(booking.userId);

        if (!userProfile) {
            const userDocRef: DocumentReference<DocumentData> = doc(firestore, 'users', booking.userId);
            const userDocSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
                userCache.set(booking.userId, userProfile);
            }
        }
        
        bookingsData.push({ ...booking, user: userProfile });
      }

      setBookings(bookingsData);
    } catch (error: any) {
      toast({ title: 'Error fetching bookings', description: error.message, variant: 'destructive' });
      console.error("Error fetching bookings:", error);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if(firestore) {
      fetchBookings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const handleUpdateStatus = (booking: Booking, newStatus: 'approved' | 'rejected') => {
    if (!firestore || !booking.userId) return;
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
                    <div className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                    <div className="text-xs text-muted-foreground">{booking.user?.phone}</div>
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
