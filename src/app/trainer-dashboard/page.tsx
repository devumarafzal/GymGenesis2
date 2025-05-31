
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, CalendarClock, ClipboardList, LogOut } from 'lucide-react';

export default function TrainerDashboardPage() {
  const { currentUser, role, isLoading, signOutAndRedirect, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'trainer')) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, role, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading dashboard...</p></div>;
  }

  if (!currentUser || role !== 'trainer') {
     return <div className="flex justify-center items-center min-h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-12 bg-background">
        <div className="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trainer <span className="text-primary">Dashboard</span>
            </h1>
             <Button variant="outline" onClick={() => signOutAndRedirect('/signin')}>
                <LogOut className="mr-2 h-5 w-5" /> Sign Out
            </Button>
          </div>

          <Card className="shadow-xl mb-8">
             <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <UserCircle className="h-10 w-10 text-primary" />
                    <div>
                        <CardTitle className="font-headline text-2xl">{currentUser.name}</CardTitle>
                        <CardDescription>{currentUser.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your schedule and client interactions.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <CalendarClock className="mr-2 h-6 w-6 text-accent" /> My Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View your upcoming classes and appointments.</p>
                <Button disabled className="w-full">View Schedule (Coming Soon)</Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <ClipboardList className="mr-2 h-6 w-6 text-accent" /> Assigned Classes/Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Manage details for your assigned classes and clients.</p>
                <Button disabled className="w-full">Manage Assignments (Coming Soon)</Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
