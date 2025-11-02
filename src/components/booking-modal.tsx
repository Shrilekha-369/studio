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
import { useAuth, useUser, useFirestore, initiateAnonymousSignIn, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserProfile, Booking } from '@/lib/types';


export function BookingModal({ classInfo }: { classInfo: ClassSchedule }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If there is no user and we're not in a loading state, sign in anonymously.
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
        toast({
            title: "Authentication Error",
            description: "Please wait while we prepare your session.",
            variant: "destructive"
        });
        return;
    }
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    const userProfile: Omit<UserProfile, 'id'> = {
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        phone,
    };
    
    const userProfileRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userProfileRef, userProfile, { merge: true });

    const booking: Omit<Booking, 'id'> = {
        classScheduleId: classInfo.id,
        userId: user.uid,
        bookingDate: new Date().toISOString(),
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

  const time = `${classInfo.dayOfWeek.substring(0,3)} ${classInfo.startTime}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" disabled={classInfo.spotsLeft === 0} className="disabled:opacity-50 disabled:cursor-not-allowed">
          {classInfo.spotsLeft > 0 ? "Book Demo" : "Full"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background">
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
              <Input id="name" name="name" placeholder="Your Name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" type="tel" placeholder="Your Phone Number" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
            <Button type="submit" disabled={isUserLoading}>
                {isUserLoading ? "Initializing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
