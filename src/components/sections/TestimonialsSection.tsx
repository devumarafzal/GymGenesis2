import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="flex flex-col flex-grow p-6">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground flex-grow italic">&quot;{testimonial.quote}&quot;</p>
                <div className="mt-6 flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                     <Image 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={testimonial.dataAiHint} 
                      />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <div className="mt-4 flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
