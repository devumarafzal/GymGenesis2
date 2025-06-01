"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, CalendarClock, LogOut, Clock as TimeIcon, Users as ParticipantsIcon, Users2 as CapacityIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getTrainerSchedule } from '@/app/actions/trainerActions';
import type { GymClassWithDetails } from '@/app/actions/classActions';
import type { DayOfWeek as PrismaDayOfWeek } from '@prisma/client'; // For sorting

const daysOrder: PrismaDayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TrainerDashboardPage() {
  const { currentUser, role, isLoading: authIsLoading, signOutAndRedirect, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [assignedClasses, setAssignedClasses] = useState<GymClassWithDetails[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchTrainerData = useCallback(async () => {
    if (currentUser && isAuthenticated && role === 'TRAINER') {
      setIsDataLoading(true);
      try {
        const scheduleData = await getTrainerSchedule(currentUser.id);
        // Client-side sorting for DayOfWeek
        scheduleData.sort((a, b) => {
            const dayAIndex = daysOrder.indexOf(a.dayOfWeek);
            const dayBIndex = daysOrder.indexOf(b.dayOfWeek);
            if (dayAIndex === dayBIndex) {
                return a.startTime.localeCompare(b.startTime);
            }
            return dayAIndex - dayBIndex;
        });
        setAssignedClasses(scheduleData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load your schedule.", variant: "destructive" });
        console.error("Failed to load trainer schedule:", error);
      } finally {
        setIsDataLoading(false);
      }
    } else {
      setAssignedClasses([]);
      setIsDataLoading(false);
    }
  }, [currentUser, isAuthenticated, role, toast]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || role !== 'TRAINER') {
        router.push('/signin');
      } else {
        fetchTrainerData();
      }
    }
  }, [authIsLoading, isAuthenticated, role, router, fetchTrainerData]);

  if (authIsLoading || isDataLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading dashboard...</p></div>;
  }

  if (!currentUser || role !== 'TRAINER') {
    return <div className="flex justify-center items-center min-h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-12 bg-background">
        <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <CalendarClock className="mr-2 h-6 w-6 text-accent" /> My Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedClasses.length === 0 ? (
                <p className="text-muted-foreground">You have no classes assigned to you currently.</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {assignedClasses.map(gymClass => (
                    <Card key={gymClass.id} className="bg-card/80 p-4">
                      <CardTitle className="text-lg font-semibold text-foreground">{gymClass.serviceTitle}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {gymClass.dayOfWeek}
                      </CardDescription>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="flex items-center text-muted-foreground">
                          <TimeIcon className="mr-2 h-4 w-4" /> {gymClass.startTime} - {gymClass.endTime}
                        </p>
                        <p className="flex items-center text-muted-foreground">
                          <ParticipantsIcon className="mr-2 h-4 w-4" /> Booked: {gymClass._count?.bookings ?? 0}
                        </p>
                         <p className="flex items-center text-muted-foreground">
                          <CapacityIcon className="mr-2 h-4 w-4" /> Capacity: {gymClass.capacity}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

