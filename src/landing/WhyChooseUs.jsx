import React from 'react'
import { Check } from 'lucide-react'

export default function WhyChooseUs() {
  const reasons = [
    "Clean & Modern Design",
    "Fast Turnaround",
    "Mobile Friendly",
    "Affordable Pricing",
    "Built for Growth"
  ]

  return (
    <div className="bg-[#0a0a0a] text-white py-24 px-8 border-y border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        <div className="lg:w-1/2">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Why Choose Us</div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Everything you <br />
            need to succeed <br />
            <span className="text-gray-400">online.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-[28rem] leading-relaxed">
            We combine strategic thinking with exceptional craftsmanship to create digital experiences that deliver real business results.
          </p>
        </div>

        <div className="lg:w-1/2 w-full space-y-4">
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">{reason}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
