import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import ProfileModal from './ProfileModal'
import Team from './Team'
import TaskDetail from './TaskDetail'

const LEADS_BOARD = {
  id: 'leads',
  title: 'Leads',
  columns: ['Potential', 'Negotiation', 'Quote Sent', 'To Invoice', 'Pending Payment', 'Completed']
}

export default function Board({ session, isDark, toggleTheme }) {
  const [activeView, setActiveView] = useState('kanban')
  const [activeTask, setActiveTask] = useState(null)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const [boards, setBoards] = useState([LEADS_BOARD])
  const [activeBoardId, setActiveBoardId] = useState('leads')
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0]

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  // Board management state
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [boardToDelete, setBoardToDelete] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  // Avatars state
  const [isAvatarsExpanded, setIsAvatarsExpanded] = useState(false)
  const [selectedAvatarPopup, setSelectedAvatarPopup] = useState(null)

  const [newTaskCol, setNewTaskCol] = useState(activeBoard.columns[0])
  const [newTaskData, setNewTaskData] = useState({ title: '', description: '', priority: 'Medium' })
  const [profiles, setProfiles] = useState([])

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)

  // Notifications State
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Filter State
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filters, setFilters] = useState({ assignee: null, priority: null, tags: [] })
  const [allTags, setAllTags] = useState([])
  const [filterTagSearch, setFilterTagSearch] = useState('')

  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchBoards()
    fetchProfiles()
    fetchAllTags()
    const saved = localStorage.getItem('midnite_recent_searches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])
  
  useEffect(() => {
    if (session?.user?.id) fetchNotifications()
  }, [session?.user?.id])
  
  const fetchAllTags = async () => {
    const { data: tagsData } = await supabase.from('tags').select('*').order('name')
    if (tagsData) {
      setAllTags(tagsData)
    }
  }

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profiles!notifications_actor_id_fkey(full_name, avatar_url)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  const handleReadNotification = async (notif) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
      setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    }
    const { data: taskData } = await supabase.from('tasks').select('*').eq('id', notif.task_id).single()
    if (taskData) {
      setActiveBoardId(taskData.board_id)
      setActiveTask(taskData)
      setActiveView('kanban')
    }
    setShowNotifications(false)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const { data } = await supabase
      .from('tasks')
      .select('id, title, board_id, linked_board_id, priority, status')
      .ilike('title', `%${query}%`)
      .limit(10)
    if (data) setSearchResults(data)
  }

  const handleSelectSearchResult = (task, searchTerm) => {
    const term = searchTerm || task.title
    const updatedRecents = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5)
    setRecentSearches(updatedRecents)
    localStorage.setItem('midnite_recent_searches', JSON.stringify(updatedRecents))
    
    setSearchQuery('')
    setShowSearchDropdown(false)
    setActiveBoardId(task.board_id)
    setActiveView('kanban')
    setHighlightedTaskId(task.id)
    
    // Clear the highlight after 3 seconds
    setTimeout(() => {
      setHighlightedTaskId(null)
    }, 3000)
  }

  const handleRemoveRecentSearch = (e, term) => {
    e.stopPropagation()
    const updated = recentSearches.filter(t => t !== term)
    setRecentSearches(updated)
    localStorage.setItem('midnite_recent_searches', JSON.stringify(updated))
  }

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url')
    if (data) setProfiles(data)
  }

  useEffect(() => {
    setLoading(true)
    fetchTasks()
  }, [activeBoardId])

  const fetchBoards = async () => {
    const { data, error } = await supabase.from('boards').select('*')
    if (data) {
      const dbBoards = data.filter(b => b.id !== 'leads')
      dbBoards.sort((a, b) => a.title.localeCompare(b.title))
      setBoards([LEADS_BOARD, ...dbBoards])
    }
  }

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('board_id', activeBoardId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const draggedTask = tasks.find(t => t.id === draggableId)
    const newStatus = destination.droppableId

    // Optimistically update UI
    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    )
    setTasks(updatedTasks)

    // Update DB
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId)

    if (error) {
      console.error('Error updating task:', error)
      // Revert if error
      fetchTasks()
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    let linkedBoardId = null
    if (activeBoardId === 'leads') {
      const boardId = newTaskData.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
      const { error: boardErr } = await supabase.from('boards').insert([
        { id: boardId, title: newTaskData.title.trim(), columns: ['Backlog', 'In Progress', 'Review', 'Completed'] }
      ])
      if (boardErr) {
        console.error('Error auto-creating board:', boardErr)
        alert('Error creating linked board: ' + boardErr.message)
        return
      }
      linkedBoardId = boardId
      fetchBoards()
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { 
          title: newTaskData.title, 
          description: newTaskData.description, 
          status: newTaskCol, 
          priority: newTaskData.priority,
          board_id: activeBoardId,
          linked_board_id: linkedBoardId
        }
      ])
      .select()

    if (error) {
      console.error('Error creating task:', error)
      alert('Error: ' + error.message)
    } else if (data) {
      setTasks([...data, ...tasks])
      setIsCreating(false)
      setNewTaskData({ title: '', description: '', priority: 'Medium' })
    }
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) return
    const id = newBoardTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
    const { data, error } = await supabase.from('boards').insert([
      { id, title: newBoardTitle, columns: ['Backlog', 'In Progress', 'Review', 'Completed'] }
    ]).select()
    
    if (error) {
      console.error('Error creating board:', error)
      alert('Error: ' + error.message)
    } else if (data) {
      const { error: taskErr } = await supabase.from('tasks').insert([{
        title: newBoardTitle.trim(),
        status: LEADS_BOARD.columns[0],
        priority: 'Medium',
        board_id: 'leads',
        linked_board_id: id
      }])
      if (taskErr) console.error('Error creating linked task:', taskErr)

      fetchBoards()
      setIsCreatingBoard(false)
      setNewBoardTitle('')
      setActiveBoardId(id)
    }
  }

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return
    
    // Cleanup all tasks inside the board to prevent orphaned data
    const { error: innerTasksErr } = await supabase.from('tasks').delete().eq('board_id', boardToDelete.id)
    if (innerTasksErr) console.error('Error deleting inner tasks:', innerTasksErr)

    // Delete the board itself
    const { error } = await supabase.from('boards').delete().eq('id', boardToDelete.id)
    if (error) {
      console.error('Error deleting board:', error)
    } else {
      // Also delete the linked task on the Leads board
      const { error: taskErr } = await supabase.from('tasks').delete().eq('linked_board_id', boardToDelete.id).eq('board_id', 'leads')
      if (taskErr) console.error('Error deleting linked task:', taskErr)

      if (activeBoardId === boardToDelete.id) {
        setActiveBoardId('leads')
      } else if (activeBoardId === 'leads') {
        fetchTasks()
      }
      
      setBoardToDelete(null)
      fetchBoards()
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete.id)
    if (error) {
      console.error('Error deleting task:', error)
      alert('Error: ' + error.message)
    } else {
      if (taskToDelete.board_id === 'leads' && taskToDelete.linked_board_id) {
        await supabase.from('tasks').delete().eq('board_id', taskToDelete.linked_board_id)
        await supabase.from('boards').delete().eq('id', taskToDelete.linked_board_id)
        fetchBoards()
      }
      setTasks(tasks.filter(t => t.id !== taskToDelete.id))
      if (activeTask?.id === taskToDelete.id) {
        setActiveTask(null)
        setActiveView('board')
      }
      setTaskToDelete(null)
    }
  }

  const openCreateModal = (colId) => {
    setNewTaskCol(colId)
    setIsCreating(true)
  }

  const columns = activeBoard.columns.map(colId => {
    const colTasks = tasks.filter(t => {
      if (t.status !== colId) return false
      if (filters.assignee && t.assignee_id !== filters.assignee) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (filters.tags && filters.tags.length > 0) {
        if (!t.tags) return false
        const hasMatch = filters.tags.some(filterTag => {
          return t.tags.some(tagStr => {
            try {
              const parsed = JSON.parse(tagStr)
              return parsed.name.toLowerCase() === filterTag.toLowerCase()
            } catch {
              return tagStr.toLowerCase() === filterTag.toLowerCase()
            }
          })
        })
        if (!hasMatch) return false
      }
      return true
    })
    return {
      id: colId,
      title: colId,
      count: colTasks.length,
      tasks: colTasks
    }
  })

  // Helper to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const activeBoardUsers = [
    {
      id: 'current',
      email: session?.user?.email || 'guest@example.com',
      name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Guest',
      avatar: session?.user?.user_metadata?.avatar_url
    }
  ]

  const HighlightMatch = ({ text, highlight }) => {
    if (!highlight || !highlight.trim() || typeof text !== 'string') return <span>{text}</span>
    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)
    return (
      <span>
        {parts.map((part, i) => regex.test(part) ? <span key={i} className="text-primary bg-primary/10 px-0.5 rounded-sm">{part}</span> : part)}
      </span>
    )
  }

  return (
    <div className="bg-background font-body-md text-on-surface flex flex-col min-h-screen h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-surface-variant bg-surface z-50 flex flex-col shrink-0">
        <div className="h-16 px-margin flex items-center gap-sm border-b border-surface-variant mb-md shrink-0">
          <img alt="Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIM7Oo_ZAzFaMfJBUvKgAM-yyEomr2VJvodG86HKYF-dNlGPBvm2Ddv30ODLAPS2AWb4jzWc9GJkAncx0-D6CZrG43UROxoEwzF6C2OILENWYIZ4RBMDVNhZkwJUgBBFeRoJE886X05rt__glkjIzs2N36lgegK82ATvse5oM7AdSJs7wYrLlO4sxvjTAzOZ-G9yf2dUHfo87jGg1nirCojePDuj3dxBnIjfh_QhZsAv9L_uB-I7CsC4UsUjE2WmGUvQ" />
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Midnite</span>
        </div>
        <nav className="flex-1 px-md space-y-xs overflow-y-auto custom-scrollbar">
          <div className="mb-md">
            {/* Leads Board (Permanent & Un-collapsible) */}
            <div className="mb-sm">
              <button 
                onClick={() => {
                  setActiveBoardId('leads')
                  setActiveView('kanban')
                }}
                className={`w-full flex items-center px-md py-sm rounded-lg transition-all font-body-md text-left ${activeView === 'kanban' && activeBoardId === 'leads' ? 'bg-surface-container-low text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined mr-md text-[20px]">star</span>
                <span className="flex-1 truncate pr-8">Leads</span>
              </button>
            </div>

            {/* Projects Collapsible Folder */}
            <button 
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="w-full flex items-center justify-between px-md py-sm font-label-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider text-[11px] mb-xs group mt-md"
            >
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">folder</span>
                Projects
              </div>
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isProjectsOpen ? 'rotate-180' : ''}`}>
                keyboard_arrow_down
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col space-y-xs ${isProjectsOpen ? 'max-h-[1000px] opacity-100 mt-xs' : 'max-h-0 opacity-0'}`}
            >
              {boards.filter(b => b.id !== 'leads').map(board => (
                <div key={board.id} className="group flex items-center relative">
                  <button 
                    onClick={() => {
                      setActiveBoardId(board.id)
                      setActiveView('kanban')
                    }}
                    className={`w-full flex items-center px-md py-sm rounded-lg transition-all font-body-md text-left ${activeView === 'kanban' && activeBoardId === board.id ? 'bg-surface-container-low text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined mr-md text-[20px]">
                      folder_open
                    </span>
                    <span className="flex-1 truncate pr-8">{board.title}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setBoardToDelete(board)
                    }}
                    className="absolute right-2 p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                    title="Delete Kanban"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setIsCreatingBoard(true)}
                className="w-full flex items-center px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all font-body-md text-left border border-dashed border-surface-variant hover:border-primary mt-xs"
              >
                <span className="material-symbols-outlined mr-md text-[20px]">add</span>
                Add Kanban
              </button>
            </div>
          </div>
        </nav>
        <div className="p-md border-t border-surface-variant mt-auto shrink-0 bg-surface">
          <button 
            onClick={() => setActiveView('team')} 
            className={`w-full flex items-center px-md py-sm rounded-lg transition-all font-body-md text-left ${activeView === 'team' ? 'bg-surface-container-low text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined mr-md text-[20px]">group</span>Team
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 overflow-hidden h-full bg-background">
        {/* Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-margin shrink-0">
          <div className="flex-1 max-w-[576px] flex items-center gap-sm">
            {activeView === 'task' && (
              <button 
                onClick={() => {
                  setActiveView('kanban')
                  setActiveTask(null)
                }}
                className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            )}
            <div ref={searchRef} className="relative group w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                className="w-full bg-surface-container-lowest border-none shadow-sm rounded-full py-sm pl-xl pr-md font-body-md focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="Search projects, tasks, or team..." 
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => handleSearch(e.target.value)}
              />
              
              {showSearchDropdown && (
                <>
                  <div className="absolute left-0 top-[110%] w-full bg-surface-container-lowest border border-surface-variant rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {!searchQuery.trim() ? (
                      <div className="p-sm">
                        <div className="px-3 py-2 font-label-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Recent Searches</div>
                        {recentSearches.map(term => (
                          <div 
                            key={term}
                            onClick={() => { handleSearch(term); setShowSearchDropdown(true); }}
                            className="flex items-center justify-between px-4 py-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors text-on-surface group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">history</span>
                              <span className="font-body-md text-[13px] group-hover:text-primary transition-colors">{term}</span>
                            </div>
                            <button 
                              onClick={(e) => handleRemoveRecentSearch(e, term)}
                              className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))}
                        {recentSearches.length === 0 && (
                          <div className="px-4 py-6 text-center font-body-sm text-on-surface-variant italic">No recent searches</div>
                        )}
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-sm flex flex-col gap-1">
                        <div className="px-3 py-2 font-label-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Tasks</div>
                        {searchResults.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => handleSelectSearchResult(task, searchQuery)}
                            className="flex flex-col gap-1 px-4 py-3 hover:bg-surface-container rounded-lg cursor-pointer transition-colors group"
                          >
                            <span className="font-label-bold text-[14px] text-on-surface truncate group-hover:text-primary transition-colors">
                              <HighlightMatch text={task.title} highlight={searchQuery} />
                            </span>
                            <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">folder</span>
                              <span className="truncate">
                                <HighlightMatch 
                                  text={task.board_id === 'leads' ? 'Leads' : boards.find(b => b.id === task.board_id)?.title || 'No Project (Orphaned)'} 
                                  highlight={searchQuery} 
                                />
                              </span>
                            </div>
                          </div>
                        ))}
                        {searchResults.length === 0 && (
                          <div className="px-4 py-6 text-center font-body-sm text-on-surface-variant italic">No tasks found</div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center relative"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full border-2 border-background"></span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 top-[110%] w-[320px] bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-surface-variant bg-surface flex items-center justify-between">
                      <span className="font-label-bold text-[12px] text-primary uppercase">Notifications</span>
                      {unreadCount > 0 && <span className="font-label-bold text-[10px] bg-error text-on-error px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center font-body-sm text-on-surface-variant">No notifications yet</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id}
                            onClick={() => handleReadNotification(notif)}
                            className={`flex gap-3 p-3 cursor-pointer border-b border-surface-variant hover:bg-surface-container transition-colors ${!notif.is_read ? 'bg-surface-container-low' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-full border border-surface-variant bg-surface flex items-center justify-center shrink-0 overflow-hidden">
                              {notif.profiles?.avatar_url ? (
                                <img src={notif.profiles.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-on-surface-variant text-[14px]">account_circle</span>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col">
                              <span className={`font-body-sm text-[13px] ${!notif.is_read ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                {notif.type === 'mention' ? (
                                  <><span className="font-bold">{notif.profiles?.full_name}</span> mentioned you in a comment.</>
                                ) : (
                                  <><span className="font-bold">{notif.profiles?.full_name}</span> assigned you to a task.</>
                                )}
                              </span>
                              <span className="font-body-sm text-[10px] text-on-surface-variant mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0"></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center pl-sm ml-sm border-l border-surface-variant">
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-sm text-left hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:block text-right pr-2">
                  <div className="font-body-sm text-[12px] text-on-surface font-semibold">
                    {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}
                  </div>
                </div>
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full border border-surface-variant object-cover shadow-sm" />
                ) : (
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant">account_circle</span>
                )}
              </button>
            </div>
          </div>
        </header>
        {activeView === 'kanban' ? (
          <>
            {/* Board Header */}
            <div className="flex items-center justify-between px-margin py-md shrink-0 z-10 relative">
              <div className="flex items-center gap-md">
                <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">Project: {activeBoard.title}</h1>
                <span className="px-sm py-[2px] bg-surface shadow-sm border border-surface-variant rounded-full font-label-bold text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Active</span>
              </div>
              <div className="flex items-center gap-md">
                <div 
                  className={`flex transition-all duration-300 ease-in-out cursor-pointer relative ${isAvatarsExpanded ? 'space-x-2 mr-6' : '-space-x-3 mr-4'}`}
                  onClick={() => {
                    if (!isAvatarsExpanded) setIsAvatarsExpanded(true)
                    else {
                      setIsAvatarsExpanded(false)
                      setSelectedAvatarPopup(null)
                    }
                  }}
                >
                  {activeBoardUsers.map((user, index) => (
                    <div key={user.id} className="relative">
                      <div 
                        onClick={(e) => {
                          if (isAvatarsExpanded) {
                            e.stopPropagation();
                            setSelectedAvatarPopup(selectedAvatarPopup === user.id ? null : user.id);
                          }
                        }}
                        className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center text-on-surface-variant relative hover:ring-2 hover:ring-primary transition-all"
                        style={{ zIndex: 10 - index }}
                      >
                        {user.avatar ? (
                          <img className="w-full h-full rounded-full object-cover" src={user.avatar} alt={user.name} />
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        )}
                      </div>
                      
                      {/* Popover */}
                      {selectedAvatarPopup === user.id && (
                        <div 
                          className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-surface-container-lowest border border-surface-variant shadow-xl rounded-xl p-md z-50 flex flex-col items-center animate-in fade-in zoom-in duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Arrow */}
                          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-container-lowest border-t border-l border-surface-variant rotate-45"></div>
                          
                          {user.avatar ? (
                            <img className="w-12 h-12 rounded-full object-cover mb-sm shadow-sm" src={user.avatar} alt={user.name} />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-sm shadow-sm">
                              <span className="material-symbols-outlined text-[24px]">account_circle</span>
                            </div>
                          )}
                          <div className="font-label-bold text-primary font-bold text-center mb-xs truncate w-full">{user.name}</div>
                          <div className="font-body-sm text-[11px] text-on-surface-variant text-center truncate w-full">{user.email}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Filter Button */}
                <div className="relative flex items-center">
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`flex items-center gap-xs px-md py-sm rounded-full shadow-sm border transition-colors font-label-bold text-[11px] uppercase tracking-wider ${
                      (filters.assignee || filters.priority || filters.tags?.length > 0) 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'bg-surface border-surface-variant text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter {(filters.assignee || filters.priority || filters.tags?.length > 0) && '*'}
                  </button>

                  {showFilterDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                      <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 p-sm flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150 cursor-default">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-label-bold text-[12px] text-primary uppercase">Filters</span>
                          {(filters.assignee || filters.priority || filters.tags?.length > 0) && (
                            <button onClick={() => setFilters({ assignee: null, priority: null, tags: [] })} className="text-[10px] font-label-bold text-on-surface-variant hover:text-error uppercase transition-colors">Clear All</button>
                          )}
                        </div>
                        
                        {/* Assignee Filter */}
                        <div className="flex flex-col gap-1">
                          <span className="font-label-bold text-[10px] text-on-surface-variant uppercase">Assignee</span>
                          <select 
                            className="bg-surface border border-surface-variant rounded-lg p-1.5 font-body-sm text-[12px] text-primary outline-none focus:border-primary"
                            value={filters.assignee || ''}
                            onChange={e => setFilters({...filters, assignee: e.target.value || null})}
                          >
                            <option value="">Any Assignee</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                          </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex flex-col gap-1">
                          <span className="font-label-bold text-[10px] text-on-surface-variant uppercase">Priority</span>
                          <div className="flex gap-1">
                            {['Low', 'Medium', 'High'].map(p => (
                              <button 
                                key={p}
                                onClick={() => setFilters({...filters, priority: filters.priority === p ? null : p})}
                                className={`flex-1 py-1 rounded-md border font-label-bold text-[10px] uppercase transition-colors ${filters.priority === p ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-variant text-on-surface-variant hover:border-primary'}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tag Filter */}
                        <div className="flex flex-col gap-1">
                          <span className="font-label-bold text-[10px] text-on-surface-variant uppercase">Tag</span>
                          <div className="flex flex-col bg-surface border border-surface-variant rounded-lg overflow-hidden">
                            <div className="flex items-center px-2 py-1.5 border-b border-surface-variant bg-surface">
                              <span className="material-symbols-outlined text-[14px] text-on-surface-variant mr-1">search</span>
                              <input 
                                type="text"
                                placeholder="Search tags..."
                                className="w-full bg-transparent font-body-sm text-[12px] text-primary outline-none"
                                value={filterTagSearch}
                                onChange={e => setFilterTagSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-[140px] overflow-y-auto custom-scrollbar flex flex-col p-1">
                              {allTags
                                .filter(t => t.name.toLowerCase().includes(filterTagSearch.toLowerCase()))
                                .map(t => {
                                  const isSelected = filters.tags?.includes(t.name)
                                  return (
                                    <button
                                      key={t.name}
                                      onClick={() => {
                                        const newTags = isSelected
                                          ? filters.tags.filter(tag => tag !== t.name)
                                          : [...(filters.tags || []), t.name]
                                        setFilters({...filters, tags: newTags})
                                      }}
                                      className={`flex justify-between items-center px-2 py-1.5 rounded-md font-body-sm text-[12px] transition-colors ${isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-all ${isSelected ? 'bg-primary border-primary' : 'border-surface-variant bg-surface'}`}>
                                          {isSelected && <span className="material-symbols-outlined text-[10px] text-on-primary font-bold" style={{fontVariationSettings: "'FILL' 1, 'wght' 700"}}>check</span>}
                                        </div>
                                        <span>{t.name}</span>
                                      </div>
                                      {t.color && (
                                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: t.color }}></span>
                                      )}
                                    </button>
                                  )
                                })}
                            </div>
                          </div>
                        </div>

                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => openCreateModal(activeBoard.columns[0])} className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-full shadow-sm hover:bg-primary/90 transition-colors font-label-bold text-label-bold uppercase">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {activeBoardId === 'leads' ? 'Add Project' : 'New Task'}
                </button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant">Loading tasks...</div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex h-full px-margin py-md gap-lg min-w-max">
                    {columns.map(col => (
                      <div key={col.id} className="flex flex-col w-[340px] shrink-0 h-full relative group border border-surface-variant/60 rounded-[24px] p-md bg-surface-container-lowest/30">
                        {/* Column Header */}
                        <div className="flex flex-col mb-md shrink-0">
                          <div className="flex items-center justify-between pb-sm relative">
                            <div className="flex items-center gap-sm">
                              <h2 className={`font-headline-sm text-[16px] font-bold ${col.id === 'Completed' ? 'text-on-surface-variant' : 'text-primary'}`}>{col.title}</h2>
                              <span className="w-6 h-6 rounded-full bg-surface border border-surface-variant shadow-sm flex items-center justify-center font-mono-label text-[11px] font-bold text-on-surface-variant">
                                {col.count}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Cards Container */}
                        <Droppable droppableId={col.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="flex-1 overflow-y-auto pt-2 pb-sm pr-2 custom-scrollbar"
                            >
                              {col.tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => {
                                        setActiveTask(task)
                                        setActiveView('task')
                                      }}
                                      className={`bg-surface-container-lowest rounded-2xl p-md mb-md border border-surface-variant shadow-sm transition-all duration-500 cursor-pointer group/card ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-primary bg-surface-container-lowest !z-50' : 'hover:-translate-y-1 hover:border-primary'} ${highlightedTaskId === task.id ? 'border-primary bg-primary/10 shadow-lg translate-x-2' : ''}`}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <div className="flex justify-between items-start mb-sm">
                                        <div className="flex items-center gap-xs">
                                          <span className="px-2 py-0.5 bg-surface-container-low rounded-full font-mono-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border border-surface-variant">
                                            {activeBoardId === 'leads' ? 'LD-' : 'AL-'}{task.id.toString().slice(0, 3)}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full font-label-bold text-[10px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'bg-error-container text-on-error-container border border-error/20' : 'bg-surface-container-low text-on-surface-variant border border-surface-variant'}`}>
                                            {task.priority || 'Medium'}
                                          </span>
                                        </div>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setTaskToDelete(task)
                                          }}
                                          className="text-on-surface-variant hover:text-error opacity-0 group-hover/card:opacity-100 transition-opacity"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                      </div>
                                      <h3 className="font-body-lg text-[15px] text-primary font-semibold mb-xs leading-snug group-hover/card:underline decoration-1 underline-offset-2">
                                        {task.title}
                                      </h3>
                                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-md">
                                        {task.description}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-xs text-on-surface-variant">
                                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                          <span className="font-mono-label text-[11px]">
                                            {task.due_date ? formatDate(task.due_date) : 'No Date'}
                                          </span>
                                        </div>
                                        {(() => {
                                          const assignee = profiles.find(p => p.id === task.assignee_id)
                                          if (assignee?.avatar_url) {
                                            return <img className="w-6 h-6 rounded-full border border-surface-variant object-cover shadow-sm bg-surface-container" src={assignee.avatar_url} alt="Assignee" />
                                          }
                                          if (assignee?.full_name) {
                                            return <div className="w-6 h-6 rounded-full border border-surface-variant bg-surface flex items-center justify-center font-label-bold text-[9px] uppercase shadow-sm text-primary">{assignee.full_name.slice(0, 2)}</div>
                                          }
                                          return <div className="w-6 h-6 rounded-full border border-surface-variant bg-surface flex items-center justify-center text-on-surface-variant shadow-sm"><span className="material-symbols-outlined text-[16px]">account_circle</span></div>
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                        
                        {/* Bottom Add Task Button */}
                        <button 
                          onClick={() => openCreateModal(col.id)} 
                          className="w-full flex items-center justify-center gap-xs py-sm mt-sm border-2 border-dashed border-surface-variant text-on-surface-variant rounded-full hover:text-primary hover:border-primary transition-all hover:bg-surface-container-lowest font-label-bold text-label-bold uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          {activeBoardId === 'leads' ? 'Add Project' : 'New Task'}
                        </button>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              )}
            </div>
          </>
        ) : activeView === 'task' && activeTask ? (
          <TaskDetail 
            task={activeTask} 
            session={session}
            activeBoard={activeBoard}
            onUpdate={(updated) => {
              setTasks(tasks.map(t => t.id === updated.id ? updated : t))
              setActiveTask(updated)
            }}
            onDeleteTask={() => setTaskToDelete(activeTask)}
          />
        ) : (
          <Team />
        )}
      </div>

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant p-lg shadow-2xl w-[90%] max-w-[450px]">
            <h2 className="font-headline-md text-headline-md text-primary mb-md">
              {activeBoardId === 'leads' ? 'Add New Project' : 'New Task'} in {newTaskCol}
            </h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-md">
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant uppercase mb-xs">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTaskData.title}
                    onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                    className="w-full border border-surface-variant p-sm font-body-md focus:border-primary outline-none"
                    placeholder="Task title..."
                  />
                </div>
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant uppercase mb-xs">Description</label>
                  <textarea 
                    value={newTaskData.description}
                    onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                    className="w-full border border-surface-variant p-sm font-body-md focus:border-primary outline-none min-h-[100px] resize-none"
                    placeholder="Add details..."
                  />
                </div>
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant uppercase mb-xs">Priority</label>
                  <select 
                    value={newTaskData.priority}
                    onChange={e => setNewTaskData({...newTaskData, priority: e.target.value})}
                    className="w-full border border-surface-variant p-sm font-body-md focus:border-primary outline-none bg-surface-container-lowest"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg pt-md border-t border-surface-variant">
                <button type="button" onClick={() => setIsCreating(false)} className="px-md py-sm bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-md py-sm bg-primary text-on-primary font-label-bold text-label-bold uppercase hover:bg-inverse-surface transition-colors">
                  {activeBoardId === 'leads' ? 'Add Project' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant p-lg shadow-2xl w-[90%] max-w-[450px]">
            <h2 className="font-headline-md text-headline-md text-primary mb-md">Add New Kanban</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="space-y-md">
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant uppercase mb-xs">Kanban Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newBoardTitle}
                    onChange={e => setNewBoardTitle(e.target.value)}
                    className="w-full border border-surface-variant p-sm font-body-md focus:border-primary outline-none"
                    placeholder="e.g. Website Redesign"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg pt-md border-t border-surface-variant">
                <button type="button" onClick={() => setIsCreatingBoard(false)} className="px-md py-sm bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-md py-sm bg-primary text-on-primary font-label-bold text-label-bold uppercase hover:bg-inverse-surface transition-colors">
                  Create Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Board Confirmation Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-error/50 p-lg shadow-2xl w-[90%] max-w-[450px]">
            <div className="flex items-center gap-sm mb-md text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h2 className="font-headline-md text-headline-md">Delete {boardToDelete.title}?</h2>
            </div>
            <p className="text-on-surface-variant mb-lg font-body-md">
              Are you absolutely sure you want to delete this kanban? All tasks inside will be hidden. This action requires double confirmation.
            </p>
            <div className="flex justify-end gap-md pt-md border-t border-surface-variant">
              <button type="button" onClick={() => setBoardToDelete(null)} className="px-md py-sm bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleDeleteBoard} 
                className="px-md py-sm bg-error text-on-error font-label-bold text-label-bold uppercase hover:bg-error-container hover:text-on-error-container transition-colors"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-error/50 p-lg shadow-2xl w-[90%] max-w-[450px]">
            <div className="flex items-center gap-sm mb-md text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h2 className="font-headline-md text-headline-md">Delete Task?</h2>
            </div>
            <p className="text-on-surface-variant mb-lg font-body-md">
              Are you sure you want to delete "{taskToDelete.title}"? 
              {taskToDelete.board_id === 'leads' && taskToDelete.linked_board_id && (
                <span className="block mt-2 font-bold">WARNING: This is a linked project! Deleting it will also delete its dedicated Kanban board and all tasks inside it.</span>
              )}
            </p>
            <div className="flex justify-end gap-md pt-md border-t border-surface-variant">
              <button type="button" onClick={() => setTaskToDelete(null)} className="px-md py-sm bg-surface border border-surface-variant text-primary font-label-bold text-label-bold uppercase hover:bg-surface-container-low transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleDeleteTask} 
                className="px-md py-sm bg-error text-on-error font-label-bold text-label-bold uppercase hover:bg-error-container hover:text-on-error-container transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal 
          session={session} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </div>
  )
}
