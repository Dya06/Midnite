import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Team() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex-1 overflow-y-auto px-margin py-md custom-scrollbar w-full">
      <div className="mb-xl">
        <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold mb-xs">Team Directory</h1>
        <p className="font-body-md text-on-surface-variant max-w-[600px]">
          Meet the people working on these projects.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-on-surface-variant font-body-md">
          Loading team members...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md pb-xl">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className="bg-surface-container-lowest rounded-2xl p-lg border border-surface-variant shadow-sm hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-md mb-md">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'Team member'} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm group-hover:ring-2 group-hover:ring-primary transition-all" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-background bg-surface flex items-center justify-center text-on-surface-variant shadow-sm group-hover:ring-2 group-hover:ring-primary transition-all">
                    <span className="material-symbols-outlined text-[32px]">account_circle</span>
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-headline-md text-[16px] text-primary font-bold truncate">
                    {profile.full_name || profile.email?.split('@')[0] || 'Unknown User'}
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              
              <div className="pt-md border-t border-surface-variant flex items-center justify-between text-on-surface-variant">
                <div className="flex items-center gap-xs font-mono-label text-[11px] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="col-span-full py-xl text-center border-2 border-dashed border-surface-variant rounded-2xl">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md opacity-50">groups</span>
              <h3 className="font-headline-md text-[18px] text-primary font-bold mb-xs">No Team Members Found</h3>
              <p className="font-body-sm text-on-surface-variant">
                It looks like the profiles table is currently empty.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
