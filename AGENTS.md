# Local Review Workflow

Leave completed edits in the local working tree for the user to review. Run local checks as appropriate and report the results.

Wait for an explicit request before committing changes, pushing to GitHub, or deploying to Vercel. An edit request does not authorize publication.

# Project Map

This is a Vite + React + TypeScript multi-page app for the Madrasah Shorof Al-Barkah student exam and grading workflow.

## Entry Points

- `index.html` -> `src/main.tsx` -> `src/App.tsx`: main dashboard, login/session, role navigation, and orchestration of students, attempts, grades, setoran, and exam access.
- `ujian.html` -> `src/examMain.tsx` -> `src/components/ExamSessionPage.tsx`: standalone exam page. Reads URL parameters, restores local drafts, checks exam access, grades answers, and saves attempts.
- `jawaban.html` -> `src/reviewMain.tsx` -> `src/components/AttemptReviewPage.tsx`: standalone attempt review page.
- `vite.config.ts`: Vite and React/Tailwind setup, three-page build inputs, and local mounting of the API handlers.

## Source Layout

- `src/components/`: feature screens and reusable UI. Examples include `BabExamView`, `StudentProgressView`, `ClassRecapView`, `RankingView`, and `ExamAccessControlView`.
- `src/data/students.ts`: student/attempt/grade types, initial student roster, demo students, and passing score.
- `src/data/babs/` and `src/data/shorofData.ts`: shorof bab definitions for Reguler 1 and Reguler 2.
- `src/data/exams/` and `src/data/babExamBank.ts`: curated exam question banks, grouped by bab.
- `src/utils/`: business rules and client helpers. Important modules: `quizGenerator.ts` (question generation), `examAccess.ts` (access policy), `examSession.ts` (URLs and local drafts), `studentData.ts` (API client), `babScores.ts` (bab summaries), `finalGrades.ts` (weighted grades), `ranking.ts` (ranking calculations), and `auth.ts` (browser session state).
- `api/student-data.ts`: database-backed student records, attempts/review data, setoran, exam access, and manual UTS/UAS scores.
- `api/student-auth.ts`: student and superadmin credential operations.
- `src/index.css`: global styling.

## Debugging Paths

- UI or interaction issue: start at the relevant component, then trace props/state from `src/App.tsx`.
- Wrong question, question order, or count: inspect `src/utils/quizGenerator.ts` and the corresponding files in `src/data/exams/` or `src/data/babs/`.
- Exam draft or navigation to exam/review: inspect `src/utils/examSession.ts`, then `ExamSessionPage.tsx` or `AttemptReviewPage.tsx`.
- Score, passing status, or ranking: inspect `babScores.ts`, `finalGrades.ts`, and `ranking.ts`, followed by the displaying component.
- Exam access discrepancy: compare `src/utils/examAccess.ts` with server-side validation in `api/student-data.ts`.
- Data load/save issue: trace UI -> `src/utils/studentData.ts` -> `api/student-data.ts` -> PostgreSQL.
- Login/password issue: trace `LoginView.tsx` or `App.tsx` -> `src/utils/studentCredentials.ts` -> `api/student-auth.ts`.

## Checks

- `npm.cmd run lint` runs `tsc --noEmit` on Windows PowerShell environments where `npm.ps1` execution is restricted.
- `npm run build` builds the three HTML entry points.
