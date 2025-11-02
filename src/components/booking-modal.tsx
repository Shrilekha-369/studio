
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { ClassSchedule } from "@/lib/types";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile, Booking } from '@/lib/types';
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { format } from 'date-fns';


export function BookingModal({ classInfo }: { classInfo: ClassSchedule }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [formPhone, setFormPhone] = useState('');

  const userProfileRef = useMemoFirebase(
    () => (user && !user.isAnonymous ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Only update phone number from profile if the user hasn't started typing
    if (userProfile && formPhone === '') {
      setFormPhone(userProfile.phone || '');
    }
  }, [userProfile, formPhone]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || user.isAnonymous) {
        toast({
            title: "Authentication Error",
            description: "You must be signed in to book a demo.",
            variant: "destructive"
        });
        return;
    }
    
    // Update phone number if it has changed and is different from the profile
    if (userProfile && formPhone !== userProfile.phone) {
       setDocumentNonBlocking(userProfileRef!, { phone: formPhone }, { merge: true });
    }

    const booking: Omit<Booking, 'id'> = {
        classScheduleId: classInfo.id,
        userId: user.uid,
        bookingDate: new Date().toISOString(),
        status: 'pending',
        // Denormalize for easier display in admin and user profile
        className: classInfo.className,
        classDate: classInfo.classDate,
        classStartTime: classInfo.startTime,
    };

    const bookingsColRef = collection(firestore, 'users', user.uid, 'bookings');
    addDocumentNonBlocking(bookingsColRef, booking);

    toast({
      title: "Booking Successful!",
      description: `Your demo for ${classInfo.className} has been requested. We'll be in touch!`,
      variant: "default"
    });
    setOpen(false);
  };

  const time = `${format(new Date(classInfo.classDate), 'MMM d')} at ${classInfo.startTime}`;

  const renderContent = () => {
    // Show skeleton while auth state or profile is loading
    if (isUserLoading || (user && !user.isAnonymous && isProfileLoading)) {
        return (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="pt-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <DialogFooter className="pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </DialogFooter>
          </div>
        )
    }
    // Prompt user to log in if not authenticated
    if (!user || user.isAnonymous) {
        return (
             <DialogHeader className="p-6">
                <DialogTitle className="font-headline text-primary">Join Us to Book a Demo</DialogTitle>
                <DialogDescription>
                  Please sign up or log in to book your free demo class. It only takes a second!
                </DialogDescription>
                 <DialogFooter className="sm:justify-center pt-4 gap-2">
                     <DialogClose asChild><Button asChild><Link href="/login">Login</Link></Button></DialogClose>
                     <DialogClose asChild><Button asChild variant="outline"><Link href="/signup">Sign Up</Link></Button></DialogClose>
                 </DialogFooter>
              </DialogHeader>
        )
    }

    // Main booking form for logged-in users
    return (
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">Book Demo: {classInfo.className}</DialogTitle>
            <DialogDescription>
              Confirm your details to book a free demo for {time}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required value={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : user.displayName || ''} disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required value={user.email || ''} disabled />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" type="tel" placeholder="Your Phone Number" className="col-span-3" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
            <Button type="submit">
                Confirm Booking
            </Button>
          </DialogFooter>
        </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" disabled={classInfo.spotsLeft === 0} className="disabled:opacity-50 disabled:cursor-not-allowed">
          {classInfo.spotsLeft > 0 ? "Book Demo" : "Full"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background p-0">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
