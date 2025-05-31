
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const contactDetails = [
  {
    icon: MapPin,
    title: "Our Address",
    content: "123 Fitness Avenue, Energize City, EC 54321",
    link: "https://maps.google.com/?q=123+Fitness+Avenue,+Energize+City,+EC+54321",
    linkText: "Get Directions"
  },
  {
    icon: Phone,
    title: "Call Us",
    content: "(555) 123-4567",
    link: "tel:5551234567",
    linkText: "Call Now"
  },
  {
    icon: Mail,
    title: "Email Us",
    content: "info@gymgenesis.com",
    link: "mailto:info@gymgenesis.com",
    linkText: "Send Email"
  },
];

const openingHours = [
  { day: "Monday - Friday", hours: "6:00 AM - 10:00 PM" },
  { day: "Saturday", hours: "8:00 AM - 8:00 PM" },
  { day: "Sunday", hours: "8:00 AM - 6:00 PM" },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 md:py-24 bg-secondary">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Button variant="outline" asChild>
                <Link href="/" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
            </Button>
          </div>
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Visit or <span className="text-primary">Contact Us</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              We&apos;re here to help you get started. Reach out or drop by!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {contactDetails.map((detail) => (
              <Card key={detail.title} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <detail.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-xl font-semibold">{detail.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{detail.content}</p>
                  {detail.link && detail.linkText && (
                     <a href={detail.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-accent hover:underline">
                       {detail.linkText}
                     </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-primary" /> Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {openingHours.map((item) => (
                    <li key={item.day} className="flex justify-between text-muted-foreground">
                      <span>{item.day}</span>
                      <span className="font-medium text-foreground">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg overflow-hidden h-full min-h-[300px] md:min-h-full">
              <div className="relative w-full h-full">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Map showing gym location" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="map location"
              />
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
