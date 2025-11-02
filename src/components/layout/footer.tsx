
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container max-w-screen-2xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.jpg" alt="One Fitness Logo" width={24} height={24} className="flex-shrink-0" />
            <span className="font-headline font-bold text-lg whitespace-nowrap">One Fitness</span>
          </Link>
          <p className="text-sm text-foreground/60 text-center">
            © {new Date().getFullYear()} One Fitness Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
