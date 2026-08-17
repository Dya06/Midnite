import React from 'react'
import { Monitor, FileText, ShoppingCart, RefreshCw, Smartphone, Search, Settings, PenTool } from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: <Monitor className="w-6 h-6 text-black" />,
      title: "Custom Website Design",
      desc: "Professional websites tailored to your business, built from scratch."
    },
    {
      icon: <FileText className="w-6 h-6 text-black" />,
      title: "Business Landing Pages",
      desc: "High-converting pages designed to generate leads and sales."
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-black" />,
      title: "Ecommerce Stores",
      desc: "Beautiful online stores with secure checkout and inventory."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-black" />,
      title: "Website Redesigns",
      desc: "Transform outdated websites into modern, high-performance platforms."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-black" />,
      title: "Mobile Optimisation",
      desc: "Responsive designs that work flawlessly on every device."
    },
    {
      icon: <Search className="w-6 h-6 text-black" />,
      title: "SEO Setup",
      desc: "Improve search visibility and Google rankings to drive organic traffic."
    },
    {
      icon: <Settings className="w-6 h-6 text-black" />,
      title: "Website Maintenance",
      desc: "Continuous updates, backups and technical support to keep you running."
    },
    {
      icon: <PenTool className="w-6 h-6 text-black" />,
      title: "Branding & UI Design",
      desc: "Modern branding, interfaces and digital identity that stands out."
    }
  ]

  return (
    <div id="services" className="bg-white text-black py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-bold tracking-widest uppercase text-gray-500 mb-4">What We Offer</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Everything you need to build a powerful online presence and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-white border border-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
                {srv.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{srv.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {srv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
