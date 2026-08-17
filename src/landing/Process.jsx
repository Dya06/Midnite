import React from 'react'

export default function Process() {
  const steps = [
    {
      num: "01",
      title: "Discovery",
      desc: "We start by understanding your goals, your audience, and your market to create a solid strategy."
    },
    {
      num: "02",
      title: "Design",
      desc: "Our designers craft modern, purposeful UI/UX concepts tailored to your brand identity."
    },
    {
      num: "03",
      title: "Development",
      desc: "We build fast, responsive websites with clean code, ensuring optimal performance across all devices."
    },
    {
      num: "04",
      title: "Launch",
      desc: "We deploy, optimise, and provide ongoing support to ensure your long-term success."
    }
  ]

  return (
    <div id="process" className="bg-white text-black py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-500 mb-4">How We Work</div>
          <h2 className="text-4xl md:text-5xl font-bold">Our Process</h2>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"></div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={i} className={`relative flex items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16`}>
                
                {/* Number Badge */}
                <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg border-4 border-white z-10 shrink-0">
                  {step.num}
                </div>

                {/* Content */}
                <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
