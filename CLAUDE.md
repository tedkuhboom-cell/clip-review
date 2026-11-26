# Clip Review: working rules for Claude sessions

Phone PWA that teaches a skill with the *Learning How to Learn* method; Apex Legends is the first content pack.
Read `BRIEF.md` for the design and `ROADMAP.md` for what's shipped and what's next. Owner: Ted, who is not a
programmer: explain changes in plain words and say what he'll see on his phone.

## Layout

- `index.html`: the whole app (HTML, CSS, one inline script). Sections are marked `// ===================== name =====================`.
- `pack-apex.js`: all game content (`window.PACK`). One item per line. Never hand-edit it into one long line.
- `sw.js`: service worker. `VERSION` decides whether phones fetch the new app.
- `supabase/`: migrations and two Edge Functions (`grade` = Claude grades an answer, `backup` = online backup).
- `tools/`: Node scripts for content. `tests/`: tests and the grader test answers.

## Rules

1. **Branch and PR, never push to `main`.** `main` deploys to GitHub Pages within a minute. One branch and one PR per session.
2. **Bump `VERSION` in `sw.js`** in any PR that changes `index.html`, `pack-apex.js` or the manifest. CI fails if you forget.
   Bump `version` in the pack when card content changes.
3. **Run the tests before pushing:** `npm test` (no install needed). After UI changes also run `npm install && npm run smoke`
   (headless Chrome, phone-sized, Edge Functions faked).
4. **Editing cards:** change `pack-apex.js` through a script using `tools/pack-io.js` (`readPack` / `writePack`), or edit a
   single line by hand, then run `npm run format-pack`. After any card change run `npm run grade-cards` and redeploy the
   `grade` function, because it grades against its own copy of the key points.
5. **Adding accepted phrasings:** write a `tools/phrasings-<date>.txt` file and apply it with `tools/apply-phrasings.js`.
   It rejects phrasings that also match unrelated cards. Check `node tools/grader-report.js` afterwards.
6. **Grader changes need evidence.** `tests/grader-cases.txt` holds right, wrong and partly-right answers. Add real answers
   to it (from Settings > Grader appeals, the `appeals` and `grades` tables, or `recall[].a` in a backup file) and report the
   before/after numbers. `npm run eval` compares Claude models on the same file; it costs API money, so ask Ted first.
7. **Supabase:** project ref `fzfsqzuselkuynhuiplc`. Tables are reached either insert-only with the publishable key
   (`appeals`, `client_errors`) or only through Edge Functions (`grades`, `grade_usage`, `backups`). Never put a secret key
   in the app. Migrations: `npx supabase db push`. Functions: `npx supabase functions deploy grade backup`.
   Secrets: `ANTHROPIC_API_KEY` (required by `grade`), optional `GRADE_MODEL`, `GRADE_DAILY_PER_INSTALL`, `GRADE_DAILY_TOTAL`.
   Free projects are paused after a quiet week, so `.github/workflows/keepalive.yml` calls `keepalive_ping()` daily. Keep it.
8. **Privacy promises in the app are real.** Anything that sends data off the phone is opt-in (appeals, Claude grading,
   online backup) except crash reports (opt-out, never includes typed text). Don't add a new send without a setting and a
   plain sentence saying what is sent.
9. **Learning design comes first.** Typed recall, no self-grading, spacing, one focus. If a feature makes the app more
   fun but weakens one of those, raise it with Ted before building.
10. **Other sessions may be working here.** If `AGENTS-BOARD.md` exists in this folder, read it and claim the repo before editing.

## Local quirks

- Windows clone with `autocrlf=true`: files check out with CRLF. Scripts should normalise to LF before string matching.
- No Python on Ted's machine. Use Node. Playwright uses the installed Chrome (`channel: "chrome"`).
- No build step and no runtime dependencies. `package.json` is dev tooling only; keep it that way.
