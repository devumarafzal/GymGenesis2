
import Link from "next/link";
import { Facebook, Instagram, Twitter, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-foreground">
                GymGenesis
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Elevate your fitness journey with us. <br />
              Your path to a stronger, healthier you starts here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <p className="font-headline font-semibold text-foreground">Quick Links</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/#services" className="text-muted-foreground hover:text-primary">Services</Link></li>
                <li><Link href="/#testimonials" className="text-muted-foreground hover:text-primary">Testimonials</Link></li>
                <li><Link href="/#contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="/signup" className="text-muted-foreground hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-headline font-semibold text-foreground">Legal</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-headline font-semibold text-foreground">Connect</p>
              <div className="mt-4 flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Facebook</span><Facebook className="h-6 w-6" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Instagram</span><Instagram className="h-6 w-6" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><span className="sr-only">Twitter</span><Twitter className="h-6 w-6" /></Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GymGenesis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
