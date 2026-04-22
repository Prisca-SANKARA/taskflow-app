import { useState } from 'react'
import { supabase } from '../supabase'

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

function InputField({ label, type, value, onChange, placeholder, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none transition-all placeholder-gray-300"
          style={{ background: '#f8faff', border: '1.5px solid #e8e0ff' }}
          onFocus={e => e.target.style.border = '1.5px solid #8b5cf6'}
          onBlur={e => e.target.style.border = '1.5px solid #e8e0ff'}
        />
        {children}
      </div>
    </div>
  )
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')

  const set   = field => e => setForm({ ...form, [field]: e.target.value })
  const reset = () => { setError(''); setSuccess('') }
  const switchMode = m => { setMode(m); reset(); setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }) }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true); reset()
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); setLoading(false); return }
    if (form.password.length < 6) { setError('Minimum 6 caractères.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName } }
    })
    if (error) setError(error.message)
    else setSuccess('Compte créé ! Vérifie ta boîte mail pour confirmer.')
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin })
    if (error) setError(error.message)
    else setSuccess('Lien envoyé ! Vérifie ta boîte mail.')
    setLoading(false)
  }

  const strengthScore = pwd => {
    let s = 0
    if (pwd.length >= 6)  s++
    if (pwd.length >= 10) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9!@#$%]/.test(pwd)) s++
    return s
  }
  const strength      = strengthScore(form.password)
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength]

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf0ff 40%, #fff0f9 70%, #f0fff8 100%)' }}>

      {/* Panel gauche — visible desktop */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 40%, #ec4899 100%)' }}>

        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20" style={{ background: 'white' }} />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-15" style={{ background: 'white' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">TaskFlow</span>
        </div>

        {/* Texte central */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Organise ta vie,<br />
            <span className="text-white/70">une tâche à la fois.</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Gère tes projets, suis ta progression et atteins tes objectifs avec style.
          </p>

          {/* Features */}
          {[
            { icon: '📊', text: 'Statistiques visuelles en temps réel' },
            { icon: '🎯', text: 'Priorités et catégories intelligentes' },
            { icon: '🔒', text: 'Données sécurisées et privées' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-sm">{icon}</div>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Footer panel */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">by Prisca SANKARA · 2026</p>
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-xl">TaskFlow</span>
          </div>

          {/* Card formulaire */}
          <div className="bg-white/80 rounded-3xl p-8 shadow-xl border border-white"
            style={{ backdropFilter: 'blur(20px)' }}>

            {/* Titre */}
            <div className="mb-7">
              <h2 className="text-2xl font-black text-gray-800">
                {mode === 'login'    && 'Bon retour ! 👋'}
                {mode === 'register' && 'Créer un compte ✨'}
                {mode === 'forgot'   && 'Mot de passe oublié 🔑'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {mode === 'login'    && 'Connecte-toi pour accéder à tes tâches'}
                {mode === 'register' && 'Rejoins TaskFlow, c\'est gratuit'}
                {mode === 'forgot'   && 'On t\'envoie un lien de réinitialisation'}
              </p>
            </div>

            {/* LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="ton@email.com" />
                <InputField label="Mot de passe" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••">
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition">
                    <EyeIcon open={showPassword} />
                  </button>
                </InputField>

                <div className="flex justify-end">
                  <button type="button" onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold transition" style={{ color: '#8b5cf6' }}>
                    Mot de passe oublié ?
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
                  {loading ? '⏳ Connexion...' : 'Se connecter →'}
                </button>
              </form>
            )}

            {/* REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Prénom" type="text" value={form.firstName} onChange={set('firstName')} placeholder="Marie" />
                  <InputField label="Nom" type="text" value={form.lastName} onChange={set('lastName')} placeholder="Dupont" />
                </div>
                <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="ton@email.com" />
                <InputField label="Mot de passe" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="6 caractères minimum">
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition">
                    <EyeIcon open={showPassword} />
                  </button>
                </InputField>

                {/* Force du mot de passe */}
                {form.password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                      ))}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}

                <InputField label="Confirmer le mot de passe" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••">
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition">
                    <EyeIcon open={showConfirm} />
                  </button>
                </InputField>

                {/* Match indicator */}
                {form.confirmPassword.length > 0 && (
                  <p className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: form.password === form.confirmPassword ? '#10b981' : '#ef4444' }}>
                    {form.password === form.confirmPassword ? '✅ Les mots de passe correspondent' : '❌ Les mots de passe ne correspondent pas'}
                  </p>
                )}

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    <span>⚠️</span> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                    <span>✅</span> {success}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
                  {loading ? '⏳ Création...' : 'Créer mon compte →'}
                </button>
              </form>
            )}

            {/* FORGOT */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="ton@email.com" />

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    <span>⚠️</span> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                    <span>✅</span> {success}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
                  {loading ? '⏳ Envoi...' : 'Envoyer le lien →'}
                </button>

                <button type="button" onClick={() => switchMode('login')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ color: '#6b7280', background: '#f8faff', border: '1.5px solid #e8e0ff' }}>
                  ← Retour à la connexion
                </button>
              </form>
            )}

            {/* Switch mode */}
            {mode !== 'forgot' && (
              <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f0e8ff' }}>
                <p className="text-sm text-gray-400">
                  {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                  <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="ml-1.5 font-bold transition" style={{ color: '#8b5cf6' }}>
                    {mode === 'login' ? "S'inscrire" : "Se connecter"}
                  </button>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}