import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function ProfileModal({ session, onClose }) {
  const [fullName, setFullName] = useState(session?.user?.user_metadata?.full_name || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.user_metadata?.avatar_url || '')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const fileInputRef = useRef(null)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}. Make sure you created the 'avatars' storage bucket and its public policy!`)
      setLoading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    setAvatarUrl(data.publicUrl)
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    const updateData = {
      data: {
        full_name: fullName,
        avatar_url: avatarUrl
      }
    }

    if (password) {
      updateData.password = password
    }

    const { error: updateError } = await supabase.auth.updateUser(updateData)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess("Profile updated successfully!")
      setPassword('')
      setConfirmPassword('')
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-surface-variant p-xl shadow-2xl w-[90%] max-w-[450px] relative rounded-xl">
        
        <button onClick={onClose} className="absolute top-md right-md text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <h2 className="font-headline-md text-headline-md text-primary mb-lg">Profile Settings</h2>

        {error && (
          <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <span className="font-body-sm text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-md p-md bg-surface-container text-primary rounded-lg flex items-center gap-sm border border-primary/20">
            <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
            <span className="font-body-sm text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-md">
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container flex items-center justify-center shrink-0 border border-surface-variant">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">account_circle</span>
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-md py-xs bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors rounded-lg disabled:opacity-50"
              >
                Change Photo
              </button>
              <div className="text-body-sm text-on-surface-variant mt-1">
                JPG, GIF or PNG. Max size 2MB.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-label-bold text-on-surface-variant mb-xs uppercase">Display Name</label>
            <input 
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface border border-outline-variant rounded-lg px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Your name"
            />
          </div>

          <div className="pt-sm border-t border-surface-variant">
            <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-md uppercase">Change Password</h3>
            <div className="space-y-sm">
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface border border-outline-variant rounded-lg px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="New password (leave blank to keep)"
              />
              <input 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface border border-outline-variant rounded-lg px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-lg mt-lg border-t border-surface-variant">
            <button 
              type="button" 
              onClick={handleSignOut}
              className="text-error hover:text-error/80 font-label-bold text-label-bold uppercase transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
            <div className="flex gap-md">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-md py-sm bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-md py-sm bg-primary text-on-primary font-label-bold text-label-bold uppercase hover:bg-primary/90 transition-colors rounded-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
