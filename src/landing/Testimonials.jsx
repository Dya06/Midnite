import React from 'react'
import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      text: "MIDNITE completely transformed our online presence. Our new site is incredibly fast, looks amazing on mobile, and has doubled our lead generation in just three months.",
      name: "Sarah Jenkins",
      role: "CEO at Apex Capital",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    },
    {
      text: "The team at MIDNITE doesn't just build websites; they build digital experiences. Their attention to detail and UI/UX expertise is unmatched.",
      name: "Marcus Chen",
      role: "Founder, Studio Noire",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
    },
    {
      text: "Fast turnaround and incredible support. They took the time to understand our business and delivered a product that exceeded all our expectations.",
      name: "David Martinez",
      role: "Director, Veritas Legal",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    }
  ]

  return (
    <div className="bg-[#111] text-white py-24 px-8 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Client Stories</div>
          <h2 className="text-4xl md:text-5xl font-bold">What our clients say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 flex-grow">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
