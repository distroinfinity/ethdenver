import Footer from "@/components/ui/Footer";
import Hero from "@/components/ui/Hero";
import Navbar from "@/components/ui/Navbar";
import SpawnAgentForm from "@/components/ui/SpawnAgentForm";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <SpawnAgentForm />
      <Footer />
    </div>
  );
}