
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, CalendarDays, Award, LogOut, XCircle, Clock, User as TrainerIcon } from 'lucide-react'; // Added XCircle
import type { GymClass, Trainer } from '@/app/admin/page'; // Import types
import { useToast } from "@/hooks/use-toast";

interface BookingDetails extends GymClass {
  trainerName: string;
}

export default function MemberDashboardPage() {
  const { currentUser, role, isLoading, signOutAndRedirect, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [myBookings, setMyBookings] = useState<BookingDetails[]>([]);
  const [allClasses, setAllClasses] = useState<GymClass[]>([]); // To manage global class state for cancellations
  const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'member')) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, role, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser && role === 'member') {
      const storedClasses = localStorage.getItem('adminClasses');
      const storedTrainers = localStorage.getItem('adminTrainers');
      
      const currentClasses: GymClass[] = storedClasses ? JSON.parse(storedClasses).map((cls: any) => ({
        ...cls,
        bookedUserIds: cls.bookedUserIds || []
      })) : [];
      const currentTrainers: Trainer[] = storedTrainers ? JSON.parse(storedTrainers) : [];
      
      setAllClasses(currentClasses);
      setAllTrainers(currentTrainers);
      
      const userBookings = currentClasses
        .filter(cls => cls.bookedUserIds.includes(currentUser.id))
        .map(cls => {
          const trainer = currentTrainers.find(t => t.id === cls.trainerId);
          return {
            ...cls,
            trainerName: trainer ? trainer.name : "N/A (Unassigned)",
          };
        })
        .sort((a,b) => { // Sort by day and then start time
             const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
             if(dayOrder.indexOf(a.dayOfWeek) === dayOrder.indexOf(b.dayOfWeek)){
                 return a.startTime.localeCompare(b.startTime);
             }
             return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
        });

      setMyBookings(userBookings);
      setIsDataLoading(false);
    }
  }, [currentUser, role, isAuthenticated]); // Rerun if currentUser changes or data is updated elsewhere

   // Effect to save all classes back to localStorage when they change due to cancellation
  useEffect(() => {
    if (typeof window !== 'undefined' && !isDataLoading && allClasses.length > 0) {
      localStorage.setItem('adminClasses', JSON.stringify(allClasses));
    }
  }, [allClasses, isDataLoading]);

  const handleCancelBooking = (classIdToCancel: string) => {
    if (!currentUser) return;

    setAllClasses(prevAllClasses => {
      const updatedClasses = prevAllClasses.map(cls => {
        if (cls.id === classIdToCancel) {
          return {
            ...cls,
            bookedUserIds: cls.bookedUserIds.filter(userId => userId !== currentUser.id)
          };
        }
        return cls;
      });
      
      // Update myBookings state immediately for UI responsiveness
      setMyBookings(prevMyBookings => prevMyBookings.filter(booking => booking.id !== classIdToCancel));
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      
      return updatedClasses; // This will trigger the useEffect to save to localStorage
    });
  };


  if (isLoading || isDataLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading dashboard...</p></div>;
  }

  if (!currentUser || role !== 'member') {
    return <div className="flex justify-center items-center min-h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-12 bg-background">
        <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8"> {/* Increased max-width */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Member <span className="text-primary">Dashboard</span>
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
              <p className="text-muted-foreground">Welcome to your personal fitness hub!</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6"> {/* Single column for bookings, can be md:grid-cols-2 for other cards */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <CalendarDays className="mr-2 h-6 w-6 text-accent" /> My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings.length === 0 ? (
                  <p className="text-muted-foreground">You have no upcoming bookings. <Button variant="link" asChild className="p-0 h-auto"><a href="/schedule">Book a class now!</a></Button></p>
                ) : (
                  <div className="space-y-4">
                    {myBookings.map(booking => (
                      <Card key={booking.id} className="bg-card/50 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">{booking.serviceTitle}</h4>
                            <p className="text-sm text-muted-foreground flex items-center"><TrainerIcon className="mr-1.5 h-4 w-4" /> {booking.trainerName}</p>
                            <p className="text-sm text-muted-foreground flex items-center"><CalendarDays className="mr-1.5 h-4 w-4" /> {booking.dayOfWeek}</p>
                            <p className="text-sm text-muted-foreground flex items-center"><Clock className="mr-1.5 h-4 w-4" /> {booking.startTime} - {booking.endTime}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership Details Card Removed */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


    
