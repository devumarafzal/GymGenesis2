
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LeadCaptureSection() {
  return (
    <section id="join-cta" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
          <div className="md:order-2 space-y-4 text-center md:text-left">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Take the Next Step <span className="text-primary">Today!</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Your fitness journey is unique, and we&apos;re here to support you every step of the way. Explore our membership options and find the perfect fit for your goals.
            </p>
            <p className="text-lg text-muted-foreground">
              Click below to learn more and send us an inquiry. We&apos;ll get back to you promptly to discuss how GymGenesis can be your partner in health.
            </p>
            <Button asChild size="lg" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
              <Link href="/join">Start Your Journey</Link>
            </Button>
          </div>
          <div className="md:order-1 relative h-80 w-full md:h-[400px] rounded-lg overflow-hidden shadow-xl">
             <Image
              src="https://placehold.co/600x400.png"
              alt="Group of diverse people in a fitness class"
              layout="fill"
              objectFit="cover"
              data-ai-hint="fitness class diverse"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
