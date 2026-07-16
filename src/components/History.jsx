import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function History() {
  const [entries, setEntries] = useState([])
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('diary_entries')
      .select('id, mood, content, ai_comment, created_at, personas ( name, avatar_emoji )')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setEntries(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="screen">불러오는 중...</div>

  return (
    <div className="screen">
      <h1>지난 기록</h1>

      {error && <p className="error">{error}</p>}
      {!error && entries.length === 0 && <p className="sub">아직 쓴 일기가 없어요.</p>}

      <div className="history-list">
        {entries.map((entry) => {
          const isOpen = openId === entry.id
          const date = new Date(entry.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          return (
            <div key={entry.id} className="history-item">
              <button className="history-row" onClick={() => setOpenId(isOpen ? null : entry.id)}>
                <span className="history-mood">{entry.mood}</span>
                <span className="history-date">{date}</span>
                <span className="history-persona">
                  {entry.personas?.avatar_emoji} {entry.personas?.name}
                </span>
              </button>
              {isOpen && (
                <div className="history-detail">
                  <p className="entry-content">{entry.content}</p>
                  {entry.ai_comment && (
                    <div className="comment-bubble small">
                      <p>{entry.ai_comment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
