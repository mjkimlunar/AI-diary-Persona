# AI 페르소나 일기장

오늘 감정을 짧게 적으면 내가 고른 AI 페르소나가 그 말투로 한마디 남겨주는 일기 서비스. 새로고침·다른 기기에서도 기록이 그대로 남는다.

**배포 링크**: https://artstock805.github.io/AI-diary-Persona/

설계 문서: 사용자 흐름 / 데이터 모델 / 보안 체크리스트는 별도 설계 지도 참고.

## 빠르게 로컬에서 실행해보기

```bash
git clone https://github.com/artstock805/AI-diary-Persona.git
cd AI-diary-Persona
cp .env.example .env
npm install
npm run dev
```

`http://localhost:5173` 으로 접속하면 된다 (Vite 기본 포트, 3000 아님). `.env.example`에 이미 실제 Supabase 값이 들어있어서(anon 키는 공개용이라 안전) 바로 실행 가능 — 직접 가입해서 테스트해보면 된다.

## 본인 Supabase 프로젝트로 새로 시작하려면

## 0. 준비물

- Node.js (설치됨)
- [Supabase](https://supabase.com) 계정 — 무료
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) — Edge Function 배포용
- Google Gemini API 키 — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)에서 무료로 발급

## 1. Supabase 프로젝트 만들기 (직접 하기)

1. [supabase.com](https://supabase.com) 가입 후 새 프로젝트 생성
2. 왼쪽 메뉴 **SQL Editor** 로 이동 → `supabase/schema.sql` 내용 전체 복사해서 붙여넣고 실행
   - `personas`, `diary_entries` 테이블과 RLS 정책, 기본 페르소나 3종이 만들어진다
3. 왼쪽 메뉴 **Project Settings > API** 에서 `Project URL`과 `anon public` 키 복사

## 2. 프론트엔드 환경변수

```bash
cp .env.example .env
```

`.env`를 열어 방금 복사한 값을 채운다:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_anon_key
```

`.env`는 `.gitignore`에 포함되어 커밋되지 않는다.

## 3. AI 코멘트 Edge Function 배포

```bash
npx supabase login
npx supabase link --project-ref <project-ref>   # Project Settings > General 에서 확인
npx supabase secrets set GEMINI_API_KEY=여기에_본인_키
npx supabase functions deploy diary-comment
```

Edge Function은 Gemini API 키를 서버 환경변수로만 사용한다 — 프론트 코드에는 절대 들어가지 않는다.

## 4. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 접속 → 가입 → 페르소나 선택 → 오늘 쓰기 → 저장하면 AI 코멘트가 붙어서 보인다. 새로고침해도, 로그아웃 후 다시 로그인해도 히스토리에 그대로 남아있으면 성공.

## 5. 배포

프론트는 Vercel 등에 그대로 배포 가능. 배포 환경변수에도 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 동일하게 등록한다.

## 폴더 구조

```
supabase/
  schema.sql              DB 테이블 + RLS 정책
  functions/diary-comment  AI 코멘트 생성 Edge Function
src/
  lib/supabaseClient.js    Supabase 클라이언트
  components/
    AuthScreen.jsx         로그인 · 가입
    Onboarding.jsx         페르소나 선택
    TodayWrite.jsx         오늘 쓰기 (저장 → 코멘트 생성)
    CommentView.jsx        AI 코멘트 확인
    History.jsx            지난 기록
```

## 이번 과제에서 바꾼/개선한 부분

- 페르소나별 AI 코멘트가 같은 일기 행에 저장되도록 Edge Function을 직접 설계·배포함
