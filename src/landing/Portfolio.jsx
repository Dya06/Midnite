import React from 'react'

export default function Portfolio() {
  const projects = [
    {
      title: "Apex Capital",
      tag: "Finance",
      desc: "A sleek investment platform with real-time dashboards.",
      img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Studio Noire",
      tag: "Creative Agency",
      desc: "Minimal portfolio showcasing editorial photography.",
      img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Veritas Legal",
      tag: "Law Firm",
      desc: "Authoritative firm website built for trust, clarity, and conversion.",
      img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Luminary Shop",
      tag: "Ecommerce",
      desc: "Premium store with seamless checkout and stunning product displays.",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Drift Digital",
      tag: "SaaS Startup",
      desc: "High-converting landing page driving signups with bold typography.",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Oasis Wellness",
      tag: "Health",
      desc: "Calm, premium wellness site designed for retention.",
      img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Architeqt",
      tag: "Architecture",
      desc: "Visually stunning showcase of modern architectural projects.",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"
    },
    {
      title: "Nexus Tech",
      tag: "Technology",
      desc: "Futuristic corporate site for an emerging AI startup.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((proj, i) => (
            <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
              <div className="h-48 overflow-hidden">
                <img 
                  src={proj.img} 
                  alt={proj.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col h-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">{proj.title}</h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-1 rounded">
                    {proj.tag}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-auto line-clamp-2">
                  {proj.desc}
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-sm font-bold mt-4 hover:text-gray-300 transition-colors">
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
