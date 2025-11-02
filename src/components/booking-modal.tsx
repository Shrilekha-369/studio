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
import Link from "next/link";


export function BookingModal({ classInfo }: { classInfo: ClassSchedule }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');


  useEffect(() => {
    if (user && !user.isAnonymous) {
      setFormEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
        if (!isUserLoading) {
            initiateAnonymousSignIn(auth);
        }
        toast({
            title: "Authentication Error",
            description: "Your session is being prepared. Please try again in a moment.",
            variant: "destructive"
        });
        return;
    }
    
    const userProfile: Omit<UserProfile, 'id'> = {
        firstName: formName.split(' ')[0] || '',
        lastName: formName.split(' ').slice(1).join(' ') || '',
        email: formEmail,
        phone: formPhone,
    };
    
    if (!user.isAnonymous) {
        const userProfileRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userProfileRef, userProfile, { merge: true });
    }

    const booking: Omit<Booking, 'id'> = {
        classScheduleId: classInfo.id,
        userId: user.uid,
        bookingDate: new Date().toISOString(),
        status: 'pending',
        // Denormalize for easier display
        className: classInfo.className,
        classDay: classInfo.dayOfWeek,
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

  const time = `${classInfo.dayOfWeek.substring(0,3)} ${classInfo.startTime}`;

  const renderContent = () => {
    if (isUserLoading) {
        return <p>Loading...</p>;
    }
    if (user && user.isAnonymous) {
        return (
             <DialogHeader>
                <DialogTitle className="font-headline text-primary">Join Us to Book a Demo</DialogTitle>
                <DialogDescription>
                  Please sign up or log in to book your free demo class. It only takes a second!
                </DialogDescription>
                 <div className="flex justify-center gap-4 pt-4">
                     <Button asChild><Link href="/login">Login</Link></Button>
                     <Button asChild variant="outline"><Link href="/signup">Sign Up</Link></Button>
                 </div>
              </DialogHeader>
        )
    }

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
              <Input id="name" name="name" placeholder="Your Name" className="col-span-3" required value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" className="col-span-3" required value={formEmail} onChange={e => setFormEmail(e.target.value)} disabled={!!user && !user.isAnonymous} />
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
            <Button type="submit" disabled={isUserLoading}>
                {isUserLoading ? "Initializing..." : "Confirm Booking"}
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
      <DialogContent className="sm:max-w-[425px] bg-background">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
