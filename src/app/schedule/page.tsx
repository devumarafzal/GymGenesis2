
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, Zap, User as TrainerLucideIcon, Users2 } from 'lucide-react'; // Renamed User to TrainerLucideIcon
import { useToast } from "@/hooks/use-toast";
import type { DayOfWeek as PrismaDayOfWeek } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { getClassesForSchedule, type GymClassWithDetails } from '@/app/actions/classActions';
import { bookClass as bookClassAction } from '@/app/actions/bookingActions';

// Define DayOfWeek type for client-side sorting and display
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const daysOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export default function SchedulePage() {
  const [allClasses, setAllClasses] = useState<GymClassWithDetails[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, isAuthenticated, isLoading: authIsLoading } = useAuth();

  const fetchScheduleData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const classesData = await getClassesForSchedule();
      setAllClasses(classesData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load schedule.", variant: "destructive" });
      console.error("Failed to load schedule data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);
  
  // Optional: Re-fetch on focus/visibility if frequent updates are expected from other tabs
  useEffect(() => {
    const handleFocus = () => {
      if (!authIsLoading) fetchScheduleData(); // Avoid refetch if auth state is still loading
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchScheduleData, authIsLoading]);


  const handleBookClass = async (gymClassToBook: GymClassWithDetails) => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Login Required",
        description: "Please sign in to book a class.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update can be complex with server actions if not returning full updated list.
    // For now, show loading and then re-fetch or rely on server response for single item update.
    // A simple approach is to disable button and show loading.
    
    const result = await bookClassAction(currentUser.id, gymClassToBook.id);

    if (result.success) {
      toast({
        title: "Booking Successful!",
        description: `You've booked ${gymClassToBook.serviceTitle}.`,
        variant: "default"
      });
      // Refresh data to show updated booking counts and status
      fetchScheduleData();
    } else {
      toast({
        title: "Booking Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const groupClassesByDay = (classesToSort: GymClassWithDetails[]): Record<DayOfWeek, GymClassWithDetails[]> => {
    const grouped: Record<DayOfWeek, GymClassWithDetails[]> = {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
    classesToSort.forEach(cls => {
        if (grouped[cls.dayOfWeek as DayOfWeek]) { // Cast PrismaDayOfWeek to client DayOfWeek
            grouped[cls.dayOfWeek as DayOfWeek].push(cls);
        }
    });
    for (const day in grouped) {
        grouped[day as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  };

  const groupedClasses = groupClassesByDay(allClasses);

  if (authIsLoading || isDataLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-8 md:py-12 bg-background flex justify-center items-center">
          <p>Loading schedule...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-12 bg-background">
        <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Class <span className="text-primary">Schedule</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Find your next workout! Browse our diverse range of classes and book your spot.
            </p>
          </div>

          {daysOrder.map(day => (
            groupedClasses[day] && groupedClasses[day].length > 0 && (
              <div key={day} className="mb-10">
                <h2 className="font-headline text-2xl font-semibold text-primary mb-4 flex items-center">
                  <CalendarDays className="mr-3 h-6 w-6" /> {day}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedClasses[day].map(gymClass => {
                    const bookedCount = gymClass._count?.bookings ?? 0;
                    const spotsRemaining = gymClass.capacity - bookedCount;
                    // To check if current user booked this class, we'd need more data from `getBookingsForUser`
                    // or make another check. For now, this info isn't directly available on this page after Prisma refactor.
                    // A simplified "isBookedByCurrentUser" would require fetching user's specific bookings.
                    // Let's assume for now we don't display "Booked" state directly on this page,
                    // relies on toast and member dashboard.
                    // If a user tries to book again, the backend will prevent it.
                    const isFull = spotsRemaining <= 0;
                    
                    let buttonText = "Book Class";
                    let buttonDisabled = false;

                    if (!isAuthenticated) {
                        buttonText = "Login to Book";
                    } else if (isFull) {
                        buttonText = "Class Full";
                        buttonDisabled = true;
                    }
                    // Missing: Check if already booked by current user. Requires fetching user's bookings.
                    // The backend `bookClassAction` handles this check.

                    return (
                      <Card key={gymClass.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <CardHeader>
                          <CardTitle className="font-headline text-xl flex items-center">
                            <Zap className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                            {gymClass.serviceTitle}
                          </CardTitle>
                          <CardDescription className="flex items-center pt-1">
                            <TrainerLucideIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {gymClass.trainer?.name || "N/A (Unassigned)"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>{gymClass.startTime} - {gymClass.endTime}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>Capacity: {gymClass.capacity}</span>
                          </div>
                           <div className="flex items-center text-sm text-muted-foreground">
                            <Users2 className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>Booked: {bookedCount}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users2 className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>Spots Remaining: {spotsRemaining > 0 ? spotsRemaining : 0}</span>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={() => handleBookClass(gymClass)}
                            disabled={buttonDisabled || !isAuthenticated} // Also disable if not authenticated
                          >
                            {buttonText}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )
          ))}
           {allClasses.length === 0 && !isDataLoading && (
             <p className="text-center text-muted-foreground text-lg">No classes are currently scheduled. Please check back later or contact administration.</p>
           )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
