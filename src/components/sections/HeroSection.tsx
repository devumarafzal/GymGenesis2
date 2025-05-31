
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section id="home" className="relative bg-secondary py-20 md:py-32">
      <div className="absolute inset-0">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Fitness enthusiasts working out in a modern gym"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="gym fitness"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      <div className="container relative mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Unlock Your <span className="text-primary">Potential</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          GymGenesis offers state-of-the-art equipment, expert-led classes, and personalized training programs to help you crush your fitness goals. Join our vibrant community today!
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
            <Link href="/signup">Sign Up Today</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-lg transition-transform hover:scale-105">
            <Link href="/#services">Explore Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
