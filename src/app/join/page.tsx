
"use client";

import type { Metadata } from 'next';
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

// It's generally better to export metadata from server components or layout files.
// For a client component page like this, metadata might be better handled in a layout segment if more complex.
// However, Next.js allows exporting metadata from page.tsx even if it's "use client" for simplicity in some cases.
// If issues arise, consider a route group layout for metadata.
export const metadata: Metadata = {
  title: 'Join GymGenesis | Membership Inquiry',
  description: 'Start your fitness transformation with GymGenesis. Fill out our membership inquiry form today!',
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }).max(500, {
    message: "Message cannot exceed 500 characters."
  }),
});

export default function JoinPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(values);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you soon.",
      variant: "default",
    });
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-background">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" asChild>
                <Link href="/" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
            <div className="space-y-4">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Join <span className="text-primary">GymGenesis</span> Today!
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready to start your transformation? Fill out the form, and one of our fitness consultants will get in touch with you shortly.
              </p>
              <p className="text-lg text-muted-foreground">
                Let&apos;s build a healthier you, together! We&apos;re excited to welcome you to our vibrant fitness community.
              </p>
            </div>
            <Card className="shadow-xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Membership Inquiry</CardTitle>
                <CardDescription>Send us your details and we&apos;ll respond shortly.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message / Fitness Goals</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your fitness goals or any questions you have..."
                              className="resize-none"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Sending..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
