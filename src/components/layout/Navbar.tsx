"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Zap, Shield, User, LogOut, CalendarDays, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; 

const navLinks = [
  { href: "/schedule", label: "Schedule" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, role, signOutAndRedirect, isLoading } = useAuth();

  const getProfileLink = () => {
    if (!currentUser) return "/signin";
    switch (role) {
      case 'ADMIN': return "/admin";
      case 'TRAINER': return "/trainer-dashboard";
      case 'MEMBER': return "/member-dashboard";
      default: return "/signin";
    }
  };

  const getProfileIcon = () => {
    if (!currentUser) return <User className="h-5 w-5" />;
    switch (role) {
      case 'ADMIN': return <Shield className="h-5 w-5" />;
      case 'TRAINER': return <Zap className="h-5 w-5" />;
      case 'MEMBER': return <User className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-headline text-xl font-bold tracking-tight">
            Gym<span className="text-primary">Genesis</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          {!isLoading && (
            currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={getProfileLink()}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center space-x-1"
                >
                  {getProfileIcon()}
                  <span className="ml-1">{currentUser.name}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOutAndRedirect('/signin')}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link href="/signin">
                <Button variant="default">Sign In</Button>
              </Link>
            )
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {!isLoading && (
                currentUser ? (
                  <>
                    <Link
                      href={getProfileLink()}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {getProfileIcon()}
                      <span className="ml-2">{currentUser.name}</span>
                    </Link>
                    <Button variant="ghost" className="justify-start" onClick={() => { signOutAndRedirect('/signin'); setIsMobileMenuOpen(false); }}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">Sign In</Button>
                  </Link>
                )
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
