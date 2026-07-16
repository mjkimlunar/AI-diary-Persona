import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
    } else if (mode === 'signup') {
      setMessage('가입 확인 메일을 보냈어요. 메일함을 확인해주세요.')
    }
    setLoading(false)
  }

  return (
    <div className="screen auth-screen">
      <h1>📓 AI 페르소나 일기장</h1>
      <p className="sub">오늘 하루, 내가 고른 페르소나에게 짧게 털어놓아 보세요.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {mode === 'signin' ? '로그인' : '가입하기'}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      <button
        className="link-button"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setMessage('')
        }}
      >
        {mode === 'signin' ? '계정이 없나요? 가입하기' : '이미 계정이 있나요? 로그인'}
      </button>
    </div>
  )
}
