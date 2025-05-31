import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import LeadCaptureSection from "@/components/sections/LeadCaptureSection";
import ContactSection from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <TestimonialsSection />
        <LeadCaptureSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
