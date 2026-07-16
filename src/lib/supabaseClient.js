import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 없습니다. .env.example을 복사해 .env로 만들고 값을 채워주세요.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
