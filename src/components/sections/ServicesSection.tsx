
"use client"; // Make it a client component to use hooks for data fetching

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Zap, Users, ShieldCheck, Activity, Heart, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getTrainers, type TrainerWithUserDetails } from "@/app/actions/trainerActions"; // Import server action

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Static service definitions
export const services: Service[] = [
  {
    icon: Dumbbell,
    title: "Weight Training",
    description: "Build strength with our wide range of free weights and resistance machines.",
  },
  {
    icon: Zap,
    title: "Cardio Zone",
    description: "Boost your endurance with top-tier treadmills, ellipticals, and bikes.",
  },
  {
    icon: Users,
    title: "Group Fitness Classes",
    description: "Join high-energy classes like Zumba, Yoga, HIIT, and Spinning.",
  },
  {
    icon: ShieldCheck,
    title: "Personal Training",
    description: "Achieve your goals faster with tailored plans from certified trainers.",
  },
  {
    icon: Activity,
    title: "Functional Fitness",
    description: "Improve real-life strength and mobility in our dedicated functional area.",
  },
  {
    icon: Heart,
    title: "Wellness & Recovery",
    description: "Relax and rejuvenate with our sauna and dedicated stretching zones.",
  },
];

// This section now fetches trainers from the database.
// The initialSeedTrainers is no longer used for seeding by admin page.
// It can be removed or kept for reference/testing if needed, but won't be exported.
const placeholderTrainers: TrainerWithUserDetails[] = [ // For UI skeleton or if DB fetch fails
  {
    id: 'placeholder-1',
    name: "Loading Trainer...",
    specialty: "Fetching details...",
    imageUrl: "https://placehold.co/300x300.png",
    userId: '', // Required by TrainerWithUserDetails
    user: { email: '' }
  },
];


export default function ServicesSection() {
  const [trainers, setTrainers] = useState<TrainerWithUserDetails[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);

  useEffect(() => {
    async function fetchTrainers() {
      setIsLoadingTrainers(true);
      try {
        const fetchedTrainers = await getTrainers();
        setTrainers(fetchedTrainers.length > 0 ? fetchedTrainers : []); // Use empty array if no trainers
      } catch (error) {
        console.error("Failed to fetch trainers for services section:", error);
        setTrainers([]); // Fallback to empty on error
      } finally {
        setIsLoadingTrainers(false);
      }
    }
    fetchTrainers();
  }, []);

  const displayTrainers = isLoadingTrainers ? placeholderTrainers.slice(0,3) : (trainers.length > 0 ? trainers : []);


  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Premier <span className="text-primary">Services & Classes</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover a variety of ways to achieve your fitness goals at GymGenesis. Class types are listed below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <service.icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meet Our Expert <span className="text-primary">Trainers</span>
          </h3>
          <p className="mt-3 max-w-xl mx-auto text-lg text-muted-foreground">
            Our certified trainers are here to guide and motivate you. (Trainers are managed in the Admin section)
          </p>
        </div>

        {isLoadingTrainers && (
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="text-center overflow-hidden shadow-lg">
                <div className="relative h-64 w-full bg-muted animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 mx-auto bg-muted animate-pulse mb-2 rounded"></div>
                  <div className="h-4 w-1/2 mx-auto bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingTrainers && displayTrainers.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">No trainers available at the moment. Please check back later.</p>
        )}

        {!isLoadingTrainers && displayTrainers.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {displayTrainers.map((trainer) => (
                <Card key={trainer.id} className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 w-full">
                    <Image
                    src={trainer.imageUrl || "https://placehold.co/300x300.png"}
                    alt={trainer.name}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint="fitness trainer portrait" // Example hint, can be dynamic
                    />
                </div>
                <CardContent className="p-6">
                    <h4 className="font-headline text-lg font-semibold text-foreground">{trainer.name}</h4>
                    <p className="text-sm text-primary">{trainer.specialty}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>
    </section>
  );
}
