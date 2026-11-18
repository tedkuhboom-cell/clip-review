# Clip Review

A learning loop for competitive games, built on the Learning How to Learn method: spaced recall, one focus per session, honest logging, and clip review.

- **Manual**: spaced-repetition cards. Type your answer from memory and the app grades it against each card's key points: by Claude on what you meant (optional, online), or by keywords on the phone.
- **Debrief**: log each ranked session against your theme. Each game takes three taps (theme yes/no, area, reason), plus optional "what was missing" chips and a star to review it as a clip later.
- **One theme across every tab**: the app picks your biggest leak (e.g. "Stay connected to your team") from your games, clips and cards, and every tab works on it until it sticks.
- **Recoil** (in Manual): draw each gun's pull from memory on a spaced schedule, and practice holding it in a spray game. 18 patterns traced from a recoil chart.
- **Clips**: a 7-step guided review of your own clips.
- **Maps**: how each map is built, and how to rotate on it.

Game content lives in a pack file (`pack-apex.js`). Supporting a different game means writing a new pack; the app code stays the same.

Install: open the site in Chrome on Android, then menu → **Install app**. Your cards, sessions and clip reviews stay on the device; back them up from Settings (gear icon). Nothing leaves the phone unless you allow it, and never with a name or account (Settings): grader appeals (asked the first time you appeal), Claude grading of your typed answers (off until you turn it on), online backup under a restore code (off until you turn it on), and crash reports (on, can be turned off, never include what you typed).

For developers and Claude sessions: see `CLAUDE.md`. Tests: `npm test`.
