
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
import { PlusCircle, Trash2, Edit3, Users, BookOpen, LogOut } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { services as serviceDefinitions, initialSeedTrainers } from '@/components/sections/ServicesSection';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

// Define types for Admin data
export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export interface GymClass {
  id: string;
  serviceTitle: string; 
  trainerId: string;
  schedule: string;
}

export default function AdminPage() {
  const { currentUser, role, isLoading, signOutAndRedirect, isAuthenticated } = useAuth(); // Use useAuth
  const router = useRouter();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);

  const [trainerName, setTrainerName] = useState('');
  const [trainerSpecialty, setTrainerSpecialty] = useState('');
  const [trainerImageUrl, setTrainerImageUrl] = useState('');
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [classSchedule, setClassSchedule] = useState('');
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== 'admin')) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, role, router]);


  useEffect(() => {
    if (role === 'admin') { // Only load data if admin
      const storedTrainers = localStorage.getItem('adminTrainers');
      if (storedTrainers) {
        setTrainers(JSON.parse(storedTrainers));
      } else {
        const trainersToSeed = initialSeedTrainers.map(seed => ({
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
  }, [role]); // Depend on role

  useEffect(() => {
    if (role === 'admin') {
        localStorage.setItem('adminTrainers', JSON.stringify(trainers));
    }
  }, [trainers, role]);

  useEffect(() => {
    if (role === 'admin') {
        localStorage.setItem('adminClasses', JSON.stringify(classes));
    }
  }, [classes, role]);

  const handleAddOrUpdateTrainer = () => {
    if (!trainerName || !trainerSpecialty) return;
    if (editingTrainer) {
      setTrainers(trainers.map(t => t.id === editingTrainer.id ? { ...t, name: trainerName, specialty: trainerSpecialty, imageUrl: trainerImageUrl || 'https://placehold.co/300x300.png' } : t));
      setEditingTrainer(null);
    } else {
      const newTrainer: Trainer = {
        id: Date.now().toString(),
        name: trainerName,
        specialty: trainerSpecialty,
        imageUrl: trainerImageUrl || 'https://placehold.co/300x300.png',
      };
      setTrainers([...trainers, newTrainer]);
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
    setClasses(classes.filter(c => c.trainerId !== id));
  };

  const handleAddOrUpdateClass = () => {
    if (!selectedService || !selectedTrainer || !classSchedule) return;
     if (editingClass) {
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, serviceTitle: selectedService, trainerId: selectedTrainer, schedule: classSchedule } : c));
        setEditingClass(null);
    } else {
        const newClass: GymClass = {
            id: Date.now().toString(),
            serviceTitle: selectedService,
            trainerId: selectedTrainer,
            schedule: classSchedule,
        };
        setClasses([...classes, newClass]);
    }
    setSelectedService('');
    setSelectedTrainer('');
    setClassSchedule('');
  };

  const handleEditClass = (gymClass: GymClass) => {
    setEditingClass(gymClass);
    setSelectedService(gymClass.serviceTitle);
    setSelectedTrainer(gymClass.trainerId);
    setClassSchedule(gymClass.schedule);
  };

  const handleRemoveClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const getTrainerNameById = (id: string) => {
    const trainer = trainers.find(t => t.id === id);
    return trainer ? trainer.name : 'Unknown Trainer';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  if (!currentUser || role !== 'admin') {
     // Should be redirected by useEffect, but as a fallback:
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
          <p className="mb-2">Welcome, {currentUser.name} ({currentUser.email})</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                      This action cannot be undone. This will permanently delete {trainer.name} and remove them from any assigned classes.
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

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center"><BookOpen className="mr-2 h-6 w-6 text-primary" />Manage Classes</CardTitle>
                <CardDescription>Define classes by assigning trainers and schedules to services.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdateClass();}} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="selectedService">Service</Label>
                    <Select value={selectedService} onValueChange={setSelectedService} required>
                      <SelectTrigger id="selectedService">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
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
                      <SelectTrigger id="selectedTrainer">
                        <SelectValue placeholder={trainers.length === 0 ? "Add a trainer first" : "Select a trainer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map(trainer => (
                          <SelectItem key={trainer.id} value={trainer.id}>{trainer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classSchedule">Schedule</Label>
                    <Input id="classSchedule" value={classSchedule} onChange={e => setClassSchedule(e.target.value)} placeholder="e.g., Mon, Wed, Fri 9:00 AM - 10:00 AM" required />
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={trainers.length === 0}>
                     <PlusCircle className="mr-2 h-5 w-5" /> {editingClass ? 'Update Class' : 'Add Class'}
                  </Button>
                  {editingClass && (
                     <Button variant="outline" onClick={() => { setEditingClass(null); setSelectedService(''); setSelectedTrainer(''); setClassSchedule('');}} className="w-full mt-2">
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
                          <TableHead>Class (Service)</TableHead>
                          <TableHead>Trainer</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map(gymClass => (
                          <TableRow key={gymClass.id}>
                            <TableCell className="font-medium">{gymClass.serviceTitle}</TableCell>
                            <TableCell>{getTrainerNameById(gymClass.trainerId)}</TableCell>
                            <TableCell>{gymClass.schedule}</TableCell>
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
                                      This action cannot be undone. This will permanently delete the class: {gymClass.serviceTitle} with {getTrainerNameById(gymClass.trainerId)}.
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
            Note: Admin data is currently stored in browser localStorage and will persist on this device. User accounts are also managed in localStorage for this demo.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
