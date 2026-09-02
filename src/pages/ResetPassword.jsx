import { useState } from 'react'
import { supabase } from '../supabase'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 6) return setError('Minimum 6 caractères.')
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setError(error.message)
    setSuccess('Mot de passe mis à jour !')
    setTimeout(onDone, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf0ff,#fff0f9)' }}>
      <form onSubmit={handleSubmit} className="bg-white/80 rounded-3xl p-8 shadow-xl w-full max-w-md space-y-4"
        style={{ backdropFilter: 'blur(20px)' }}>
        <h2 className="text-2xl font-black text-gray-800">Nouveau mot de passe 🔑</h2>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe" required
          className="w-full rounded-xl px-4 py-3 text-sm" style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Confirmer le mot de passe" required
          className="w-full rounded-xl px-4 py-3 text-sm" style={{ background:'#f8faff', border:'1.5px solid #e8e0ff' }} />
        {error   && <p className="text-sm font-semibold" style={{ color:'#dc2626' }}>⚠️ {error}</p>}
        {success && <p className="text-sm font-semibold" style={{ color:'#16a34a' }}>✅ {success}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-50"
          style={{ background:'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
          {loading ? 'Mise à jour...' : 'Valider'}
        </button>
      </form>
    </div>
  )
}