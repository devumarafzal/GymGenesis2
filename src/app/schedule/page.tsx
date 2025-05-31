
"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, Zap, User, Users2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { GymClass, Trainer, DayOfWeek } from '@/app/admin/page'; // Import types from admin page
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

const daysOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [allClasses, setAllClasses] = useState<GymClass[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Renamed to avoid conflict with other isLoading
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadDataFromStorage = () => {
      if (typeof window !== 'undefined') {
        // setIsLoadingData(true); // You might enable this if reloads feel slow, for visual feedback

        const storedClassesData = localStorage.getItem('adminClasses');
        const currentClasses: GymClass[] = storedClassesData ? JSON.parse(storedClassesData).map((cls: any) => ({
          ...cls,
          bookedUserIds: cls.bookedUserIds || []
        })) : [];
        setAllClasses(currentClasses);

        const storedTrainersData = localStorage.getItem('adminTrainers');
        const currentTrainers: Trainer[] = storedTrainersData ? JSON.parse(storedTrainersData) : [];
        setTrainers(currentTrainers);

        setIsLoadingData(false);
      }
    };

    loadDataFromStorage(); // Initial load

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            loadDataFromStorage();
        }
    };

    window.addEventListener('focus', loadDataFromStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', loadDataFromStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array ensures this effect runs once for setup

  // Effect to save classes back to localStorage when they change (e.g., after a booking on this page)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoadingData) {
      localStorage.setItem('adminClasses', JSON.stringify(allClasses));
    }
  }, [allClasses, isLoadingData]);


  const getTrainerNameById = (trainerId: string): string => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.name : "N/A (Unassigned)";
  };

  const handleBookClass = (gymClassToBook: GymClass) => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Login Required",
        description: "Please sign in to book a class.",
        variant: "destructive",
      });
      return;
    }

    // Re-check the class from the current state to ensure it's the latest version
    const freshClassToBook = allClasses.find(c => c.id === gymClassToBook.id);
    if (!freshClassToBook) {
        toast({ title: "Error", description: "Class not found. It might have been removed.", variant: "destructive"});
        return;
    }


    if (freshClassToBook.bookedUserIds.includes(currentUser.id)) {
      toast({
        title: "Already Booked",
        description: "You have already booked this class.",
        variant: "default",
      });
      return;
    }

    if (freshClassToBook.bookedUserIds.length >= freshClassToBook.capacity) {
      toast({
        title: "Class Full",
        description: "Sorry, this class is already full.",
        variant: "destructive",
      });
      return;
    }

    // Proceed with booking
    setAllClasses(prevClasses => 
      prevClasses.map(cls => 
        cls.id === freshClassToBook.id 
          ? { ...cls, bookedUserIds: [...cls.bookedUserIds, currentUser.id] }
          : cls
      )
    );

    toast({
      title: "Booking Successful!",
      description: `You've booked ${freshClassToBook.serviceTitle} with ${getTrainerNameById(freshClassToBook.trainerId)}.`,
      variant: "default"
    });
  };

  const groupClassesByDay = (classesToSort: GymClass[]): Record<DayOfWeek, GymClass[]> => {
    const grouped: Record<DayOfWeek, GymClass[]> = {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
    classesToSort.forEach(cls => {
        if (grouped[cls.dayOfWeek]) {
            grouped[cls.dayOfWeek].push(cls);
        }
    });
    for (const day in grouped) {
        grouped[day as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  };

  const groupedClasses = groupClassesByDay(allClasses);

  if (isLoadingData) {
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
                    const spotsRemaining = gymClass.capacity - gymClass.bookedUserIds.length;
                    const isBookedByCurrentUser = currentUser ? gymClass.bookedUserIds.includes(currentUser.id) : false;
                    const isFull = spotsRemaining <= 0;
                    
                    let buttonText = "Book Class";
                    let buttonDisabled = false;

                    if (!isAuthenticated) {
                        buttonText = "Login to Book";
                        // Could also redirect to login or show a modal
                    } else if (isBookedByCurrentUser) {
                        buttonText = "Booked";
                        buttonDisabled = true;
                    } else if (isFull) { // Check if full only if not already booked by user
                        buttonText = "Class Full";
                        buttonDisabled = true;
                    }

                    return (
                      <Card key={gymClass.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <CardHeader>
                          <CardTitle className="font-headline text-xl flex items-center">
                            <Zap className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                            {gymClass.serviceTitle}
                          </CardTitle>
                          <CardDescription className="flex items-center pt-1">
                            <User className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {getTrainerNameById(gymClass.trainerId)}
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
                            <span>Spots Remaining: {spotsRemaining > 0 ? spotsRemaining : 0}</span>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={() => handleBookClass(gymClass)}
                            disabled={buttonDisabled}
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
           {allClasses.length === 0 && !isLoadingData && (
             <p className="text-center text-muted-foreground text-lg">No classes are currently scheduled. Please check back later or contact administration.</p>
           )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
