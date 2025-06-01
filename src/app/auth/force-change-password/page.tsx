"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

export default function ForceChangePasswordPage() {
  const { toast } = useToast();
  const { currentUser, isAuthenticated, isLoading: authIsLoading, completePasswordSetup, signIn, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated) {
        router.replace('/signin');
      } else if (currentUser && !currentUser.requiresPasswordChange) {
        // User is authenticated but doesn't need to change password, send to their dashboard
        if (role === 'ADMIN') router.replace('/admin');
        else if (role === 'TRAINER') router.replace('/trainer-dashboard');
        else router.replace('/member-dashboard');
      }
      // If authenticated and requiresPasswordChange is true, stay on this page.
    }
  }, [authIsLoading, isAuthenticated, currentUser, role, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
      router.replace('/signin');
      return;
    }

    const result = await completePasswordSetup(values.newPassword);
    if (result.success && result.updatedUser) {
      toast({
        title: "Password Set!",
        description: "Your password has been successfully updated. Please wait while we log you in...",
      });
      form.reset();

      // Re-authenticate with the new password
      const signInResult = await signIn(result.updatedUser.email, values.newPassword);
      if (signInResult.success && signInResult.user) {
        toast({
          title: "Success!",
          description: "You have been successfully logged in with your new password.",
        });

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          // Redirect based on role after successful re-authentication
          if (signInResult.user.role === 'ADMIN') {
            router.replace('/admin');
          } else if (signInResult.user.role === 'TRAINER') {
            router.replace('/trainer-dashboard');
          } else {
            router.replace('/member-dashboard');
          }
        }, 500); // Increased delay to 500ms to ensure state updates
      } else {
        toast({
          title: "Re-authentication Failed",
          description: "Please sign in again with your new password.",
          variant: "destructive",
        });
        router.replace('/signin');
      }
    } else {
      toast({
        title: "Password Setup Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  if (authIsLoading || !currentUser) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <p>Loading...</p>
            </main>
            <Footer />
        </div>
    );
  }
  
  if (!currentUser.requiresPasswordChange && isAuthenticated) {
     // This case should be handled by useEffect redirect, but as a fallback:
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <p>Redirecting to your dashboard...</p>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 md:py-16 bg-background flex items-center justify-center">
        <div className="container mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl rounded-lg w-full">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Set Your New Password</CardTitle>
              <CardDescription>Please create a new password to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Setting Password..." : "Set New Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
