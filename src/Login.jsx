import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login({ isDark, toggleTheme }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    setError(null)
    
    // Custom Validation
    const errors = {}
    if (!email) errors.email = 'Please fill out this field.'
    if (!password) errors.password = 'Please fill out this field.'
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInError) {
      setError(signInError.message)
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface relative">
      <main className="flex flex-col w-full min-h-screen justify-center items-center p-md bg-background relative overflow-hidden">
        <div className="w-full max-w-[384px] relative z-10">
          
          {/* Logo */}
          <div className="flex justify-center mb-xl">
            <img 
              alt="Logo" 
              className="w-16 h-16 object-contain rounded-full bg-surface" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClh2W5Q8KxEFTYvfsJJlROcrCaEzz6w8sdlIGHyXhYZ933rD64sJe1FuyouTQmmiZHhWwQBs2dX1r04_OJeeWUobllA8GWoUHn6uoa4QTf4Wxtk9JO6FVUd9zl255R10xEKIzfn5SC-7Ka4-taWPEdmDcnS2dBGY5y5E3gFavMACQKwjqjoPPT9bNfyo8IcBmSax9Cay3ZI6aCrY3TsR4_hDOcIBhSWiF_Ol2UFwL8EG1QrPVjJQLPZ4ru2TrxMw15aw" 
            />
          </div>
          
          <div className={`bg-surface rounded-xl overflow-hidden relative ${isDark ? 'shadow-[0_0_45px_rgba(255,255,255,0.08)] border border-surface-variant' : 'shadow-xl'}`}>
            
            {/* Error Message */}
            {error && (
              <div className="mx-xl mt-xl p-md bg-error-container text-on-error-container rounded-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                <span className="font-body-sm text-sm">{error}</span>
              </div>
            )}

            {/* Login View */}
            <div className="p-xl transition-all duration-300 ease-in-out">
              <div className="mb-lg">
                <h1 className="text-headline-md text-on-surface mb-sm">Sign In</h1>
                <p className="text-body-md text-on-surface-variant">Access your dashboard</p>
              </div>
              <form onSubmit={handleAuth} noValidate className="space-y-md">
                <div>
                  <label className="block text-label-bold text-on-surface-variant mb-xs">Email</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: null }))
                    }}
                    className={`w-full bg-surface-container-low text-on-surface border ${validationErrors.email ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'} rounded-lg px-md py-sm text-body-md focus:outline-none focus:ring-1 transition-colors`}
                    placeholder="name@gmail.com" 
                  />
                  {validationErrors.email && (
                    <div className="text-error text-body-sm mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-xs">
                    <label className="block text-label-bold text-on-surface-variant">Password</label>
                  </div>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value)
                        if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }))
                      }}
                      className={`w-full bg-surface-container-low text-on-surface border ${validationErrors.password ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'} rounded-lg px-md py-sm pr-10 text-body-md focus:outline-none focus:ring-1 transition-colors`}
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className="text-error text-body-sm mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      {validationErrors.password}
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-headline-sm rounded-lg py-sm mt-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
              </form>
            </div>
            
          </div>
          
          <div className="mt-xl flex justify-center">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[28px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
          
        </div>
      </main>
    </div>
  )
}
