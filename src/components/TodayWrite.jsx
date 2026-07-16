import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const MOODS = [
  { emoji: '😊', label: '좋음' },
  { emoji: '😐', label: '그럭저럭' },
  { emoji: '😔', label: '별로' },
  { emoji: '😤', label: '답답함' },
  { emoji: '😴', label: '피곤함' },
]

export default function TodayWrite({ persona, userId, onSaved }) {
  const [mood, setMood] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!mood || !content.trim()) {
      setError('감정과 내용을 모두 입력해주세요.')
      return
    }
    setSaving(true)
    setError('')

    const { data: entry, error: insertError } = await supabase
      .from('diary_entries')
      .insert({
        user_id: userId,
        persona_id: persona.id,
        mood: mood.emoji,
        content: content.trim(),
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    const { data: fnResult, error: fnError } = await supabase.functions.invoke('diary-comment', {
      body: { entryId: entry.id },
    })

    setSaving(false)

    if (fnError) {
      // 저장은 이미 됐으니, 코멘트만 비워둔 채로 넘어간다
      onSaved({ ...entry, ai_comment: null })
      return
    }

    onSaved(fnResult.entry)
  }

  return (
    <div className="screen">
      <h1>오늘 하루 어땠나요?</h1>
      <p className="sub">
        {persona.avatar_emoji} {persona.name}에게 짧게 남겨보세요.
      </p>

      <div className="mood-row">
        {MOODS.map((m) => (
          <button
            key={m.emoji}
            className={`mood-btn ${mood?.emoji === m.emoji ? 'selected' : ''}`}
            onClick={() => setMood(m)}
            aria-label={m.label}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <textarea
        className="diary-textarea"
        placeholder="오늘 있었던 일을 적어보세요..."
        value={content}
        maxLength={1000}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
      />
      <div className="char-count">{content.length} / 1000</div>

      {error && <p className="error">{error}</p>}

      <button className="primary-btn" onClick={handleSave} disabled={saving}>
        {saving ? '저장하는 중...' : '저장하기'}
      </button>
    </div>
  )
}
