import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { uploadImage } from './utils/uploadImage'

export default function TaskDetail({ task, session, activeBoard, onUpdate, onDeleteTask }) {
  if (!task) return null

  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status || '')
  const [priority, setPriority] = useState(task.priority || 'Medium')
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [tags, setTags] = useState(task.tags || [])
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '')
  
  // Tag Manager State
  const [allTags, setAllTags] = useState([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [tagColor, setTagColor] = useState('#863bff')

  const [activities, setActivities] = useState([])
  const [newComment, setNewComment] = useState('')
  const [mentionQuery, setMentionQuery] = useState(null)
  
  const [profiles, setProfiles] = useState([])
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  
  // Assignee Dropdown State
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [assigneeSearch, setAssigneeSearch] = useState('')
  
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  // Custom DatePicker State
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  // Markdown Preview State
  const [previewDescription, setPreviewDescription] = useState(false)

  const handleImageUpload = async (e, setter, fieldToSave = null) => {
    let file = null
    
    if (e.type === 'paste') {
      const items = e.clipboardData?.items
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          file = item.getAsFile()
          break
        }
      }
    } else if (e.type === 'drop') {
      e.preventDefault()
      const items = e.dataTransfer?.items
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          file = item.getAsFile()
          break
        }
      }
    } else if (e.target.files?.length > 0) {
      file = e.target.files[0]
    }

    if (file) {
      e.preventDefault()
      
      const target = e.type === 'change' ? e.target.closest('.relative').querySelector('textarea') : e.target
      const start = target ? target.selectionStart : 0
      const end = target ? target.selectionEnd : 0
      
      const uploadingText = `\n![Uploading ${file.name}...]()\n`
      
      setter(prev => {
        const newValue = prev.substring(0, start) + uploadingText + prev.substring(end)
        return newValue
      })

      const url = await uploadImage(file)
      
      setter(prev => {
        if (url) {
          const newValue = prev.replace(uploadingText, `\n![Image](${url})\n`)
          if (fieldToSave) {
            saveField(fieldToSave, newValue)
          }
          return newValue
        } else {
          alert("Image upload failed! Please make sure your Supabase 'task-images' bucket has an RLS policy allowing INSERT for authenticated/anon users.")
          return prev.replace(uploadingText, '')
        }
      })
    }
  }

  // Sync props if task changes
  useEffect(() => {
    setTitle(task.title || '')
    setDescription(task.description || '')
    setStatus(task.status || '')
    setPriority(task.priority || 'Medium')
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    setTags(task.tags || [])
    setAssigneeId(task.assignee_id || '')
    fetchActivity()
  }, [task.id])

  useEffect(() => {
    fetchProfiles()
    fetchAllTags()
  }, [])

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url')
    if (data) setProfiles(data)
  }

  const parseTag = (tagStr) => {
    try {
      const parsed = JSON.parse(tagStr)
      if (parsed.name && parsed.color) return parsed
    } catch {}
    return { name: tagStr, color: '#3b82f6' }
  }

  const fetchAllTags = async () => {
    const { data: tagsData } = await supabase.from('tags').select('*').order('name')
    if (tagsData) {
      setAllTags(tagsData)
    }
  }

  const fetchActivity = async () => {
    const { data, error } = await supabase
      .from('task_activity')
      .select('*, profiles(full_name, avatar_url)')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
    if (!error && data) setActivities(data)
  }

  const createNotification = async (userId, type, content = '') => {
    if (userId === session?.user?.id) return // Don't notify self
    try {
      await supabase.from('notifications').insert([{
        user_id: userId,
        task_id: task.id,
        actor_id: session?.user?.id,
        type,
        content
      }])
    } catch (err) { console.error("Notification err:", err) }
  }

  const saveField = async (field, value) => {
    const { error } = await supabase
      .from('tasks')
      .update({ [field]: value })
      .eq('id', task.id)
    
    if (!error) {
      onUpdate({ ...task, [field]: value })
      if (field === 'assignee_id' && value) {
        createNotification(value, 'assign')
      }
    } else {
      console.error('Error saving field:', error)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    const { data, error } = await supabase
      .from('task_activity')
      .insert([{
        task_id: task.id,
        user_id: session?.user?.id,
        content: newComment,
        type: 'comment'
      }])
      .select('*, profiles(full_name, avatar_url)')
    
    if (!error && data) {
      setActivities([...data, ...activities])
      
      // Parse mentions
      const mentions = newComment.match(/@([a-zA-Z0-9_ ]+)/g)
      if (mentions) {
        const uniqueNames = [...new Set(mentions.map(m => m.substring(1).trim().toLowerCase()))]
        const mentionedProfiles = profiles.filter(p => p.full_name && uniqueNames.includes(p.full_name.toLowerCase()))
        mentionedProfiles.forEach(p => {
          createNotification(p.id, 'mention', newComment.substring(0, 100))
        })
      }
      
      setNewComment('')
      setMentionQuery(null)
    }
  }

  const handleEditComment = (activity) => {
    setEditingCommentId(activity.id)
    setEditingCommentContent(activity.content)
  }

  const handleSaveEditComment = async (activityId) => {
    const { data, error } = await supabase
      .from('task_activity')
      .update({ content: editingCommentContent })
      .eq('id', activityId)
      .select('*, profiles(full_name, avatar_url)')

    if (!error && data && data.length > 0) {
      setActivities(activities.map(a => a.id === activityId ? data[0] : a))
      setEditingCommentId(null)
    }
  }

  const handleDeleteComment = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return
    const { error } = await supabase
      .from('task_activity')
      .delete()
      .eq('id', activityId)
    
    if (!error) {
      setActivities(activities.filter(a => a.id !== activityId))
    }
  }

  // Helper for generating calendar grid
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // Empty padding days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isSelected = dueDate === dateStr
      days.push(
        <div 
          key={d} 
          onClick={() => {
            setDueDate(dateStr)
            saveField('due_date', new Date(dateStr + 'T12:00:00Z').toISOString())
            setShowDatePicker(false)
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer font-label-bold text-[12px] transition-colors ${isSelected ? 'bg-primary text-on-primary shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}
        >
          {d}
        </div>
      )
    }
    return days
  }

  const handleAddTag = async (tagObj) => {
    const tagStr = JSON.stringify(tagObj)
    if (!tags.includes(tagStr)) {
      const updatedTags = [...tags, tagStr]
      setTags(updatedTags)
      saveField('tags', updatedTags)
      
      // Save globally
      const { error } = await supabase.from('tags').upsert([{ name: tagObj.name, color: tagObj.color }])
      if (error) console.error('Error saving global tag:', error)
      
      if (!allTags.find(t => t.name.toLowerCase() === tagObj.name.toLowerCase())) {
        setAllTags([...allTags, tagObj].sort((a,b) => a.name.localeCompare(b.name)))
      }
    }
    setTagSearch('')
    setShowTagDropdown(false)
  }

  const removeTag = async (tagToRemove) => {
    const updatedTags = tags.filter(t => t !== tagToRemove)
    setTags(updatedTags)
    saveField('tags', updatedTags)
  }

  const copyLink = () => {
    const url = `${window.location.origin}?taskId=${task.id}`
    navigator.clipboard.writeText(url)
    setShowMoreOptions(false)
  }
  
  const getAssigneeProfile = () => {
    return profiles.find(p => p.id === assigneeId)
  }

  // Mentions logic
  const handleCommentChange = (e) => {
    const val = e.target.value
    setNewComment(val)
    
    const cursor = e.target.selectionStart
    const textBeforeCursor = val.slice(0, cursor)
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_ ]*)$/)
    
    if (match) {
      setMentionQuery(match[1])
    } else {
      setMentionQuery(null)
    }
  }

  const handleMentionSelect = (profile) => {
    const el = document.getElementById('comment-textarea')
    const cursor = el ? el.selectionStart : newComment.length
    
    const textBeforeCursor = newComment.slice(0, cursor)
    const textAfterCursor = newComment.slice(cursor)
    
    const textBeforeMention = textBeforeCursor.replace(/@([a-zA-Z0-9_ ]*)$/, '')
    const replacement = `@${profile.full_name} `
    
    setNewComment(textBeforeMention + replacement + textAfterCursor)
    setMentionQuery(null)
    
    setTimeout(() => {
      if (el) {
        el.focus()
        el.selectionStart = el.selectionEnd = textBeforeMention.length + replacement.length
      }
    }, 0)
  }

  const renderActivityContent = (content) => {
    return (
      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  const renderTag = (tagStr, isRemoveable = false) => {
    const tagObj = parseTag(tagStr)
    return (
      <div key={tagStr} className="px-3 py-1 rounded-full border font-label-bold text-[11px] flex items-center gap-1 group shadow-sm transition-all" style={{ backgroundColor: `${tagObj.color}15`, color: tagObj.color, borderColor: `${tagObj.color}30` }}>
        {tagObj.name}
        {isRemoveable && (
          <span onClick={(e) => { e.stopPropagation(); removeTag(tagStr) }} className="material-symbols-outlined text-[12px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-error ml-1">close</span>
        )}
      </div>
    )
  }

  const filteredAssignees = profiles.filter(p => p.full_name?.toLowerCase().includes(assigneeSearch.toLowerCase()))
  const filteredTags = allTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))

  return (
    <div className="flex-1 flex overflow-hidden p-margin gap-lg">
      
      {/* Left Column (Main Content) */}
      <div className="flex-[2] bg-surface-container-lowest border border-surface-variant rounded-[24px] flex flex-col overflow-y-auto custom-scrollbar p-xl shadow-sm relative">
        
        <div className="flex items-center justify-between mb-xl relative">
          <div className="flex items-center gap-sm font-label-bold text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
            <span className="bg-surface-container py-0.5 px-3 rounded-full border border-surface-variant">{activeBoard?.title}</span>
            <span>/</span>
            <span className="bg-surface-container py-0.5 px-3 rounded-full border border-surface-variant">{task.board_id === 'leads' ? 'LD-' : 'AL-'}{task.id.toString().slice(0, 3)}</span>
          </div>
          <div className="flex items-center gap-xs relative">
            <button onClick={copyLink} className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors" title="Copy Link">
              <span className="material-symbols-outlined text-[16px]">link</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowMoreOptions(!showMoreOptions)} className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${showMoreOptions ? 'border-primary text-primary bg-surface-container' : 'border-surface-variant hover:border-primary text-on-surface-variant hover:text-primary'}`}>
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
              {showMoreOptions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreOptions(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-surface border border-surface-variant rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { setShowMoreOptions(false); if(onDeleteTask) onDeleteTask(); }} className="w-full flex items-center gap-sm px-md py-sm text-error hover:bg-error-container hover:text-on-error-container font-label-bold text-[11px] tracking-wider uppercase transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete Task
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <input 
          className="font-display-lg text-[32px] font-bold text-primary tracking-tight mb-2xl bg-transparent outline-none w-full border-b border-transparent focus:border-primary transition-colors"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => saveField('title', e.target.value)}
        />

        <div className="mb-[64px]">
          <div className="flex items-center justify-between mb-sm">
            <div className="flex items-center gap-sm font-label-bold text-[12px] font-bold text-primary tracking-widest uppercase">
              <span className="material-symbols-outlined text-[18px]">notes</span>
              Description
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPreviewDescription(!previewDescription)}
                className="text-xs font-label-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors px-2 py-1 rounded hover:bg-surface-container-low"
              >
                {previewDescription ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>
          <div className="border border-surface-variant rounded-xl overflow-hidden bg-surface shadow-sm focus-within:border-primary transition-colors relative">
            {previewDescription ? (
              <div className="w-full p-lg font-body-md text-on-surface min-h-[200px] prose prose-invert max-w-none prose-p:leading-relaxed prose-img:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description || '*No description provided.*'}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                <textarea 
                  className="w-full p-lg font-body-md text-on-surface min-h-[200px] whitespace-pre-wrap bg-transparent outline-none resize-none pb-12"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={(e) => saveField('description', e.target.value)}
                  onPaste={(e) => handleImageUpload(e, setDescription, 'description')}
                  onDrop={(e) => handleImageUpload(e, setDescription, 'description')}
                  placeholder="Add details... (Markdown supported. Paste or drop images here)"
                />
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <label className="cursor-pointer text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, setDescription, 'description')} 
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-sm font-label-bold text-[12px] font-bold text-primary tracking-widest uppercase mb-lg">
            <span className="material-symbols-outlined text-[18px]">forum</span>
            Activity
          </div>
          
          <div className="flex flex-col gap-xl">
            {/* Comment Input */}
            <div className="flex gap-md relative">
              <div className="w-10 h-10 rounded-full border border-surface-variant bg-surface flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">account_circle</span>
                )}
              </div>
              <div className="flex-1 border border-surface-variant rounded-xl overflow-hidden bg-surface shadow-sm focus-within:border-primary transition-colors relative">
                <textarea 
                  id="comment-textarea"
                  value={newComment}
                  onChange={handleCommentChange}
                  onPaste={(e) => handleImageUpload(e, setNewComment)}
                  onDrop={(e) => handleImageUpload(e, setNewComment)}
                  className="w-full bg-transparent p-md font-body-md resize-none outline-none min-h-[100px] pb-12" 
                  placeholder="Write a comment... (Type @ to mention. Markdown and images supported)"
                ></textarea>
                
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <label className="cursor-pointer text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, setNewComment)} 
                    />
                  </label>
                </div>
                
                {/* Mentions Popup */}
                {mentionQuery !== null && (
                  <div className="absolute left-4 bottom-16 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-md py-sm bg-surface-container font-label-bold text-[10px] text-on-surface-variant uppercase border-b border-surface-variant">Tag someone</div>
                    <div className="max-h-[150px] overflow-y-auto custom-scrollbar">
                      {profiles.filter(p => p.full_name?.toLowerCase().includes(mentionQuery.toLowerCase())).map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => handleMentionSelect(p)}
                          className="flex items-center gap-sm px-md py-sm hover:bg-surface-container cursor-pointer transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full border border-surface-variant overflow-hidden">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-surface-container flex items-center justify-center font-label-bold text-[10px] uppercase">{p.full_name?.slice(0, 2) || 'US'}</div>
                            )}
                          </div>
                          <span className="font-label-bold text-[12px] text-primary">{p.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-surface-variant p-sm bg-surface-container flex justify-end">
                  <button onClick={handlePostComment} className="px-lg py-sm bg-primary text-on-primary font-label-bold text-[11px] tracking-wider uppercase rounded-lg hover:bg-inverse-surface transition-colors shadow-sm">Post</button>
                </div>
              </div>
            </div>

            {activities.map(activity => (
              <div key={activity.id} className="flex gap-md group">
                <div className="w-10 h-10 rounded-full border border-surface-variant bg-surface flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {activity.profiles?.avatar_url ? (
                    <img src={activity.profiles.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-label-bold text-on-surface-variant text-[12px] uppercase">
                      {activity.profiles?.full_name?.slice(0, 2) || 'US'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="font-label-bold text-primary font-bold">{activity.profiles?.full_name || 'User'}</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant px-2 py-0.5 bg-surface-container border border-surface-variant rounded-md shadow-sm">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                    {activity.user_id === session?.user?.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 ml-auto">
                        <button onClick={() => handleEditComment(activity)} className="text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined text-[14px]">edit</button>
                        <button onClick={() => handleDeleteComment(activity.id)} className="text-on-surface-variant hover:text-error transition-colors material-symbols-outlined text-[14px]">delete</button>
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === activity.id ? (
                    <div className="border border-primary rounded-xl overflow-hidden bg-surface shadow-sm">
                      <textarea 
                        value={editingCommentContent}
                        onChange={e => setEditingCommentContent(e.target.value)}
                        className="w-full bg-transparent p-md font-body-md resize-none outline-none min-h-[80px]" 
                      ></textarea>
                      <div className="border-t border-surface-variant p-sm bg-surface-container flex justify-end gap-2">
                        <button onClick={() => setEditingCommentId(null)} className="px-lg py-sm text-on-surface font-label-bold text-[11px] tracking-wider uppercase rounded-lg hover:bg-surface-variant transition-colors">Cancel</button>
                        <button onClick={() => handleSaveEditComment(activity.id)} className="px-lg py-sm bg-primary text-on-primary font-label-bold text-[11px] tracking-wider uppercase rounded-lg hover:bg-inverse-surface transition-colors shadow-sm">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md font-body-md text-on-surface shadow-sm whitespace-pre-wrap">
                      {renderActivityContent(activity.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-[24px] flex flex-col shadow-sm">
        <div className="flex flex-col gap-xl p-xl flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Status */}
          <div className="relative">
            <div className="font-label-bold text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-sm">Status</div>
            <div 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full flex items-center justify-between p-md bg-surface rounded-xl border border-surface-variant cursor-pointer hover:border-primary transition-colors shadow-sm"
            >
              <div className="font-label-bold text-primary text-[14px]">{status}</div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
            </div>
            
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)}></div>
                <div className="absolute left-0 top-[70px] w-full bg-surface border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {activeBoard?.columns.map(col => (
                    <div 
                      key={col} 
                      onClick={() => {
                        setStatus(col);
                        saveField('status', col);
                        setShowStatusDropdown(false);
                      }} 
                      className={`px-md py-sm cursor-pointer font-label-bold text-[12px] transition-colors ${status === col ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container'}`}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority */}
          <div className="relative flex flex-col items-start">
            <div className="font-label-bold text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-sm">Priority</div>
            <div 
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className={`inline-flex items-center gap-2 p-2 rounded-md font-label-bold text-[12px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm ${
                priority === 'High' 
                  ? 'bg-error-container text-on-error-container border border-error/20 hover:bg-error-container/80' 
                  : 'bg-surface-container-low text-on-surface-variant border border-surface-variant hover:border-primary'
              }`}
            >
              {priority}
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>

            {showPriorityDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPriorityDropdown(false)}></div>
                <div className="absolute left-0 top-[60px] min-w-[120px] bg-surface border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {['Low', 'Medium', 'High'].map(p => (
                    <div 
                      key={p} 
                      onClick={() => {
                        setPriority(p);
                        saveField('priority', p);
                        setShowPriorityDropdown(false);
                      }} 
                      className={`px-md py-sm cursor-pointer font-label-bold text-[11px] uppercase transition-colors ${priority === p ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container'}`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Assignee */}
          <div className="relative">
            <div className="font-label-bold text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-sm">Assignee</div>
            <div 
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              className="w-full flex items-center justify-between p-sm bg-surface rounded-xl border border-surface-variant cursor-pointer hover:border-primary transition-colors shadow-sm"
            >
              <div className="flex items-center gap-sm">
                <div className="w-8 h-8 rounded-full border border-surface-variant bg-surface-container flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {getAssigneeProfile()?.avatar_url ? (
                    <img src={getAssigneeProfile().avatar_url} alt="Assignee" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">account_circle</span>
                  )}
                </div>
                <span className="font-label-bold text-[13px] text-primary">
                  {getAssigneeProfile()?.full_name || 'Unassigned'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant pr-2">expand_more</span>
            </div>

            {showAssigneeDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAssigneeDropdown(false)}></div>
                <div className="absolute left-0 top-[75px] w-full bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Search Bar */}
                  <div className="p-sm border-b border-surface-variant bg-surface">
                    <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                      <input 
                        type="text" 
                        value={assigneeSearch}
                        onChange={e => setAssigneeSearch(e.target.value)}
                        placeholder="Search team..."
                        className="bg-transparent outline-none font-body-sm text-[12px] text-primary w-full"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div 
                      onClick={() => { setAssigneeId(null); saveField('assignee_id', null); setShowAssigneeDropdown(false); setAssigneeSearch(''); }}
                      className="flex items-center gap-sm px-md py-sm hover:bg-surface-container cursor-pointer transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full border border-surface-variant bg-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </div>
                      <span className="font-label-bold text-[12px] text-on-surface-variant">Unassigned</span>
                    </div>
                    {filteredAssignees.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => { setAssigneeId(p.id); saveField('assignee_id', p.id); setShowAssigneeDropdown(false); setAssigneeSearch(''); }}
                        className="flex items-center gap-sm px-md py-sm hover:bg-surface-container cursor-pointer transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full border border-surface-variant overflow-hidden">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-container flex items-center justify-center font-label-bold text-[10px] uppercase">{p.full_name?.slice(0, 2) || 'US'}</div>
                          )}
                        </div>
                        <span className="font-label-bold text-[12px] text-primary">{p.full_name}</span>
                      </div>
                    ))}
                    {filteredAssignees.length === 0 && (
                      <div className="px-md py-sm text-center font-body-sm text-on-surface-variant">No members found</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Due Date Custom UI */}
          <div className="relative">
            <div className="font-label-bold text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-sm">Due Date</div>
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between p-md bg-surface rounded-xl border border-surface-variant cursor-pointer hover:border-primary transition-colors shadow-sm"
            >
              <div className="flex items-center gap-sm text-primary">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span className="font-label-bold text-[14px]">
                  {dueDate ? new Date(dueDate + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Set Date'}
                </span>
              </div>
              {dueDate && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setDueDate('')
                    saveField('due_date', null)
                  }}
                  className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error transition-colors"
                >
                  close
                </button>
              )}
            </div>
            
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                <div className="absolute left-0 top-[75px] w-full bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden flex flex-col p-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-2 p-1">
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      chevron_left
                    </button>
                    <div className="font-label-bold text-[12px] text-primary uppercase tracking-wider">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      chevron_right
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="font-label-bold text-[10px] text-on-surface-variant">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {renderCalendarDays()}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="relative">
            <div className="font-label-bold text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-sm flex justify-between items-center">
              Tags
            </div>
            <div className="flex flex-wrap gap-xs items-center">
              {tags.map(tag => renderTag(tag, true))}
              
              <button 
                onClick={() => setShowTagDropdown(true)}
                className="px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded-full border border-dashed border-surface-variant font-label-bold text-[11px] text-on-surface-variant transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Add
              </button>
            </div>

            {/* Tags Manager Popup */}
            {showTagDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTagDropdown(false)}></div>
                <div className="absolute left-0 top-full mt-2 w-64 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Tag Search/Create Bar */}
                  <div className="p-sm border-b border-surface-variant bg-surface">
                    <div className="flex items-center gap-2 bg-surface-container rounded-lg px-2 py-1 mb-2 focus-within:border-primary border border-transparent transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                      <input 
                        type="text" 
                        value={tagSearch}
                        onChange={e => setTagSearch(e.target.value)}
                        placeholder="Search or create tag..."
                        className="bg-transparent outline-none font-body-sm text-[12px] text-primary w-full"
                        autoFocus
                      />
                    </div>
                    {/* Create New Tag Banner (if query exists) */}
                    {tagSearch.trim().length > 0 && (
                      <div className="flex flex-col gap-2 p-2 bg-surface-container-low rounded-lg border border-surface-variant">
                        <div className="flex items-center justify-between">
                          <span className="font-label-bold text-[10px] text-on-surface-variant uppercase truncate max-w-[120px]">Create "{tagSearch}"</span>
                          <button onClick={() => handleAddTag({ name: tagSearch.trim(), color: tagColor })} className="bg-primary text-on-primary font-label-bold text-[10px] px-2 py-1 rounded cursor-pointer hover:bg-inverse-surface">Add</button>
                        </div>
                        <div className="flex items-center gap-1">
                          {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                            <button 
                              key={c}
                              onClick={() => setTagColor(c)}
                              className={`w-4 h-4 rounded-full border transition-all cursor-pointer hover:scale-110 ${tagColor === c ? 'scale-125 border-primary shadow-sm' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Existing Tags List */}
                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                    {filteredTags.length > 0 ? filteredTags.map(tagObj => {
                      const tagStr = JSON.stringify(tagObj);
                      const isSelected = tags.includes(tagStr);
                      return (
                        <div 
                          key={tagObj.name} 
                          onClick={() => {
                            if (isSelected) removeTag(tagStr);
                            else handleAddTag(tagObj);
                          }}
                          className={`flex items-center justify-between px-2 py-1.5 hover:bg-surface-container rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-surface-container' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tagObj.color }}></div>
                            <span className="font-label-bold text-[12px] text-primary">{tagObj.name}</span>
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="px-2 py-4 text-center font-body-sm text-on-surface-variant">No existing tags</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-xl border-t border-surface-variant bg-surface-container-lowest/50 mt-auto shrink-0 rounded-b-[24px]">
          <div className="flex flex-col gap-xs text-right font-body-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
            <div>Created: {new Date(task.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
