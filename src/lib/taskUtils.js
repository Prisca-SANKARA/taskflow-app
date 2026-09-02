export const PRIORITY = {
  high:   { label:'Haute',   bg:'bg-rose-100 text-rose-600 border-rose-200',          dot:'bg-rose-500'    },
  medium: { label:'Moyenne', bg:'bg-amber-100 text-amber-600 border-amber-200',        dot:'bg-amber-500'   },
  low:    { label:'Basse',   bg:'bg-emerald-100 text-emerald-600 border-emerald-200',  dot:'bg-emerald-500' },
}
export const CATEGORIES = ['general','travail','personnel','études','santé']
export const CAT_COLORS  = { general:'#8b5cf6', travail:'#3b82f6', personnel:'#ec4899', études:'#f59e0b', santé:'#10b981' }

export function formatDate(dt) {
  if (!dt) return null
  return new Date(dt).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export function getStatus(end_date) {
  const now = new Date()
  if (end_date) {
    const end = new Date(end_date)
    const diff = Math.ceil((end - now) / (1000*60*60*24))
    if (diff < 0)   return { label:`${Math.abs(diff)}j de retard`, color:'#ef4444', bg:'#fef2f2', border:'#fecaca' }
    if (diff === 0) return { label:"Aujourd'hui",                  color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' }
    if (diff <= 3)  return { label:`Dans ${diff}j`,                color:'#f97316', bg:'#fff7ed', border:'#fed7aa' }
    return                  { label:`Dans ${diff}j`,                color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0' }
  }
  return null
}