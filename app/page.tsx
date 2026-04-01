import HeroSection from "@/components/HeroSection";
import WhoAreWeSection from "@/components/WhoAreWeSection";
import WhyUsSection from "@/components/WhyUsSection";
import HelpSection from "@/components/HelpSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main
      className="min-h-screen w-full"
      id="interface"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundSize: "contain",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <HeroSection />
      <WhoAreWeSection />
      <WhyUsSection />
      <HelpSection />
      <ContactSection />
    </main>
  );
}
