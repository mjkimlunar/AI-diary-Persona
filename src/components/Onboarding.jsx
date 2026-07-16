import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Onboarding({ onPick }) {
  const [personas, setPersonas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('personas')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPersonas(data)
      })
  }, [])

  return (
    <div className="screen">
      <h1>어떤 페르소나와 함께할까요?</h1>
      <p className="sub">고른 페르소나가 앞으로 내 일기에 반응해줘요. 나중에 바꿀 수 있어요.</p>

      {error && <p className="error">{error}</p>}

      <div className="persona-grid">
        {personas.map((persona) => (
          <button key={persona.id} className="persona-card" onClick={() => onPick(persona)}>
            <span className="persona-emoji">{persona.avatar_emoji}</span>
            <span className="persona-name">{persona.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
