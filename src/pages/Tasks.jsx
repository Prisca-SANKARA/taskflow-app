import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import TaskRow, { PRIORITY, CATEGORIES, CAT_COLORS } from '../components/TaskRow'

export default function Tasks({ user }) {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [sortBy, setSortBy]     = useState('date')
  const [needInput, setNeedInput] = useState('')
  const [newTask, setNewTask]   = useState({
    title:'', description:'', priority:'medium',
    category:'general', start_date:'', end_date:'', needs:[]
  })

  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at', { ascending:false })
      .then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setAdding(true)
    const { data } = await supabase.from('tasks').insert({
      ...newTask,
      user_id:    user.id,
      start_date: newTask.start_date || null,
      end_date:   newTask.end_date   || null,
    }).select().single()
    setTasks([data, ...tasks])
    setNewTask({ title:'', description:'', priority:'medium', category:'general', start_date:'', end_date:'', needs:[] })
    setNeedInput('')
    setShowForm(false)
    setAdding(false)
  }

  async function toggleTask(task) {
    await supabase.from('tasks').update({ completed:!task.completed }).eq('id', task.id)
    setTasks(tasks.map(t => t.id===task.id ? {...t, completed:!t.completed} : t))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id!==id))
  }

  async function updateTask(id, fields) {
    await supabase.from('tasks').update(fields).eq('id', id)
    setTasks(tasks.map(t => t.id===id ? {...t, ...fields} : t))
  }

  function addNeed() {
    if (!needInput.trim()) return
    setNewTask({ ...newTask, needs:[...newTask.needs, needInput.trim()] })
    setNeedInput('')
  }

  function removeNeed(i) {
    setNewTask({ ...newTask, needs: newTask.needs.filter((_,idx) => idx!==i) })
  }

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending   = total - completed
  const overdue   = tasks.filter(t => !t.completed && t.end_date && new Date(t.end_date) < new Date()).length

  let filtered = tasks.filter(t => {
    if (filter==='active')    return !t.completed
    if (filter==='completed') return t.completed
    if (filter==='overdue')   return !t.completed && t.end_date && new Date(t.end_date) < new Date()
    return true
  })
  if (search) filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.needs?.some(n => n.toLowerCase().includes(search.toLowerCase()))
  )
  filtered = [...filtered].sort((a,b) => {
    if (sortBy==='priority') { const o={high:0,medium:1,low:2}; return o[a.priority]-o[b.priority] }
    if (sortBy==='end')      return (a.end_date||'9999')>(b.end_date||'9999')?1:-1
    if (sortBy==='start')    return (a.start_date||'9999')>(b.start_date||'9999')?1:-1
    return new Date(b.created_at)-new Date(a.created_at)
  })

  return (
    <div className="w-full px-10 py-10">

      {/* Titre page */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-6xl font-black text-gray-800">Mes tâches</h1>
          <p className="text-gray-400 text-xl mt-1">{total} tâches · {pending} en cours · {overdue} en retard</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-2xl text-base font-black text-white transition-all active:scale-95 flex items-center gap-2"
          style={{ background:showForm?'#f8faff':'linear-gradient(135deg,#8b5cf6,#ec4899)', color:showForm?'#8b5cf6':'white', border:showForm?'2px dashed #c4b5fd':'none', boxShadow:showForm?'none':'0 4px 20px rgba(139,92,246,0.4)' }}>
          {showForm ? '✕ Annuler' : '+ Nouvelle tâche'}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white/90 rounded-2xl p-7 mb-8 shadow-sm border border-white">
          <h3 className="text-lg font-black text-gray-700 mb-5">✨ Créer une tâche</h3>
          <form onSubmit={addTask} className="space-y-4">

            <input type="text" value={newTask.title}
              onChange={e => setNewTask({...newTask, title:e.target.value})}
              placeholder="Titre de la tâche *" required autoFocus
              className="w-full rounded-xl px-4 py-3.5 text-gray-700 text-base font-bold focus:outline-none"
              style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }}
            />

            <textarea value={newTask.description}
              onChange={e => setNewTask({...newTask, description:e.target.value})}
              placeholder="Description (optionnelle)..." rows={3}
              className="w-full rounded-xl px-4 py-3 text-gray-500 text-sm focus:outline-none resize-none"
              style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }}
            />

            {/* Priorité + catégorie */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2">
                {Object.entries(PRIORITY).map(([key,{label,dot}]) => (
                  <button key={key} type="button" onClick={() => setNewTask({...newTask, priority:key})}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background:newTask.priority===key?'#8b5cf6':'#f8faff', color:newTask.priority===key?'white':'#6b7280', border:newTask.priority===key?'1.5px solid #8b5cf6':'1.5px solid #e8e0ff' }}>
                    <div className={`w-2 h-2 rounded-full ${dot}`}/>{label}
                  </button>
                ))}
              </div>
              <select value={newTask.category}
                onChange={e => setNewTask({...newTask, category:e.target.value})}
                className="rounded-xl px-4 py-2 text-sm font-bold focus:outline-none capitalize"
                style={{ background:'#f8faff', border:'1.5px solid #e8e0ff', color:'#6b7280' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">🟢 Date de début</label>
                <input type="datetime-local" value={newTask.start_date}
                  onChange={e => setNewTask({...newTask, start_date:e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                  style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', color:'#374151' }}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">🔴 Date de fin</label>
                <input type="datetime-local" value={newTask.end_date}
                  onChange={e => setNewTask({...newTask, end_date:e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                  style={{ background:'#fef2f2', border:'1.5px solid #fecaca', color:'#374151' }}
                />
              </div>
            </div>

            {/* Besoins */}
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">📋 Besoins</label>
              <div className="flex gap-2 mb-2">
                <input value={needInput}
                  onChange={e => setNeedInput(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); addNeed()} }}
                  placeholder="Ex: Accès GitHub, Figma, réunion équipe..."
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ background:'#f8faff', border:'1.5px solid #e8e0ff', color:'#374151' }}
                />
                <button type="button" onClick={addNeed}
                  className="px-5 py-2 rounded-xl text-sm font-black text-white"
                  style={{ background:'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                  +
                </button>
              </div>
              {newTask.needs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTask.needs.map((n,i) => (
                    <span key={i} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-semibold"
                      style={{ background:'#ede9fe', color:'#5b21b6' }}>
                      {n}
                      <button type="button" onClick={() => removeNeed(i)}
                        className="font-black hover:text-purple-900">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={adding || !newTask.title.trim()}
              className="w-full py-3.5 rounded-xl text-white text-base font-black transition-all active:scale-95 disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', boxShadow:'0 4px 20px rgba(139,92,246,0.4)' }}>
              {adding ? '⏳ Création...' : '+ Créer la tâche'}
            </button>
          </form>
        </div>
      )}

      {/* Barre recherche + tri */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans les tâches..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
            style={{ background:'rgba(255,255,255,0.8)', border:'1px solid rgba(139,92,246,0.2)', color:'#374151' }}
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none"
          style={{ background:'rgba(255,255,255,0.8)', border:'1px solid rgba(139,92,246,0.2)', color:'#6b7280' }}>
          <option value="date">Trier : Date création</option>
          <option value="priority">Trier : Priorité</option>
          <option value="end">Trier : Date fin</option>
          <option value="start">Trier : Date début</option>
        </select>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key:'all',       label:`Toutes (${total})` },
          { key:'active',    label:`En cours (${pending})` },
          { key:'completed', label:`Terminées (${completed})` },
          { key:'overdue',   label:`En retard (${overdue})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-5 py-2.5 rounded-xl text-sm font-black transition-all"
            style={{ background:filter===key?'linear-gradient(135deg,#8b5cf6,#6366f1)':'rgba(255,255,255,0.8)', color:filter===key?'white':'#6b7280', border:filter===key?'none':'1px solid rgba(139,92,246,0.2)', boxShadow:filter===key?'0 4px 15px rgba(139,92,246,0.3)':'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor:'#8b5cf6', borderTopColor:'transparent' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/60 rounded-2xl border border-white">
          <p className="text-6xl mb-4">{search?'🔍':'🎯'}</p>
          <p className="text-xl font-black text-gray-600">{search?'Aucun résultat':'Aucune tâche ici'}</p>
          <p className="text-gray-400 mt-2">
            {search ? `Rien pour "${search}"` : 'Clique sur "+ Nouvelle tâche" pour commencer'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskRow key={task.id} task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          ))}
        </div>
      )}

    </div>
  )
}