import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { TasksContext } from './tasks-context'

export function TasksProvider({ user, children }) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    return supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  }, [user.id])

  // Chargement initial. Le drapeau évite d'écrire dans un composant démonté
  // (StrictMode monte deux fois) ou après un changement d'utilisateur.
  useEffect(() => {
    let active = true
    load().then(({ data, error }) => {
      if (!active) return
      if (error) setError('Impossible de charger tes tâches : ' + error.message)
      setTasks(data || [])
      setLoading(false)
    })
    return () => { active = false }
  }, [load])

  const refresh = useCallback(async () => {
    const { data, error } = await load()
    if (error) { setError('Impossible de charger tes tâches : ' + error.message); return }
    setError('')
    setTasks(data || [])
  }, [load])

  return (
    <TasksContext.Provider value={{ tasks, setTasks, loading, error, refresh }}>
      {children}
    </TasksContext.Provider>
  )
}
