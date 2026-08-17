import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './Login'
import Board from './Board'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-body-md text-on-surface">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login isDark={isDark} toggleTheme={toggleTheme} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={session ? <Board session={session} isDark={isDark} toggleTheme={toggleTheme} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  )
}
