// AI 페르소나 코멘트 생성 Edge Function
// 배포: supabase functions deploy diary-comment
// 비밀키 설정: supabase secrets set GEMINI_API_KEY=...  (무료 발급: aistudio.google.com/apikey)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_MODEL = 'gemini-flash-latest'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: '로그인이 필요합니다.' }, 401)
    }

    const { entryId } = await req.json()
    if (!entryId) {
      return json({ error: 'entryId가 필요합니다.' }, 400)
    }

    // 사용자 JWT로 클라이언트를 만들면 RLS가 그대로 적용된다 (본인 글만 조회/수정 가능)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: entry, error: fetchError } = await supabase
      .from('diary_entries')
      .select('id, content, mood, personas ( name, tone_prompt )')
      .eq('id', entryId)
      .single()

    if (fetchError || !entry) {
      return json({ error: '일기를 찾을 수 없습니다.' }, 404)
    }

    const persona = entry.personas
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      return json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다.' }, 500)
    }

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: persona.tone_prompt }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `오늘의 감정: ${entry.mood}\n일기 내용: ${entry.content}\n\n위 일기에 짧게 반응해줘.`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!aiResponse.ok) {
      const detail = await aiResponse.text()
      return json({ error: 'AI 코멘트 생성에 실패했습니다.', detail }, 502)
    }

    const aiData = await aiResponse.json()
    const aiComment = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    const { data: updated, error: updateError } = await supabase
      .from('diary_entries')
      .update({ ai_comment: aiComment })
      .eq('id', entryId)
      .select()
      .single()

    if (updateError) {
      return json({ error: '코멘트 저장에 실패했습니다.' }, 500)
    }

    return json({ entry: updated }, 200)
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}
