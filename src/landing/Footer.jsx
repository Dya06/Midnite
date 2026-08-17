import React, { useState } from 'react'
import { Mail, MessageCircle, Briefcase, Camera } from 'lucide-react'

export default function Footer() {
  const whatsappNumber = "1234567890" // Placeholder, user will update this

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault()
    
    // Construct WhatsApp message
    const text = `Hello MIDNITE!%0A%0A*Name:* ${formData.name}%0A*Company:* ${formData.company}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A%0A*Message:*%0A${formData.message}`
    
    // Open WhatsApp URL
    window.open(`https://wa.me/qr/Z2K75Z2LNEMKI1?text=${text}`, '_blank')
  }

  return (
    <div id="contact" className="bg-black text-white pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Let's Build Something <br />
            <span className="text-gray-500">Amazing Together.</span>
          </h2>
          <p className="text-gray-400">Ready to transform your online presence? Drop us a line.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          
          {/* Left: Contact Info */}
          <div className="lg:w-1/3 space-y-4">
            <a href="mailto:midnitesolutions@gmail.com" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Email Us</div>
                <div className="text-gray-400 text-sm">midnitesolutions@gmail.com</div>
              </div>
            </a>
            <a href="https://wa.me/qr/Z2K75Z2LNEMKI1" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">WhatsApp</div>
                <div className="text-gray-400 text-sm">Chat with us</div>
              </div>
            </a>
            <a href="https://www.linkedin.com/in/midnite-solutions-5314163a9?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">LinkedIn</div>
                <div className="text-gray-400 text-sm">Follow our updates</div>
              </div>
            </a>
            <a href="https://www.instagram.com/midnitesolutions_?igsh=Zmo5aHE5MTloaWY2" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Instagram</div>
                <div className="text-gray-400 text-sm">@midnitesolutions_</div>
              </div>
            </a>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:w-2/3 bg-white/5 border border-white/10 p-8 rounded-2xl">
            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Company</label>
                  <input name="company" value={formData.company} onChange={handleChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors" placeholder="Your company" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors" placeholder="hello@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors" placeholder="Your phone number" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors resize-none" placeholder="Tell us about your project..."></textarea>
              </div>
              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors">
                Send via WhatsApp
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-gray-500 text-sm">
          <div className="font-bold tracking-widest uppercase text-white mb-4 md:mb-0">MIDNITE</div>
          <div>&copy; {new Date().getFullYear()} Midnite Solutions. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
