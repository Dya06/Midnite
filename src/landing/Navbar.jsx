import React from 'react'

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto text-white">
      <div className="font-headline-md tracking-widest text-xl font-bold uppercase">
        Midnite
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-body-sm text-gray-300">
        <a href="#services" className="hover:text-white transition-colors">Services</a>
        <a href="#work" className="hover:text-white transition-colors">Our Work</a>
        <a href="#process" className="hover:text-white transition-colors">Process</a>
        <a href="#contact" className="hover:text-white transition-colors">Contact</a>
      </div>

      <button className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
        Get Started
      </button>
    </nav>
  )
}
