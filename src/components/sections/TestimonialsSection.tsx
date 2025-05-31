"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    quote: "GymGenesis transformed my fitness journey! The trainers are amazing and the atmosphere is so motivating. I've never felt stronger or healthier.",
    name: "Sarah L.",
    location: "New York, NY",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "happy woman",
    rating: 5,
  },
  {
    quote: "The variety of classes and top-notch equipment make every workout enjoyable. I highly recommend GymGenesis to anyone serious about their fitness.",
    name: "Michael B.",
    location: "Austin, TX",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "fit man",
    rating: 5,
  },
  {
    quote: "I was hesitant to join a gym, but the community at GymGenesis is so welcoming. I've made great progress and new friends!",
    name: "Emily K.",
    location: "Chicago, IL",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "smiling person",
    rating: 4,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success <span className="text-primary">Stories</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Hear what our members have to say about their GymGenesis experience.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Testimonial Card */}
          <Card className="flex flex-col shadow-lg">
            <CardContent className="flex flex-col flex-grow p-6">
              <Quote className="h-8 w-8 text-primary mb-4" />
              <p className="text-muted-foreground flex-grow italic">&quot;{testimonials[currentIndex].quote}&quot;</p>
              <div className="mt-6 flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonials[currentIndex].avatarUrl}
                    alt={testimonials[currentIndex].name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={testimonials[currentIndex].dataAiHint}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
                </div>
              </div>
              <div className="mt-4 flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-muted-foreground'}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              >
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
