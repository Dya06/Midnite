import { supabase } from '../supabaseClient'

export const uploadImage = async (file) => {
  if (!file) return null

  // Ensure file is an image
  if (!file.type.startsWith('image/')) {
    console.error('File must be an image')
    return null
  }

  // Generate a unique filename using timestamp and random string
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt || 'png'}`
  const filePath = `tasks/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('task-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError.message)
      throw uploadError
    }

    // Get public URL
    const { data } = supabase.storage
      .from('task-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (err) {
    console.error('Failed to upload image:', err)
    return null
  }
}
