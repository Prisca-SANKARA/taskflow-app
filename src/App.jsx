import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Layout from './components/Layout'
import ResetPassword from './pages/ResetPassword'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Tasks     = lazy(() => import('./pages/Tasks'))

const PageLoader = () => (
  <div className="flex justify-center py-32">
    <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor:'#8b5cf6', borderTopColor:'transparent' }}/>
  </div>
)

export default function App() {
  const [user, setUser]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
        setUser(session?.user ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#f0f4ff,#faf0ff,#fff0f9)' }}>
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor:'#8b5cf6', borderTopColor:'transparent' }}/>
    </div>
  )

  if (recoveryMode) return <ResetPassword onDone={() => setRecoveryMode(false)} />
  if (!user) return <Auth />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard user={user} /></Suspense>} />
          <Route path="tasks" element={<Suspense fallback={<PageLoader />}><Tasks user={user} /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}