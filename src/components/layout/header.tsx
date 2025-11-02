"use client";

import Link from "next/link";
import { Dumbbell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Booking" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg">One Fitness</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === item.href ? "text-primary font-semibold" : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-background">
            <div className="p-4">
              <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsOpen(false)}>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="font-headline font-bold text-lg">One Fitness</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                   <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                   </SheetClose>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
