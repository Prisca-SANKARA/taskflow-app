import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Layout({ user }) {
  const navigate  = useNavigate()
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'toi'

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navClass = ({ isActive }) => `
    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
    ${isActive
      ? 'text-white shadow-lg'
      : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
    }
  `
  const activeStyle = { background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 4px 15px rgba(139,92,246,0.35)' }

  return (
    <div className="min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#faf0ff 40%,#fff0f9 70%,#f0fff8 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 w-full"
        style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="w-full px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <span className="font-black text-gray-800 text-xl">TaskFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 bg-white/60 rounded-2xl p-1 border border-white">
            <NavLink to="/" end className={navClass}
              style={({ isActive }) => isActive ? activeStyle : {}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Dashboard
            </NavLink>
            <NavLink to="/tasks" className={navClass}
              style={({ isActive }) => isActive ? activeStyle : {}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7l3 3 3-3"/>
              </svg>
              Mes tâches
            </NavLink>
          </nav>

          {/* User + déconnexion */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                {firstName[0].toUpperCase()}
              </div>
              <span className="text-gray-600 text-sm font-semibold hidden sm:block">{firstName}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Déconnexion
            </button>
          </div>

        </div>
      </div>

      {/* Contenu de la page */}
      <main className="w-full">
        <Outlet />
      </main>

    </div>
  )
}