import React from 'react'

export default function Marquee() {
  const items = [
    "Custom Design", "Landing Pages", "Ecommerce", "SEO", "Branding", "Mobile Optimised", "Fast Delivery", "Premium Quality", "Modern UI"
  ]

  // Duplicate items twice to ensure smooth infinite scrolling
  const marqueeItems = [...items, ...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-black py-4 border-y border-white/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {marqueeItems.map((item, index) => (
          <div key={index} className="flex items-center mx-6">
            <span className="text-white/70 font-semibold tracking-wider uppercase text-sm">{item}</span>
            <span className="w-1 h-1 rounded-full bg-white/30 ml-12"></span>
          </div>
        ))}
      </div>
    </div>
  )
}
