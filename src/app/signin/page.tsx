"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Role } from '@prisma/client';

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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, { 
    message: "Password is required.",
  }),
});

export default function SignInPage() {
  const { toast } = useToast();
  const { signIn, isLoading } = useAuth(); 
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await signIn(values.email, values.password);
    if (result.success && result.user) {
      toast({
        title: "Signed In!",
        description: `Welcome back, ${result.user.name}!`,
      });
      form.reset();
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        if (result.user.requiresPasswordChange) {
          router.replace('/auth/force-change-password');
        } else {
          // Redirect based on role
          if (result.user.role === 'ADMIN') {
            router.replace('/admin');
          } else if (result.user.role === 'TRAINER') {
            router.replace('/trainer-dashboard');
          } else if (result.user.role === 'MEMBER') {
            router.replace('/member-dashboard');
          }
        }
      }, 100);
    } else {
      toast({
        title: "Sign In Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-16 bg-background flex items-center justify-center">
        <div className="container mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl rounded-lg w-full">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
              <CardDescription>Sign in to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
