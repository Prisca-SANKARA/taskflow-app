import { useState, useRef, useEffect } from 'react'

const PRIORITY = {
  high:   { label:'Haute',   bg:'bg-rose-100 text-rose-600 border-rose-200',          dot:'bg-rose-500'    },
  medium: { label:'Moyenne', bg:'bg-amber-100 text-amber-600 border-amber-200',        dot:'bg-amber-500'   },
  low:    { label:'Basse',   bg:'bg-emerald-100 text-emerald-600 border-emerald-200',  dot:'bg-emerald-500' },
}
const CATEGORIES = ['general','travail','personnel','études','santé']
const CAT_COLORS  = { general:'#8b5cf6', travail:'#3b82f6', personnel:'#ec4899', études:'#f59e0b', santé:'#10b981' }

function formatDate(dt) {
  if (!dt) return null
  return new Date(dt).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function getStatus(start_date, end_date) {
  const now = new Date()
  if (end_date) {
    const end = new Date(end_date)
    const diff = Math.ceil((end - now) / (1000*60*60*24))
    if (diff < 0)  return { label:`${Math.abs(diff)}j de retard`, color:'#ef4444', bg:'#fef2f2', border:'#fecaca' }
    if (diff === 0) return { label:"Aujourd'hui",                  color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' }
    if (diff <= 3)  return { label:`Dans ${diff}j`,               color:'#f97316', bg:'#fff7ed', border:'#fed7aa' }
    return              { label:`Dans ${diff}j`,                   color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' }
  }
  return null
}

export { PRIORITY, CATEGORIES, CAT_COLORS, getStatus, formatDate }

export default function TaskRow({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing]   = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [needInput, setNeedInput] = useState('')
  const [editForm, setEditForm] = useState({
    title:       task.title,
    description: task.description || '',
    priority:    task.priority,
    category:    task.category,
    start_date:  task.start_date ? task.start_date.slice(0,16) : '',
    end_date:    task.end_date   ? task.end_date.slice(0,16)   : '',
    needs:       task.needs || [],
  })
  const inputRef  = useRef()
  const dueStatus = getStatus(task.start_date, task.end_date)

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus() }, [editing])

  async function saveEdit() {
    if (!editForm.title.trim()) return
    const payload = {
      ...editForm,
      start_date: editForm.start_date || null,
      end_date:   editForm.end_date   || null,
    }
    await onUpdate(task.id, payload)
    setEditing(false)
  }

  function addNeed() {
    if (!needInput.trim()) return
    setEditForm({ ...editForm, needs: [...editForm.needs, needInput.trim()] })
    setNeedInput('')
  }

  function removeNeed(i) {
    setEditForm({ ...editForm, needs: editForm.needs.filter((_, idx) => idx !== i) })
  }

  // ── Mode édition ──────────────────────────────────────────────
  if (editing) return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border-2" style={{ borderColor:'#8b5cf6' }}>

      <input ref={inputRef} value={editForm.title}
        onChange={e => setEditForm({...editForm, title: e.target.value})}
        onKeyDown={e => e.key==='Enter' && saveEdit()}
        placeholder="Titre *"
        className="w-full text-base font-bold text-gray-700 focus:outline-none mb-3 px-4 py-2.5 rounded-xl"
        style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }}
      />

      <textarea value={editForm.description}
        onChange={e => setEditForm({...editForm, description: e.target.value})}
        placeholder="Description..." rows={2}
        className="w-full text-sm text-gray-500 focus:outline-none mb-3 px-4 py-2.5 rounded-xl resize-none"
        style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }}
      />

      {/* Priorité + catégorie */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(PRIORITY).map(([key,{label,dot}]) => (
          <button key={key} type="button" onClick={() => setEditForm({...editForm, priority:key})}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ background:editForm.priority===key?'#8b5cf6':'#f8faff', color:editForm.priority===key?'white':'#6b7280', border:editForm.priority===key?'1.5px solid #8b5cf6':'1.5px solid #e8e0ff' }}>
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`}/>{label}
          </button>
        ))}
        <select value={editForm.category} onChange={e => setEditForm({...editForm, category:e.target.value})}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none capitalize"
          style={{ background:'#f8faff', border:'1.5px solid #e8e0ff', color:'#6b7280' }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">🟢 Début</label>
          <input type="datetime-local" value={editForm.start_date}
            onChange={e => setEditForm({...editForm, start_date:e.target.value})}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', color:'#374151' }}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">🔴 Fin</label>
          <input type="datetime-local" value={editForm.end_date}
            onChange={e => setEditForm({...editForm, end_date:e.target.value})}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ background:'#fef2f2', border:'1.5px solid #fecaca', color:'#374151' }}
          />
        </div>
      </div>

      {/* Besoins */}
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">📋 Besoins</label>
        <div className="flex gap-2 mb-2">
          <input value={needInput} onChange={e => setNeedInput(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); addNeed()} }}
            placeholder="Ajouter un besoin..."
            className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ background:'#f8faff', border:'1.5px solid #e8e0ff', color:'#374151' }}
          />
          <button type="button" onClick={addNeed}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background:'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
            +
          </button>
        </div>
        {editForm.needs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {editForm.needs.map((n,i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-medium"
                style={{ background:'#ede9fe', color:'#5b21b6' }}>
                {n}
                <button onClick={() => removeNeed(i)} className="text-purple-400 hover:text-purple-700 font-bold">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={saveEdit}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-black transition-all active:scale-95"
          style={{ background:'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow:'0 4px 12px rgba(139,92,246,0.35)' }}>
          Sauvegarder
        </button>
        <button onClick={() => setEditing(false)}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background:'#f8faff', color:'#6b7280', border:'1.5px solid #e8e0ff' }}>
          Annuler
        </button>
      </div>
    </div>
  )

  // ── Mode affichage ────────────────────────────────────────────
  return (
    <div className="group bg-white/80 rounded-2xl border border-white hover:border-violet-100 hover:shadow-md transition-all"
      style={{ opacity: task.completed ? 0.6 : 1 }}>
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Checkbox */}
        <button onClick={() => onToggle(task)}
          className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-1"
          style={{ background:task.completed?'linear-gradient(135deg,#8b5cf6,#ec4899)':'transparent', borderColor:task.completed?'#8b5cf6':'#d1d5db' }}>
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className={`text-lg font-bold ${task.completed?'line-through text-gray-400':'text-gray-700'}`}>
            {task.title}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-bold ${PRIORITY[task.priority]?.bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY[task.priority]?.dot}`}/>
              {PRIORITY[task.priority]?.label}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold capitalize"
              style={{ background:CAT_COLORS[task.category]+'18', color:CAT_COLORS[task.category] }}>
              {task.category}
            </span>
            {dueStatus && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold border"
                style={{ background:dueStatus.bg, color:dueStatus.color, borderColor:dueStatus.border }}>
                ⏰ {dueStatus.label}
              </span>
            )}
            {(task.description || task.needs?.length > 0) && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs px-2.5 py-1 rounded-lg font-bold transition-all"
                style={{ background:'#f0e8ff', color:'#8b5cf6' }}>
                {expanded ? '▲ Moins' : '▼ Détails'}
              </button>
            )}
          </div>

          {/* Dates */}
          {(task.start_date || task.end_date) && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {task.start_date && (
                <span className="text-xs flex items-center gap-1 font-medium" style={{ color:'#10b981' }}>
                  🟢 {formatDate(task.start_date)}
                </span>
              )}
              {task.end_date && (
                <span className="text-xs flex items-center gap-1 font-medium" style={{ color:'#ef4444' }}>
                  🔴 {formatDate(task.end_date)}
                </span>
              )}
            </div>
          )}

          {/* Détails dépliables */}
          {expanded && (
            <div className="mt-3 space-y-2">
              {task.description && (
                <p className="text-sm text-gray-500 leading-relaxed px-4 py-3 rounded-xl"
                  style={{ background:'#f8faff', border:'1px solid #e8e0ff' }}>
                  {task.description}
                </p>
              )}
              {task.needs?.length > 0 && (
                <div className="px-4 py-3 rounded-xl" style={{ background:'#faf5ff', border:'1px solid #e9d5ff' }}>
                  <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-2">Besoins</p>
                  <div className="flex flex-wrap gap-2">
                    {task.needs.map((n,i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-lg font-semibold"
                        style={{ background:'#ede9fe', color:'#5b21b6' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
          <button onClick={() => setEditing(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background:'rgba(139,92,246,0.1)', color:'#8b5cf6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background:'rgba(239,68,68,0.08)', color:'#ef4444' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}