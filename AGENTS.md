# AGENTS.md

This file is read automatically at the start of every AI session. Keep this file thin — it holds behavior rules only. Project specifics live in `docs/`.

## Project
- Name: Shubh Samay
- One line: PWA for finding auspicious Vedic timings (Muhurat/Choghadiya/Hora) — live from NASA-grade astronomy, bilingual EN/GU.
- Stack: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui (existing — do not migrate to Flutter)

Full details: `docs/INDEX.md` → start there before touching anything. Full rulebook: `docs/masterprompt.md`.

## Read order
Read one doc at a time, in this order: `docs/overview.md` → `docs/architecture.md` → `docs/environment.md` → `docs/ui.md` → `docs/database.md` → `docs/cicd/cicd.md` → `docs/decisions.md` → supervisor docs (only when escalating).

## Standing rules — always follow
1. **Ask, then wait.** If you ask a question, stop completely until you get a real answer. Never proceed on a guess.
2. **No blind fixing.** Before calling a fix done, search the whole project for every other place that uses the changed function/file/component and confirm each still works.
3. **Label every fix** MINOR or MAJOR before starting it, and say why.
4. **Test before saying "done."** Verify the actual symptom is gone, don't just assume.
5. **Escalate after 2 failed attempts on the same bug** (tracked in `docs/supervisor/bug-improvements.md`). Don't try a 3rd blind fix — write a handoff prompt, attach `docs/supervisor/project-brief.md`, tell the human it needs outside help.
6. **If a supervisor's answer isn't fully clear, keep asking** until it is. Don't act on a half-understood instruction.
7. **Update every affected doc immediately after any real change** — including this file if the rules themselves need to change.
8. **Keep docs compact.** No size limit, but one file = one topic. Getting long is a signal to split.
9. **Never read, quote, log, or forward anything in `docs/cicd/secrets/`**, for any reason, in any context.
10. **`docs/decisions.md` and `docs/cicd/githubactionsissues.md` are append-only.** Never rewrite or delete old entries.
11. **`docs/supervisor/bug-improvements.md`** — append when told to. Never prune or delete entries yourself.
12. **Structure redesign is high-risk.** Only if explicitly asked, only after a written migration plan is approved. New files always follow the existing structure.
13. **Existing Next.js project** — do not migrate to Flutter.
14. **Quality over speed, always.**

## Existing project note
This is an existing Next.js project. All docs have been created from the actual codebase audit. Follow the existing structure for all new work going forward.
