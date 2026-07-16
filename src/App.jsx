import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import AuthScreen from './components/AuthScreen'
import Onboarding from './components/Onboarding'
import TodayWrite from './components/TodayWrite'
import CommentView from './components/CommentView'
import History from './components/History'
import './App.css'

const PERSONA_STORAGE_KEY = 'ai-diary-persona-id'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = 확인 중, null = 비로그인
  const [persona, setPersona] = useState(null)
  const [view, setView] = useState('write') // 'write' | 'comment' | 'history'
  const [lastEntry, setLastEntry] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const savedId = localStorage.getItem(PERSONA_STORAGE_KEY)
    if (!savedId) return
    supabase
      .from('personas')
      .select('*')
      .eq('id', savedId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPersona(data)
      })
  }, [session])

  if (session === undefined) {
    return <div className="screen">확인하는 중...</div>
  }

  if (!session) {
    return <AuthScreen />
  }

  if (!persona) {
    return (
      <Onboarding
        onPick={(picked) => {
          setPersona(picked)
          localStorage.setItem(PERSONA_STORAGE_KEY, picked.id)
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <span className="nav-title">
          {persona.avatar_emoji} {persona.name}
        </span>
        <div className="nav-buttons">
          <button className={view === 'write' ? 'nav-active' : ''} onClick={() => setView('write')}>
            오늘 쓰기
          </button>
          <button className={view === 'history' ? 'nav-active' : ''} onClick={() => setView('history')}>
            히스토리
          </button>
          <button onClick={() => supabase.auth.signOut()}>로그아웃</button>
        </div>
      </nav>

      {view === 'write' && (
        <TodayWrite
          persona={persona}
          userId={session.user.id}
          onSaved={(entry) => {
            setLastEntry(entry)
            setView('comment')
          }}
        />
      )}

      {view === 'comment' && lastEntry && (
        <CommentView
          entry={lastEntry}
          persona={persona}
          onWriteAgain={() => setView('write')}
          onGoHistory={() => setView('history')}
        />
      )}

      {view === 'history' && <History />}
    </div>
  )
}
