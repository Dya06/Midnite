import React, { useEffect } from 'react'
import Hero from './landing/Hero'
import Marquee from './landing/Marquee'
import Features from './landing/Features'
import Services from './landing/Services'
import Portfolio from './landing/Portfolio'
import Process from './landing/Process'
import WhyChooseUs from './landing/WhyChooseUs'
import Testimonials from './landing/Testimonials'
import Footer from './landing/Footer'

export default function LandingPage({ isDark, toggleTheme }) {
  // Ensure we are in dark mode by default for the landing page or just let it be independent.
  // Actually, the landing page has its own hardcoded themes for sections, so it works regardless.
  
  return (
    <div className="min-h-screen bg-black font-body-md selection:bg-white selection:text-black">
      <Hero />
      <Marquee />
      <Features />
      <Services />
      <Portfolio />
      <Process />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  )
}
