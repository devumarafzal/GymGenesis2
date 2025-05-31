
"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, Zap, User, Users2 } from 'lucide-react'; // Added Users2 here
import { useToast } from "@/hooks/use-toast";
import type { GymClass, Trainer, DayOfWeek } from '@/app/admin/page'; // Import types from admin page

const daysOrder: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch classes and trainers from localStorage
    const storedClasses = localStorage.getItem('adminClasses');
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    }
    const storedTrainers = localStorage.getItem('adminTrainers');
    if (storedTrainers) {
      setTrainers(JSON.parse(storedTrainers));
    }
    setIsLoading(false);
  }, []);

  const getTrainerNameById = (trainerId: string): string => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.name : "N/A";
  };

  const handleBookClass = (gymClass: GymClass) => {
    toast({
      title: "Booking Submitted (Demo)",
      description: `You've requested to book ${gymClass.serviceTitle} with ${getTrainerNameById(gymClass.trainerId)}. Full booking feature coming soon!`,
      variant: "default"
    });
    // In a real app, you would handle booking logic here:
    // - Check capacity
    // - Store booking for the current user
    // - Update available spots
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
    // Sort classes within each day by start time
    for (const day in grouped) {
        grouped[day as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  };

  const groupedClasses = groupClassesByDay(classes);

  if (isLoading) {
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
                {groupedClasses[day].length === 0 ? (
                  <p className="text-muted-foreground">No classes scheduled for {day}.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedClasses[day].map(gymClass => (
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
                           {/* Placeholder for spots remaining - can be implemented with booking system */}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users2 className="mr-2 h-4 w-4 flex-shrink-0" />
                             <span>Spots Remaining: {gymClass.capacity} (Demo)</span>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={() => handleBookClass(gymClass)}
                          >
                            Book Class
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
           {classes.length === 0 && !isLoading && (
             <p className="text-center text-muted-foreground text-lg">No classes are currently scheduled. Please check back later or contact administration.</p>
           )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
