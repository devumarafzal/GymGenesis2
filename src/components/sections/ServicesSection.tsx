import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Zap, Users, ShieldCheck, Activity, Heart } from "lucide-react";

const services = [
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

const trainers = [
  {
    name: "Alex Morgan",
    specialty: "Strength & Conditioning",
    imageUrl: "https://placehold.co/300x300.png",
    dataAiHint: "fitness trainer portrait"
  },
  {
    name: "Jessie Chen",
    specialty: "Yoga & Flexibility",
    imageUrl: "https://placehold.co/300x300.png",
    dataAiHint: "yoga instructor"
  },
  {
    name: "Mike Davis",
    specialty: "HIIT & Endurance",
    imageUrl: "https://placehold.co/300x300.png",
    dataAiHint: "male fitness coach"
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Premier <span className="text-primary">Services</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover a variety of ways to achieve your fitness goals at GymGenesis.
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
            Our certified trainers are here to guide and motivate you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <Card key={trainer.name} className="text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src={trainer.imageUrl}
                  alt={trainer.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={trainer.dataAiHint}
                />
              </div>
              <CardContent className="p-6">
                <h4 className="font-headline text-lg font-semibold text-foreground">{trainer.name}</h4>
                <p className="text-sm text-primary">{trainer.specialty}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
