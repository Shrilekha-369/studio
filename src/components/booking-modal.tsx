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
import type { ClassInfo } from "@/app/booking/page";
import { useState } from "react";

export function BookingModal({ classInfo }: { classInfo: ClassInfo }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission
    // For this UI-only demo, we'll just show a success message and close the dialog
    toast({
      title: "Booking Successful!",
      description: `Your demo for ${classInfo.name} has been requested. We'll be in touch!`,
      variant: "default"
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" disabled={classInfo.spots === 0} className="disabled:opacity-50 disabled:cursor-not-allowed">
          {classInfo.spots > 0 ? "Book Demo" : "Full"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">Book Demo: {classInfo.name}</DialogTitle>
            <DialogDescription>
              Confirm your details to book a free demo for {classInfo.time}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="Your Name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" placeholder="your@email.com" className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" type="tel" placeholder="Your Phone Number" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
            <Button type="submit">Confirm Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
