import React from 'react'
import Navbar from './Navbar'

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] bg-black text-white flex flex-col overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
          alt="Workspace"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full flex-grow">
        <Navbar />

        <div className="max-w-7xl mx-auto px-8 w-full flex-grow flex items-center pt-12 pb-24">
          <div className="max-w-2xl">
            
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-300">Now accepting new projects</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Modern Websites <br />
              <span className="text-gray-300">That Grow Your</span> <br />
              Business
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-[36rem] leading-relaxed">
              We build premium websites that are fast, modern, mobile-friendly, and designed to convert visitors into customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-16">
              <a href="#contact" className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center">
                Get a Free Consultation
              </a>
              <a href="#work" className="px-8 py-4 bg-transparent text-white font-semibold rounded-full border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                View Our Work
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <div className="text-2xl font-bold text-white mb-1">2</div>
                <div className="text-sm text-gray-400 font-medium">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-gray-400 font-medium">Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">3×</div>
                <div className="text-sm text-gray-400 font-medium">Faster</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
