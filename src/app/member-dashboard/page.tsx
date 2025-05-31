
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, CalendarDays, LogOut, XCircle, Clock, User as TrainerIcon, Edit } from 'lucide-react';
import type { GymClass, Trainer } from '@/app/admin/page';
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BookingDetails extends GymClass {
  trainerName: string;
}

const nameFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});


export default function MemberDashboardPage() {
  const { currentUser, role, isLoading, signOutAndRedirect, isAuthenticated, updateName, changePassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [myBookings, setMyBookings] = useState<BookingDetails[]>([]);
  const [allClasses, setAllClasses] = useState<GymClass[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: currentUser?.name || "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  useEffect(() => {
    if (currentUser) {
      nameForm.reset({ name: currentUser.name });
    }
  }, [currentUser, nameForm]);


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
      // const currentTrainers: Trainer[] = storedTrainers ? JSON.parse(storedTrainers) : [];
      
      setAllClasses(currentClasses);
      // setAllTrainers(currentTrainers); // trainers not directly used for booking details display logic for now
      
      const userBookings = currentClasses
        .filter(cls => cls.bookedUserIds.includes(currentUser.id))
        .map(cls => {
          // For simplicity, not fetching full trainer details again here if not strictly necessary
          // Trainer details could be passed or fetched if needed.
          const trainerName = localStorage.getItem('adminTrainers') ? 
                              (JSON.parse(localStorage.getItem('adminTrainers')!) as Trainer[]).find(t => t.id === cls.trainerId)?.name || "N/A"
                              : "N/A";
          return {
            ...cls,
            trainerName: trainerName,
          };
        })
        .sort((a,b) => {
             const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
             if(dayOrder.indexOf(a.dayOfWeek) === dayOrder.indexOf(b.dayOfWeek)){
                 return a.startTime.localeCompare(b.startTime);
             }
             return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
        });

      setMyBookings(userBookings);
      setIsDataLoading(false);
    }
  }, [currentUser, role, isAuthenticated]);

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
      
      setMyBookings(prevMyBookings => prevMyBookings.filter(booking => booking.id !== classIdToCancel));
      
      setTimeout(() => {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
      }, 0);
      
      return updatedClasses; 
    });
  };

  const onNameSubmit = async (values: z.infer<typeof nameFormSchema>) => {
    const result = await updateName(values.name);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    const result = await changePassword(values.currentPassword, values.newPassword);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      passwordForm.reset();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
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
        <div className="container mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             {/* Profile Settings Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Edit className="mr-2 h-6 w-6 text-accent" /> Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Edit Name Form */}
                <Form {...nameForm}>
                  <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
                    <FormField
                      control={nameForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={nameForm.formState.isSubmitting}>
                      {nameForm.formState.isSubmitting ? "Saving..." : "Save Name"}
                    </Button>
                  </form>
                </Form>

                {/* Change Password Form */}
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmNewPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                       {passwordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* My Bookings Card */}
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
                  <div className="space-y-4 max-h-96 overflow-y-auto">
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
