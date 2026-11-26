"use client";

import Header from "@/components/landingPage/Header";
import Hero from "@/components/landingPage/Hero";
// import Features from "@/components/landingPage/Features";
import Footer from "@/components/landingPage/Footer";
import DynamicBackground from "@/components/background/DynamicBackground";

export default function LandingPage() {
  return (
    <div className="relative bg-[#1F2937] min-h-screen">
      <DynamicBackground />
      <div className="relative z-10">
        <Header />
        <Hero />
        {/* <Features /> */}
        <Footer />
      </div>
    </div>
  );
}
