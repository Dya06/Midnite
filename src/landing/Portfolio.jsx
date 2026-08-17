import React from 'react'

export default function Portfolio() {
  const projects = [
    {
      title: "Kirpal Singh and Partners",
      tag: "Law Firm",
      desc: "Authoritative firm website built for trust, clarity, and conversion.",
      img: "/ksp.jpg",
      link: "https://kirpalsinghpartners.com"
    },
    {
      title: "Metalpix",
      tag: "Ecommerce",
      desc: "Premium store with seamless checkout for metal prints.",
      img: "/metalpix.png",
      link: "https://metalpix.my"
    }
  ]

  return (
    <div id="work" className="bg-[#111] text-white py-24 px-8 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Our Work</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Projects we're proud of</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A curated selection of brands we've helped grow through strategic digital design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {projects.map((proj, i) => (
            <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
              <div className="h-64 overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={proj.img} 
                  alt={proj.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col h-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">{proj.title}</h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-1 rounded shrink-0 ml-2">
                    {proj.tag}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-auto line-clamp-2">
                  {proj.desc}
                </p>
                <a href={proj.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold mt-4 hover:text-gray-300 transition-colors">
                  View Project
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
