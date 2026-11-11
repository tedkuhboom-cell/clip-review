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

- [x] FSRS adaptive schedule (2026-11-08): FSRS-4.5 default weights; Missed/Shaky/Got it/Full answer = Again/Hard/Good/Easy; Shaky capped at 7 days (shortened to 3 on 2026-11-10); target retention 85/90/95% in Settings; ladder cards migrated (stability from step, difficulty from past slips). Simulation on Ted's 45 cards: roughly 55–65% fewer reviews over 180 days at the same answer pattern

## Up next
- [ ] **Your #1 leak.** Debrief already logs death causes; surface the top one with "train this next" (count deaths by type, train the biggest).
- [ ] **14-day cycles.** Run one practice routine for 14 days, then reassess and pick the new weakest link.
- [ ] **Teach it.** Optional "explain it to a new player" prompt after a Full answer (the protégé effect, straight from Learning How to Learn).
- [ ] **Cheap fight reps.** A practice-lane note: pubs or Mixtape for aim reps, since ranked is often too passive to train aim.
- [ ] **Personalize FSRS** once there are a few hundred typed reviews: fit the weights to the user's own history.
- [ ] **More ways to practice without playing:** decision drills from paused clips or screenshots ("what do you do here?"), 5-minute firing range drills, guided mental rehearsal.
- [ ] **Auto-send appeals (waiting on Ted's laptop).** Ted creates a Google Form "Clip Review appeals" with 6 optional questions (Card; Claimed points; Answer; Note; Result; App ID), email collection off, linked to a new Sheet, then sends the pre-filled link with "test" in every box. Then: app posts each appeal to the Form (queued if offline), Settings toggle "Send appeals to improve the grader" with a plain explanation for other users, random App ID per install, and a weekly scheduled review that reads the Sheet, tunes key points, pushes fixes and sends a summary.
- [ ] **Tune the grader from appeals.** Every so often, copy the appeals list to Claude: add accepted phrasings where the grader was wrong, flag notes that stretch the truth.
- [ ] **Make answers more thorough.** Ideas: after a Got it, ask a quick "why does that work?" follow-up (explaining *why* is a strong memory booster). Track Full-answer rate per card. Surface cards that keep getting Got it without the depth.
- [ ] **Session mode polish.** Optional per-game note, end-of-session "biggest leak this session" callout, compare one session against your average.
- [ ] **New-user test pass.** Run a fresh first-run in a Chrome Incognito window. Have a friend install it on their own phone and try to break it.
- [ ] **Bug report button.** Copies the app version and current screen to share.
- [ ] **Visual design pass.** Gather a friend's feedback and reference screenshots of apps whose look we like, then restyle.
- [ ] **Effort points and a weekly goal.** Points for reps, not grades. Weekly targets instead of fragile daily streaks ("never miss twice").
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
- [ ] Optional sync across devices (accounts or file sync)
- [ ] A content pack template so other games or subjects can be added (guitar, chess, speaking, studying…)
- [ ] Squads: friends compare effort, not skill

## Notes
- 2026-11-06: Filtered new transcripts and Respawn's Season 31/32 posts. Kept coaching ideas not already covered and official ranked changes; skipped weapon meta (goes stale) and unsourced stats. The egg-timer rule became the Reset timer at 30 seconds to 1 minute.
- 2026-11-05: First real Manual session with typed recall worked well. Most players run long ranked sessions (up to ~20 games), so logging has to be fast. That's why Session mode exists.
- Test account plan: use an Incognito window for a clean first run. A friend can open the link on their own phone; their data stays on their device.
