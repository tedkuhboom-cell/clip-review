# Clip Review: Roadmap & Notes

The goal: help people learn whatever they want in a fun, efficient way, built on the *Learning How to Learn* method (Oakley & Sejnowski), and give them real results they can brag about. Not instant gratification, but enough quick wins to keep people coming back. That includes Ted, and people with less drive than Ted.

## Principles
- **Memory lane is capped, practice lane isn't.** New cards per day stay limited (spacing works). Clip reviews, drills and logged games are unlimited.
- **Reward effort and honesty, never self-graded results.** The app grades answers, so nobody can game their own score.
- **Proof has to be real.** Then-vs-now numbers come from the user's own data.
- **The loop is the product. The game is a content pack.** Learn → play with one focus → log → review your recordings → adjust.

## Shipped
- [x] Four tools in one installable app (Manual, Debrief, Clips, Maps). Offline, data stays on the device.
- [x] First-run setup and backup/restore
- [x] Typed recall graded on must-have key points (Got it / Shaky / Missed), plus a one-level appeal
- [x] "Go deeper" points with a ★ Full answer mark
- [x] Proof screen: clips then vs now, recall accuracy, concepts owned, ranked stats, share image
- [x] Session mode: two taps per game in long ranked sessions, tilt check, auto-tallied session log
- [x] Starting RP at session start (prefilled from last session), ending RP at the end; the app computes the change and shows the RP climb on Proof
- [x] Content separated into `pack-apex.js` so other games or subjects can reuse the engine
- [x] Season 31/32 prep (2026-11-06): new cards (Reset timer 3.10, Cover the heal 5.7, Own the drop 1.12, Nothing stays cleared 5.8, Strongholds 2.5, 0.2 rewritten and auto-graded, fourth-team depth on 2.4); new Module 8 "Ranked & the Climb" (squad up, legend bans, Challenger/Goliath, demotion shields, plus five Season 32 cards marked Coming soon); ban backups (Plan B/C), Season 32 rank list toggle, season goal on Proof; lobby type + squad kills per game in Session mode; Stronghold chip and new drop/heal/reset checks in Clips; Axle and Crypto kit tips

- [x] Grader appeals (2026-11-07): pick the missed point and say what you wrote; upgrade happens right away, note saved to Settings → Grader appeals with "Copy for Claude" for tuning
- [x] Go-deeper appeals (2026-11-08): claim a missed go-deeper point with a note; grade unchanged, but it can complete a ★ Full answer; logged with other appeals
- [x] Paste blocked in the answer box (voice dictation still works)
- [x] Full-answer streak: counter during a session, best streak on Proof

- [x] Learning-efficiency pass (2026-11-08): new cards read first and tested at the end (30-second break if nothing else is due); session cap (10/15/25, default 15), most overdue first, new cards pause during a backlog, "Keep going" option; Today's drill picked after each Manual session, shown in ranked sessions, "did you try it" logged, stats on Proof
- [x] Drill list and drill rotation (2026-11-08): Debrief keeps a drill list with your most-missed cards first ("Start here" on any of them). During a ranked session the drill switches every 2, 3 or 5 games (or never), with a per-game "I tried the drill" tick. Proof shows games where you tried a drill.
- [x] "You'll be tested on" box (2026-11-08): new-card read screen and Library list each card's graded key points (numbered) and its go-deeper points, so you know what to lock in before the test. The test itself stays pure recall.
- [x] Mechanics module (2026-11-08): Module 9 "Mechanics · Aim & Movement" (9.1–9.11) with Firing Range drills, plus 3.11 Turn a 1v3 into three 1v1s, 3.12 Swap armor, skip the battery, 4.18 Predict the revenge swing, 6.10 Decide fast, commit fully. Filtered from 7 creator videos; each card notes how many videos agree. Left out: weapon picks, sensitivity numbers, and unverified claims ("counter-strafing gives more aim assist", "a moving crosshair has no recoil").
- [x] Pre-game 5 and bedtime clip reminder (2026-11-10): before a ranked session, an optional 5-minute primer picks one logged clip that matches your focus (a time you did it right if there is one, otherwise the mistake it fixes), then your focus text and "say it out loud." The Manual tab nudges a bedtime clip review when it's been 2, 3 or 7 days (Settings). Proof counts sessions started with a pre-game.
- [x] Rank + division RP (2026-11-10): session start and end now take rank (dropdown) plus RP in the division and its size, copied from the rank screen (e.g. Silver I, 394 / 750). The app works out the RP change across promotions and demotions, remembers each division's size, prefills the next session from where the last ended, and updates your profile rank. Proof shows rank first → latest plus net RP.
- [x] Death reasons, shared with Clips (2026-11-11): 23 reasons in 6 groups (drop, position, rotation, fight decisions, execution, team & head), each linked to a study module and a focus habit. Your 4 most-used are one-tap buttons; the rest sit in a grouped dropdown. "Other: write it in" suggests a close existing reason as you type; when a write-in shows up twice, the app offers to add it as your own reason (optional module) and moves past write-ins under it. Clip reviews use the same list, and reasons from the last 30 days of clips push matching drills up your ranked drill list.
- [x] Simpler sessions + honest Proof (2026-11-11): one focus or rotating drills, never both on screen (a rotating drill *is* the focus). After your first session the start screen collapses to Focus + Rank + one Start button; everything else is under "Change focus, rank or options." Proof only headlines a then-vs-now clip stat when each side has 5+ clips, recall % after 5+ answers, and focus % after 6+ sessions; smaller samples show as counts with a note.

- [x] FSRS adaptive schedule (2026-11-08): FSRS-4.5 default weights; Missed/Shaky/Got it/Full answer = Again/Hard/Good/Easy; Shaky capped at 7 days (shortened to 3 on 2026-11-10); target retention 85/90/95% in Settings; ladder cards migrated (stability from step, difficulty from past slips). Simulation on Ted's 45 cards: roughly 55–65% fewer reviews over 180 days at the same answer pattern
- [x] Ranked deaths in detail (2026-11-16): "How did it end?" is now two taps, the area (Drop, Position, Rotation, Fight call, Gunfight / kit, Team / head, the same groups as the Manual and Clips) then the reason inside it. After a death logs, "What was missing?" offers up to 5 optional chips taken from the Clips checks for that reason (e.g. Lost the gunfight: didn't wide swing, no info-peek, no cover, no nades, not healed), your theme's first. Each tap counts toward the theme leak score like a missed clip check. "Clip this one later" stars a game; starred games wait in Clips and open a review pre-filled with what you logged. The Debrief shows Session results (where it went wrong by area, what was missing with the card that teaches it) and a 30-day "What's missing when you die" panel. New checks: wide swing, strafe in the duel, decide and commit, plus a ranked-only reset breath.
- [x] Themes: one subject across every tab (2026-11-15): 11 themes (e.g. "Stay connected to your team" = 3.3, 5.4, 5.2, 5.7, 7.1, 1.12), each owning its sub-lesson cards, the death reasons and clip checks that count against it, and a "when not to" line. One leak score (last 30 days: game deaths, clip verdicts ×2, missed clip checks, missed/shaky cards) picks the theme automatically; it moves on after 7+ days, nailed two sessions in a row, and fewer games lost to it than before. Manual: theme cards first in the new-card queue (reviews stay mixed and on schedule). Debrief: the theme is the session focus; rotate mode cycles its drills; pre-game asks you to recall a theme card from memory instead of rereading. Clips: theme checks first in each pass; verdict asks whether your theme would have saved it. Patterns and Proof show the theme leak before vs after. Replaced: fixed "next habit" order, "Study next: Module X", Clips "Your next focus", focus picker. Fixed: Today's drill never showed in one-focus sessions.
- [x] Supabase backend + review fixes (2026-11-14): project `clip-review` with insert-only `appeals` and `client_errors` tables (row level security; the public key can't read). Appeals are sent if the user agrees on their first appeal; crash reports are on unless turned off (Settings → Sharing); offline rows wait in an outbox. Fixes: service worker always revalidates (no mixed old/new files after a release), restore merges custom reasons/write-ins/division sizes/settings into a set-up phone, failed saves show a warning with "Save a backup now", session extras (lobby/place/kills) sit above the two taps that log the game.
- [x] Grading on meaning + foundations (2026-11-17):
  - **Claude grades typed answers** (Settings → Answer grading, off by default). The `grade` Edge Function holds the API key, looks up the card's key points itself, and returns covered / partly / missing / opposite for each point with the learner's own words as evidence and one line on what was missing. A credited point whose quote isn't in the answer is dropped to "partly". Saying the opposite of a must-have can't be a Got it. Daily limits per phone and overall; answers capped at 1,500 characters; graded answers are kept in the `grades` table to check the grader. Offline, over the limit or on any failure the keyword grader's result is used and the screen says so.
  - **Keyword grader tightened and widened.** A one-letter typo only counts on words of 6+ letters and not in the first two letters ("fight" was matching "sight" and "right"); the words of a phrasing must be within 10 words of each other. 3,071 accepted phrasings added and 53 generic ones removed. On the 160 hand-written test answers: right answers graded Got it 50 → 73 of 77; wrong answers graded Got it 15 → 10 of 77.
  - **Every typed answer is saved** with its grade (last 3,000), shown as "Your last answer" in the Library and included in backups.
  - **Online backup** (Settings, off by default): a copy of the backup file kept under a restore code, refreshed as you use the app; restore on a new phone from the setup screen.
  - **Weekly goal**: practice days per week (3–6, default 4) on the Manual tab, weeks-in-a-row count, "never miss twice" nudge. Counts showing up, not grades.
  - **Repo**: content pack is one item per line; `npm test` (grader, scheduler, pack checks) runs on every pull request with a check that `sw.js` VERSION was bumped; `npm run smoke` drives the app in headless Chrome; `CLAUDE.md` holds the working rules.
- [x] Recoil (2026-11-18): Manual → Recoil. Pick your guns; each one starts with a trace over the real pull, then you draw it from memory on the FSRS schedule. The drawing is scored automatically (shape and side-to-side size at each depth; size of the drawing doesn't matter), with a line on where it first went wrong. Spray game: hold to fire, drag to fight the kick, guide on or off, close or far target; best guide-off close score per gun. 18 guns traced from Ted's recoil chart (season unknown); fire rates approximate. Recoil practice counts as a practice day for the weekly goal and is in backups.
- [x] Recoil stick recipes (2026-11-18): each gun's pull is turned into up to 5 steps in words ("Shots 1–10: down, a little left"), worked out from how fast and which way the pull moves between shots, because on a stick you hold a direction and lean rather than draw a shape. Spray game: with the guide on the recipe is listed and the current step lights up and is written above the target as the gun fires; guide off hides it (the test). After a spray it names the step where most shots missed. The recipe also shows after a draw-from-memory.
- [x] Recoil retries and part-drawing (2026-11-18): a new gun is built up in steps (trace, then each third with the rest showing, then the whole thing). On a review the first try sets the schedule; after a miss, Try again hides only the third that was furthest off, then the whole pull is redrawn. Retries are unlimited and logged as practice.
- [x] Questions match the graded points (2026-11-21): the study screen for a new card now shows the exact question you will be asked, above the points your answer needs. 12 questions reworded (0.1b, 1.4, 2.3, 2.4, 3.1, 3.5, 3.6, 3.12, 8.3, 8.4, 8.7, 8.8) so each asks for every graded point and nothing else. Graded points and accepted phrasings unchanged.

- [x] Which theme would have saved it (2026-11-23): the clip review Verdict step shows your theme right now (and the theme of that ranked game, if the clip came from one), then a scrollable list of all themes to pick which one would have changed the ending, with "None of these" for outplays. Your pick decides the clip's theme. Picking the same theme in 2+ clips in 30 days raises that theme's cards from a 90% to a 92% retention target (94% at 4+), so FSRS brings them back sooner and pulls already-waiting cards forward; they also go first in the review queue and new-card order. The Manual says which theme is coming back sooner and why.

## Up next
- [ ] **Recoil stick mode.** On-screen thumbstick where push distance sets aim speed. Waiting on real controller sensitivity numbers and response-curve math from Ted.
- [ ] **Recoil: check the chart against the current season.** Spray each of your guns at a wall in the Firing Range; if one doesn't match its pattern, retrace it (and add a way to capture your own pattern from a screenshot).
- [ ] **Pick the grading model.** Run `npm run eval` (Haiku first, then Sonnet and Opus) on `tests/grader-cases.txt`, then on real saved answers once there are a few hundred. Set `GRADE_MODEL` to the cheapest one that is accurate enough.
- [ ] **Situation questions.** Most cards ask for a definition ("Name the three…"). Add "you're here, this is happening, what do you do?" questions and several wordings per card, graded by Claude against the same key points. Needs the Claude grader live first; keywords can't grade these.
- [ ] **Two quiet weeks.** No new features: play, study, and let the saved answers, appeals and theme data say what to build next. Have one friend install it.
- [ ] **Weekly appeal review.** Read the `appeals` table, add accepted phrasings where the grader was wrong, flag notes that stretch the truth, push fixes, send a summary.
- [ ] **Manage your reasons.** Rename or remove custom reasons in Settings; optional "Copy write-ins for Claude" to review them together.
- [ ] **Tune the theme rules** after a few weeks of real data: leak-score weights, the 7-day minimum, and the fallback when a theme had no deaths before it started (15% of games).
- [ ] **Custom reasons → themes.** Reasons you add yourself don't count toward any theme yet; let the user attach one.
- [ ] **Teach it.** Optional "explain it to a new player" prompt after a Full answer (the protégé effect, straight from Learning How to Learn).
- [ ] **Cheap fight reps.** A practice-lane note: pubs or Mixtape for aim reps, since ranked is often too passive to train aim.
- [ ] **Personalize FSRS** once there are a few hundred typed reviews: fit the weights to the user's own history.
- [ ] **More ways to practice without playing:** decision drills from paused clips or screenshots ("what do you do here?"), 5-minute firing range drills, guided mental rehearsal.
- [ ] **Make answers more thorough.** Ideas: after a Got it, ask a quick "why does that work?" follow-up (explaining *why* is a strong memory booster). Track Full-answer rate per card. Surface cards that keep getting Got it without the depth.
- [ ] **Session mode polish.** Optional per-game note, end-of-session "biggest leak this session" callout, compare one session against your average.
- [ ] **New-user test pass.** Run a fresh first-run in a Chrome Incognito window. Have a friend install it on their own phone and try to break it.
- [ ] **Bug report button.** Copies the app version and current screen to share.
- [ ] **Visual design pass.** Gather a friend's feedback and reference screenshots of apps whose look we like, then restyle.
- [ ] **Effort points.** Points for reps, not grades (the weekly goal shipped 2026-11-17).
- [ ] **Uncapped practice lane for grinders.** Extra card rounds that don't disturb the schedule. Rotating review lenses. A break nudge when answer quality drops.

## When Season 32 launches (early 2027)
- [ ] Switch default rank system to Season 32 and remove "Coming soon" tags
- [ ] Add the published RP values for kills and placement, then show a break-even line per game in Session mode (kills and placement are already being logged)
- [ ] Check card text against the final patch notes (everything Season 32 is "announced, subject to change")
- [ ] Refresh the Maps tab "Current read" rows for the ranked rotation (also still needed for Season 31)

## Ideas parked from transcripts
- Warm-up checklist on Start session (5–15 min range, or pubs "push everything" for aim)

## Before going public
- [ ] Review every card so it's fully in our own words, and credit the creators whose videos inspired them
- [ ] Kit tips for more legends (currently Alter, Conduit, Catalyst, Mad Maggie, Valkyrie, Ash)
- [ ] Sync across devices (online backup with a restore code shipped 2026-11-17; live two-way sync would need accounts)
- [ ] A content pack template so other games or subjects can be added (guitar, chess, speaking, studying…)
- [ ] Squads: friends compare effort, not skill

## Notes
- 2026-11-06: Filtered new transcripts and Respawn's Season 31/32 posts. Kept coaching ideas not already covered and official ranked changes; skipped weapon meta (goes stale) and unsourced stats. The egg-timer rule became the Reset timer at 30 seconds to 1 minute.
- 2026-11-05: First real Manual session with typed recall worked well. Most players run long ranked sessions (up to ~20 games), so logging has to be fast. That's why Session mode exists.
- Test account plan: use an Incognito window for a clean first run. A friend can open the link on their own phone; their data stays on their device.
