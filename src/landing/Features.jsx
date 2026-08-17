import React from 'react'
import { CheckCircle2, Zap, Award } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      title: "Reliable",
      desc: "We deliver websites that businesses can depend on. Engineered for 99.9% uptime."
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Fast",
      desc: "Quick turnaround without compromising quality. Your project shipped on time."
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: "Professional",
      desc: "Clean, purposeful designs built for modern brands that want to stand out."
    }
  ]

  return (
    <div className="bg-black text-white py-24 px-8 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Why Midnite</div>
          <h2 className="text-4xl md:text-5xl font-bold">Built different. Built better.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="mb-6">{feat.icon}</div>
              <h3 className="text-xl font-bold mb-4">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
