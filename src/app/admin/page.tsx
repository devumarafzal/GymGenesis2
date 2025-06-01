
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Edit3, Users, CalendarDays, LogOut } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { services as serviceDefinitions } from '@/components/sections/ServicesSection'; // Static service types
import type { DayOfWeek as PrismaDayOfWeek } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

import { addTrainer, getTrainers, updateTrainer, deleteTrainer, type TrainerWithUserDetails } from '@/app/actions/trainerActions';
import { addClass, getClasses, updateClass, deleteClass, type GymClassWithDetails } from '@/app/actions/classActions';

// Re-defining local types to match what server actions will return or what UI expects
export interface UITrainer extends TrainerWithUserDetails {}
export interface UIGymClass extends GymClassWithDetails {}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export default function AdminPage() {
  const { currentUser, role, isLoading: authIsLoading, signOutAndRedirect, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [trainers, setTrainers] = useState<UITrainer[]>([]);
  const [classes, setClasses] = useState<UIGymClass[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState(''); // New field for trainer user account
  const [trainerSpecialty, setTrainerSpecialty] = useState('');
  const [trainerImageUrl, setTrainerImageUrl] = useState('');
  const [editingTrainer, setEditingTrainer] = useState<UITrainer | null>(null);

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [classDayOfWeek, setClassDayOfWeek] = useState<DayOfWeek>('Monday');
  const [classStartTime, setClassStartTime] = useState<string>('');
  const [classEndTime, setClassEndTime] = useState<string>('');
  const [classCapacity, setClassCapacity] = useState<number | string>('');
  const [editingClass, setEditingClass] = useState<UIGymClass | null>(null);

  const fetchAdminData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [trainersData, classesData] = await Promise.all([
        getTrainers(),
        getClasses(),
      ]);
      setTrainers(trainersData);
      setClasses(classesData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load admin data.", variant: "destructive" });
      console.error("Failed to load admin data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authIsLoading && (!isAuthenticated || role !== 'admin')) {
      router.push('/signin');
    } else if (role === 'admin') {
      fetchAdminData();
    }
  }, [authIsLoading, isAuthenticated, role, router, fetchAdminData]);

  const resetTrainerForm = () => {
    setTrainerName('');
    setTrainerEmail('');
    setTrainerSpecialty('');
    setTrainerImageUrl('');
    setEditingTrainer(null);
  };

  const handleAddOrUpdateTrainer = async () => {
    if (!trainerName || !trainerSpecialty || (!editingTrainer && !trainerEmail)) {
      toast({ title: "Error", description: "Trainer name, email (for new), and specialty are required.", variant: "destructive" });
      return;
    }
    
    setIsDataLoading(true); // For visual feedback
    if (editingTrainer) {
      const result = await updateTrainer(editingTrainer.id, { name: trainerName, specialty: trainerSpecialty, imageUrl: trainerImageUrl });
      if (result.success && result.trainer) {
        setTrainers(trainers.map(t => t.id === result.trainer!.id ? result.trainer! : t));
        toast({ title: "Success", description: "Trainer updated successfully." });
        resetTrainerForm();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } else {
      const result = await addTrainer({ name: trainerName, email: trainerEmail, specialty: trainerSpecialty, imageUrl: trainerImageUrl });
      if (result.success && result.trainer) {
        setTrainers([...trainers, result.trainer]);
        toast({ title: "Success", description: "Trainer added successfully. Default password is 'changeme'." });
        resetTrainerForm();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    }
    setIsDataLoading(false);
  };

  const handleEditTrainer = (trainer: UITrainer) => {
    setEditingTrainer(trainer);
    setTrainerName(trainer.name);
    setTrainerEmail(trainer.user?.email || ''); // Email is part of User, might not be editable here directly once set
    setTrainerSpecialty(trainer.specialty);
    setTrainerImageUrl(trainer.imageUrl);
  };

  const handleRemoveTrainer = async (id: string) => {
    setIsDataLoading(true);
    // Unassign trainer from classes on the client-side for immediate UI update before DB call,
    // though DB schema with SetNull should handle this.
    // This client-side change is mostly for smoother UX.
    setClasses(prevClasses => prevClasses.map(c => c.trainerId === id ? { ...c, trainerId: null, trainer: null } : c));

    const result = await deleteTrainer(id);
    if (result.success) {
      setTrainers(trainers.filter(trainer => trainer.id !== id));
      toast({ title: "Success", description: "Trainer removed and unassigned from classes.", variant: "destructive" });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
      // If deletion failed, refresh data to reflect actual DB state
      fetchAdminData();
    }
    setIsDataLoading(false);
  };

  const resetClassForm = () => {
    setSelectedService('');
    setSelectedTrainerId('');
    setClassDayOfWeek('Monday');
    setClassStartTime('');
    setClassEndTime('');
    setClassCapacity('');
    setEditingClass(null);
  };

  const handleAddOrUpdateClass = async () => {
    if (!selectedService || !classDayOfWeek || !classStartTime || !classEndTime || !classCapacity) {
      toast({ title: "Error", description: "Service, day, times, and capacity are required.", variant: "destructive" });
      return;
    }
    if (Number(classCapacity) <= 0) {
      toast({ title: "Error", description: "Capacity must be greater than 0.", variant: "destructive" });
      return;
    }
    if (classStartTime >= classEndTime) {
      toast({ title: "Error", description: "End time must be after start time.", variant: "destructive" });
      return;
    }

    const classData = {
      serviceTitle: selectedService,
      trainerId: selectedTrainerId || null, // Allow null trainerId
      dayOfWeek: classDayOfWeek as PrismaDayOfWeek,
      startTime: classStartTime,
      endTime: classEndTime,
      capacity: Number(classCapacity),
    };

    setIsDataLoading(true);
    if (editingClass) {
      const result = await updateClass(editingClass.id, classData);
      if (result.success && result.class) {
        setClasses(classes.map(c => c.id === result.class!.id ? result.class! : c));
        toast({ title: "Success", description: "Class updated successfully." });
        resetClassForm();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } else {
      const result = await addClass(classData);
      if (result.success && result.class) {
        setClasses([...classes, result.class]);
        toast({ title: "Success", description: "Class added successfully." });
        resetClassForm();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    }
    setIsDataLoading(false);
  };

  const handleEditClass = (gymClass: UIGymClass) => {
    setEditingClass(gymClass);
    setSelectedService(gymClass.serviceTitle);
    setSelectedTrainerId(gymClass.trainerId || '');
    setClassDayOfWeek(gymClass.dayOfWeek as DayOfWeek);
    setClassStartTime(gymClass.startTime);
    setClassEndTime(gymClass.endTime);
    setClassCapacity(gymClass.capacity);
  };

  const handleRemoveClass = async (id: string) => {
    setIsDataLoading(true);
    const result = await deleteClass(id);
    if (result.success) {
      setClasses(classes.filter(c => c.id !== id));
      toast({ title: "Success", description: "Class removed.", variant: "destructive" });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsDataLoading(false);
  };

  const getTrainerNameById = (id: string | null | undefined) => {
    if (!id) return 'N/A (Unassigned)';
    const trainer = trainers.find(t => t.id === id);
    return trainer ? trainer.name : 'N/A (Unassigned)';
  };

  if (authIsLoading || isDataLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading admin dashboard...</p></div>;
  }

  if (!currentUser || role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen"><p>Access Denied. Redirecting...</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-12 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <Button variant="outline" onClick={() => signOutAndRedirect('/signin')}>
              <LogOut className="mr-2 h-5 w-5" /> Sign Out
            </Button>
          </div>
          <p className="mb-6">Welcome, {currentUser.name} ({currentUser.email})</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Manage Trainers Card */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Manage Trainers</CardTitle>
                <CardDescription>Add, edit, or remove trainers. Adding a trainer creates a user account with role TRAINER.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateTrainer(); }} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="trainerName">Trainer Name</Label>
                    <Input id="trainerName" value={trainerName} onChange={e => setTrainerName(e.target.value)} placeholder="e.g., Jane Doe" required />
                  </div>
                  {!editingTrainer && ( // Only show email for new trainers
                    <div>
                      <Label htmlFor="trainerEmail">Trainer Email (for login)</Label>
                      <Input id="trainerEmail" type="email" value={trainerEmail} onChange={e => setTrainerEmail(e.target.value)} placeholder="trainer@example.com" required={!editingTrainer} />
                    </div>
                  )}
                   {editingTrainer && trainerEmail && (
                    <div>
                        <Label htmlFor="trainerEmailDisplay">Trainer Email (login)</Label>
                        <Input id="trainerEmailDisplay" type="email" value={trainerEmail} disabled readOnly />
                         <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here. Manage users separately.</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="trainerSpecialty">Specialty</Label>
                    <Input id="trainerSpecialty" value={trainerSpecialty} onChange={e => setTrainerSpecialty(e.target.value)} placeholder="e.g., Yoga & Pilates" required />
                  </div>
                  <div>
                    <Label htmlFor="trainerImageUrl">Image URL (Optional)</Label>
                    <Input id="trainerImageUrl" value={trainerImageUrl} onChange={e => setTrainerImageUrl(e.target.value)} placeholder="https://placehold.co/300x300.png" />
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <PlusCircle className="mr-2 h-5 w-5" /> {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
                  </Button>
                  {editingTrainer && (
                    <Button variant="outline" onClick={resetTrainerForm} className="w-full mt-2">
                      Cancel Edit
                    </Button>
                  )}
                </form>

                <h3 className="font-headline text-lg font-semibold mb-2">Existing Trainers</h3>
                {trainers.length === 0 ? <p className="text-muted-foreground">No trainers added yet.</p> : (
                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Email (Login)</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainers.map(trainer => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell>{trainer.specialty}</TableCell>
                            <TableCell>{trainer.user?.email || 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditTrainer(trainer)} className="hover:text-primary">
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete {trainer.name}'s trainer profile and unassign them from classes. Their user login account will remain.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveTrainer(trainer.id)} className="bg-destructive hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manage Classes Card */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" />Manage Classes</CardTitle>
                <CardDescription>Define class schedules, assign trainers, and set capacity.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateClass();}} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="selectedService">Service (Class Type)</Label>
                    <Select value={selectedService} onValueChange={setSelectedService} required>
                      <SelectTrigger id="selectedService"><SelectValue placeholder="Select a service" /></SelectTrigger>
                      <SelectContent>
                        {serviceDefinitions.map(service => (
                          <SelectItem key={service.title} value={service.title}>{service.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="selectedTrainerId">Trainer (Optional)</Label>
                    <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
                      <SelectTrigger id="selectedTrainerId"><SelectValue placeholder={trainers.length === 0 ? "No trainers available" : "Select a trainer (or leave unassigned)"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem> {/* Option for unassigned */}
                        {trainers.map(trainer => (
                          <SelectItem key={trainer.id} value={trainer.id}>{trainer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="classDayOfWeek">Day of Week</Label>
                        <Select value={classDayOfWeek} onValueChange={(value) => setClassDayOfWeek(value as DayOfWeek)} required>
                            <SelectTrigger id="classDayOfWeek"><SelectValue placeholder="Select day" /></SelectTrigger>
                            <SelectContent>
                                {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="classCapacity">Capacity</Label>
                        <Input id="classCapacity" type="number" value={classCapacity} onChange={e => setClassCapacity(e.target.value ? parseInt(e.target.value) : '')} placeholder="e.g., 15" required min="1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="classStartTime">Start Time</Label>
                        <Input id="classStartTime" type="time" value={classStartTime} onChange={e => setClassStartTime(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="classEndTime">End Time</Label>
                        <Input id="classEndTime" type="time" value={classEndTime} onChange={e => setClassEndTime(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                     <PlusCircle className="mr-2 h-5 w-5" /> {editingClass ? 'Update Class' : 'Add Class'}
                  </Button>
                  {editingClass && (
                     <Button variant="outline" onClick={resetClassForm} className="w-full mt-2">
                        Cancel Edit
                     </Button>
                  )}
                </form>

                <h3 className="font-headline text-lg font-semibold mb-2">Scheduled Classes</h3>
                 {classes.length === 0 ? <p className="text-muted-foreground">No classes scheduled yet.</p> : (
                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Trainer</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Booked/Capacity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map(gymClass => (
                          <TableRow key={gymClass.id}>
                            <TableCell className="font-medium">{gymClass.serviceTitle}</TableCell>
                            <TableCell>{getTrainerNameById(gymClass.trainerId)}</TableCell>
                            <TableCell>{gymClass.dayOfWeek}</TableCell>
                            <TableCell>{gymClass.startTime} - {gymClass.endTime}</TableCell>
                            <TableCell>{gymClass._count?.bookings ?? 0} / {gymClass.capacity}</TableCell>
                            <TableCell className="text-right space-x-2">
                               <Button variant="outline" size="icon" onClick={() => handleEditClass(gymClass)} className="hover:text-primary">
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                     <span className="sr-only">Remove</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the class: {gymClass.serviceTitle} on {gymClass.dayOfWeek} at {gymClass.startTime}. All existing bookings for this class will also be removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveClass(gymClass.id)} className="bg-destructive hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                 )}
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-12">
            Admin data is now managed via the database.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
