
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Edit3, Users, BookOpen, LogOut, Clock, Users2, CalendarDays } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { services as serviceDefinitions } from '@/components/sections/ServicesSection';
import type { SeedTrainer } from '@/components/sections/ServicesSection'; // Import SeedTrainer type
import { initialSeedTrainers } from '@/components/sections/ServicesSection'; // Import initial seed trainers
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";


export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface GymClass {
  id: string;
  serviceTitle: string;
  trainerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:00"
  capacity: number;
}

export default function AdminPage() {
  const { currentUser, role, isLoading, signOutAndRedirect, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);

  const [trainerName, setTrainerName] = useState('');
  const [trainerSpecialty, setTrainerSpecialty] = useState('');
  const [trainerImageUrl, setTrainerImageUrl] = useState('');
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [classDayOfWeek, setClassDayOfWeek] = useState<DayOfWeek>('Monday');
  const [classStartTime, setClassStartTime] = useState<string>('');
  const [classEndTime, setClassEndTime] = useState<string>('');
  const [classCapacity, setClassCapacity] = useState<number | string>('');
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'admin')) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, role, router]);


  useEffect(() => {
    if (role === 'admin') {
      const storedTrainers = localStorage.getItem('adminTrainers');
      if (storedTrainers) {
        setTrainers(JSON.parse(storedTrainers));
      } else {
        // Seed trainers from ServicesSection if localStorage is empty
        const trainersToSeed = initialSeedTrainers.map((seed: SeedTrainer) => ({
          id: seed.id,
          name: seed.name,
          specialty: seed.specialty,
          imageUrl: seed.imageUrl,
        }));
        setTrainers(trainersToSeed);
      }

      const storedClasses = localStorage.getItem('adminClasses');
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      }
    }
  }, [role]);

  useEffect(() => {
    if (role === 'admin' && trainers.length > 0) { // Don't save empty initial array if not seeded yet
        localStorage.setItem('adminTrainers', JSON.stringify(trainers));
    }
  }, [trainers, role]);

  useEffect(() => {
    if (role === 'admin' && classes.length > 0) { // Don't save empty initial array
        localStorage.setItem('adminClasses', JSON.stringify(classes));
    }
  }, [classes, role]);

  const handleAddOrUpdateTrainer = () => {
    if (!trainerName || !trainerSpecialty) {
      toast({ title: "Error", description: "Trainer name and specialty are required.", variant: "destructive"});
      return;
    }
    if (editingTrainer) {
      setTrainers(trainers.map(t => t.id === editingTrainer.id ? { ...t, name: trainerName, specialty: trainerSpecialty, imageUrl: trainerImageUrl || 'https://placehold.co/300x300.png' } : t));
      toast({ title: "Success", description: "Trainer updated successfully."});
      setEditingTrainer(null);
    } else {
      const newTrainer: Trainer = {
        id: Date.now().toString(),
        name: trainerName,
        specialty: trainerSpecialty,
        imageUrl: trainerImageUrl || 'https://placehold.co/300x300.png',
      };
      setTrainers([...trainers, newTrainer]);
      toast({ title: "Success", description: "Trainer added successfully."});
    }
    setTrainerName('');
    setTrainerSpecialty('');
    setTrainerImageUrl('');
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setTrainerName(trainer.name);
    setTrainerSpecialty(trainer.specialty);
    setTrainerImageUrl(trainer.imageUrl);
  };

  const handleRemoveTrainer = (id: string) => {
    setTrainers(trainers.filter(trainer => trainer.id !== id));
    // Also remove this trainer from any classes they were assigned to
    setClasses(classes.map(c => c.trainerId === id ? {...c, trainerId: ''} : c)); // Or filter out classes, or set trainer to unassigned
    toast({ title: "Success", description: "Trainer removed.", variant: "destructive"});
  };

  const resetClassForm = () => {
    setSelectedService('');
    setSelectedTrainer('');
    setClassDayOfWeek('Monday');
    setClassStartTime('');
    setClassEndTime('');
    setClassCapacity('');
    setEditingClass(null);
  }

  const handleAddOrUpdateClass = () => {
    if (!selectedService || !selectedTrainer || !classDayOfWeek || !classStartTime || !classEndTime || !classCapacity) {
      toast({ title: "Error", description: "All class fields are required.", variant: "destructive"});
      return;
    }
    if (Number(classCapacity) <= 0) {
        toast({ title: "Error", description: "Capacity must be greater than 0.", variant: "destructive"});
        return;
    }

    const classData: Omit<GymClass, 'id'> = {
        serviceTitle: selectedService,
        trainerId: selectedTrainer,
        dayOfWeek: classDayOfWeek,
        startTime: classStartTime,
        endTime: classEndTime,
        capacity: Number(classCapacity),
    };

    if (editingClass) {
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...classData } : c));
        toast({ title: "Success", description: "Class updated successfully."});
    } else {
        const newClass: GymClass = {
            id: Date.now().toString(),
            ...classData
        };
        setClasses([...classes, newClass]);
        toast({ title: "Success", description: "Class added successfully."});
    }
    resetClassForm();
  };

  const handleEditClass = (gymClass: GymClass) => {
    setEditingClass(gymClass);
    setSelectedService(gymClass.serviceTitle);
    setSelectedTrainer(gymClass.trainerId);
    setClassDayOfWeek(gymClass.dayOfWeek);
    setClassStartTime(gymClass.startTime);
    setClassEndTime(gymClass.endTime);
    setClassCapacity(gymClass.capacity);
  };

  const handleRemoveClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({ title: "Success", description: "Class removed.", variant: "destructive"});
  };

  const getTrainerNameById = (id: string) => {
    const trainer = trainers.find(t => t.id === id);
    return trainer ? trainer.name : 'N/A (Unassigned)';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
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
                <CardDescription>Add, edit, or remove trainers from the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateTrainer(); }} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="trainerName">Trainer Name</Label>
                    <Input id="trainerName" value={trainerName} onChange={e => setTrainerName(e.target.value)} placeholder="e.g., Jane Doe" required />
                  </div>
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
                    <Button variant="outline" onClick={() => { setEditingTrainer(null); setTrainerName(''); setTrainerSpecialty(''); setTrainerImageUrl('');}} className="w-full mt-2">
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainers.map(trainer => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell>{trainer.specialty}</TableCell>
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
                                      This action cannot be undone. This will permanently delete {trainer.name} and remove them from any assigned classes (trainer will be unassigned).
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
                    <Label htmlFor="selectedTrainer">Trainer</Label>
                    <Select value={selectedTrainer} onValueChange={setSelectedTrainer} required disabled={trainers.length === 0}>
                      <SelectTrigger id="selectedTrainer"><SelectValue placeholder={trainers.length === 0 ? "Add a trainer first" : "Select a trainer"} /></SelectTrigger>
                      <SelectContent>
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
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={trainers.length === 0}>
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
                          <TableHead>Capacity</TableHead>
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
                            <TableCell>{gymClass.capacity}</TableCell>
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
                                      This action cannot be undone. This will permanently delete the class: {gymClass.serviceTitle} on {gymClass.dayOfWeek} at {gymClass.startTime}.
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
            Note: Admin data is currently stored in browser localStorage and will persist on this device.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
