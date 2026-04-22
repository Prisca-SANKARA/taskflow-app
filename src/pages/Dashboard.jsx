import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CAT_COLORS, CATEGORIES, getStatus } from '../components/TaskRow'

export default function Dashboard({ user }) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'toi'

  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTasks(data || []); setLoading(false) })
  }, [])

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending   = total - completed
  const rate      = total ? Math.round((completed / total) * 100) : 0
  const overdue   = tasks.filter(t => {
    if (!t.end_date || t.completed) return false
    return new Date(t.end_date) < new Date()
  }).length

  const donutData = CATEGORIES
    .map(cat => ({ name: cat, value: tasks.filter(t => t.category === cat).length }))
    .filter(d => d.value > 0)

  const days    = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const barData = days.map((day, i) => ({
    day,
    créées:    tasks.filter(t => new Date(t.created_at).getDay() === i).length,
    terminées: tasks.filter(t => t.completed && new Date(t.created_at).getDay() === i).length,
  }))

  const urgent = tasks
    .filter(t => !t.completed && t.end_date)
    .sort((a,b) => new Date(a.end_date) - new Date(b.end_date))
    .slice(0, 4)

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor:'#8b5cf6', borderTopColor:'transparent' }}/>
    </div>
  )

  return (
    <div className="w-full px-10 py-10">

      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-6xl font-black text-gray-800 mb-2">
          Bonjour, <span style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {firstName}
          </span> 👋
        </h1>
        <p className="text-gray-500 text-xl">
          {pending === 0 && total > 0
            ? '🎉 Bravo ! Toutes tes tâches sont complétées.'
            : total === 0
            ? 'Commence par créer ta première tâche.'
            : <>Tu as <strong className="text-gray-700">{pending}</strong> tâche{pending > 1?'s':''} en cours.</>
          }
          {overdue > 0 && (
            <span className="ml-3 text-sm font-black px-3 py-1 rounded-xl"
              style={{ background:'#fef2f2', color:'#ef4444' }}>
              ⚠️ {overdue} en retard
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label:'Total',      value:total,     from:'#6366f1', to:'#8b5cf6', icon:'📋' },
          { label:'Complétées', value:completed, from:'#10b981', to:'#059669', icon:'✅' },
          { label:'En cours',   value:pending,   from:'#f59e0b', to:'#f97316', icon:'⏳' },
          { label:'En retard',  value:overdue,   from:'#ef4444', to:'#dc2626', icon:'🚨' },
        ].map(({ label, value, from, to, icon }) => (
          <div key={label} className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background:`linear-gradient(135deg,${from},${to})`, boxShadow:`0 8px 32px ${from}40` }}>
            <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-20" style={{ background:'white' }}/>
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">{label}</p>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-black text-white">{value}</p>
              <span className="text-4xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Donut */}
        <div className="bg-white/80 rounded-2xl p-7 shadow-sm border border-white">
          <h3 className="text-lg font-black text-gray-700 mb-1">Par catégorie</h3>
          <p className="text-gray-400 text-sm mb-5">Répartition de tes {total} tâches</p>
          {total === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-300 text-sm">Aucune tâche</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
                    {donutData.map(entry => <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#8b5cf6'}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:'12px', fontSize:'13px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 flex-1">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background:CAT_COLORS[d.name] }}/>
                      <span className="text-gray-500 text-sm capitalize font-medium">{d.name}</span>
                    </div>
                    <span className="font-black text-gray-700 text-sm">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Barres — créées vs terminées */}
        <div className="bg-white/80 rounded-2xl p-7 shadow-sm border border-white">
          <h3 className="text-lg font-black text-gray-700 mb-1">Activité de la semaine</h3>
          <p className="text-gray-400 text-sm mb-5">Tâches créées vs terminées par jour</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="day" tick={{ fill:'#94a3b8', fontSize:12, fontWeight:600 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#94a3b8', fontSize:12 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{ borderRadius:'12px', fontSize:'13px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill:'#8b5cf610' }}/>
              <Bar dataKey="créées"    fill="#8b5cf6" radius={[6,6,0,0]} opacity={0.9}/>
              <Bar dataKey="terminées" fill="#10b981" radius={[6,6,0,0]} opacity={0.9}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background:'#8b5cf6' }}/><span className="text-xs text-gray-400 font-medium">Créées</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background:'#10b981' }}/><span className="text-xs text-gray-400 font-medium">Terminées</span></div>
          </div>
        </div>

      </div>

      {/* Progression */}
      <div className="bg-white/80 rounded-2xl p-7 mb-10 shadow-sm border border-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-gray-700">Progression globale</h3>
            <p className="text-gray-400 text-sm">{completed} sur {total} tâches complétées</p>
          </div>
          <span className="text-4xl font-black" style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {rate}%
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full transition-all duration-700"
            style={{ width:`${rate}%`, background:'linear-gradient(90deg,#8b5cf6,#6366f1,#ec4899)' }}/>
        </div>
      </div>

      {/* Tâches urgentes */}
      {urgent.length > 0 && (
        <div className="bg-white/80 rounded-2xl p-7 shadow-sm border border-white">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-gray-700">⚡ Tâches urgentes</h3>
              <p className="text-gray-400 text-sm">Celles qui arrivent à échéance</p>
            </div>
            <Link to="/tasks"
              className="text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={{ background:'rgba(139,92,246,0.1)', color:'#8b5cf6' }}>
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {urgent.map(task => {
              const status = getStatus(task.start_date, task.end_date)
              return (
                <div key={task.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background:'#f8faff', border:'1px solid #e8e0ff' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: status?.color || '#8b5cf6' }}/>
                    <span className="text-sm font-bold text-gray-700">{task.title}</span>
                  </div>
                  {status && (
                    <span className="text-xs font-black px-3 py-1 rounded-lg border flex-shrink-0"
                      style={{ background:status.bg, color:status.color, borderColor:status.border }}>
                      {status.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}