# Clip Review: project brief

Written for a reviewer (person or agent) who hasn't seen this project before and doesn't need to know video games. It covers what the app does, the learning design behind it, how it's built, the decisions we made and why, and where we think it's weak.

**Live app:** https://tedkuhboom-cell.github.io/clip-review (installable on Android Chrome)
**Owner:** Ted (tedkuhboom-cell). Built with Claude over ~a week, entirely from a phone.

---

## 1. What it is, in one paragraph

Clip Review is a phone app that helps someone get better at a skill they practice a lot, using the method from *Learning How to Learn* (Oakley & Sejnowski): short spaced recall, one focus at a time, honest logging, and reviewing recordings of yourself. The first "subject" is the competitive video game Apex Legends, because that's what Ted plays, but the engine is separate from the content so other games or skills (guitar, chess, public speaking) could be added as content packs. The long-term goal: help people learn whatever they want in a fun, efficient way, with real results they can show off, including people with less drive than the author.

## 2. The game in 60 seconds (just enough to read the code)

- Apex Legends is a team shooter: 3-player squads drop onto a map with ~20 squads; the last squad alive wins.
- A shrinking safe area (**the ring** or **zone**) forces everyone together over time.
- **Ranked** mode awards or deducts **RP** (ranked points) each match based on placement and kills. Players often play long sessions (~20 matches in a row).
- **Third party:** a squad attacks two other squads already fighting each other.
- A **knock** downs an enemy; teammates can **res** (revive) them.
- **Legends** are playable characters with abilities. **Recording/clips:** players record matches (e.g. with Outplayed) and can review them.

Everything game-specific lives in `pack-apex.js`. The engine (`index.html`) only knows about cards, modules, foci, sessions and clips.

## 3. The core loop

**Learn → play with one focus → log it → review recordings → adjust**

The app has four tabs:

| Tab | What it does | Learning purpose |
|---|---|---|
| **Manual** | Concept cards studied with typed recall, scheduled by spaced repetition | Build knowledge in memory |
| **Debrief** | Fast logging during a long ranked session: one focus, two taps per game | Turn knowledge into practice, keep it honest |
| **Clips** | Guided step-by-step review of a recorded moment, one "pass" at a time | Deliberate, focused self-review |
| **Maps** | Reference notes on map geometry and rotations | Lookup, not study |

Plus a **Proof** screen (trophy icon) with then-vs-now numbers from the user's own data, and a shareable image.

## 4. The learning design: principle → feature

This is the heart of the project, and where opinions are most welcome.

| Principle (from LHTL / memory research) | How the app does it | Where |
|---|---|---|
| **Retrieval practice beats rereading** | Every card is answered by *typing from memory*. No multiple choice. Pasting is blocked in the answer box. | `renderMSession`, paste handler |
| **Grade on substance, not self-report** | The app grades the typed answer against each card's must-have key points: Got it / Shaky / Missed. Users can't grade themselves. | `gradeAnswer` |
| **Depth and elaboration** | Optional "go deeper" points. Hitting all must-haves and depth points earns a ★ Full answer; there's a Full-answer streak. | `finishCard`, card `dp` |
| **Spaced repetition** | FSRS-4.5 scheduler (the open-source algorithm Anki uses). Target retention selectable: 85 / 90 / 95%. | `fR`, `fIvl`, `schedule` |
| **Delayed testing of new material** | A new card is *read* first, then reviews, then a ~30s break, then the new card is tested. Never read-then-immediately-test. | `startMSession` |
| **Avoid cramming and overload** | New cards per day capped (default 3). Reviews per session capped (default 15). Backlog doesn't flood new cards. | `planToday`, `sessionCap` |
| **Know what you'll be tested on (signaling)** | While reading a new card, a "You'll be tested on" box lists the graded points. Hidden during the test. | `testedBox` |
| **One focus at a time** | A ranked session has exactly one focus. Before each game: say it out loud. Per game: did you run it? (yes / sort of / forgot) | `startLive`, `renderLive` |
| **Practice in context / interleaving** | Each card has a drill. During a ranked session the app rotates drills (most-missed cards first) every 2, 3 or 5 games. | `drillList`, `liveDrill` |
| **Illusion of competence / honesty** | Proof uses only logged data. Appeals exist when the grader is wrong, but they are logged, not silently accepted. | `renderProof`, appeals |
| **Emotional state matters** | Tilt check: three games in a row without the focus → "take 5 minutes." Mindset module covers choking and resets. | `renderLive` |
| **Feedback loop from mistakes** | Each logged death has a cause; causes map to modules, and the Debrief recommends "Study next: Module X". | `debriefCauses`, `moduleWhy` |
| **Review your own recordings deliberately** | Clips walks one pass at a time (minimap only, then the fight only, then...), asks *when* the mistake happened (often 5–30s earlier than the death) and whether it was a decision or an execution error. | `renderClips` |

**Design principles we wrote down** (see ROADMAP.md):
- The memory lane is capped; the practice lane isn't. Spacing works only if you don't cram.
- Reward effort and honesty, never self-graded results.
- Proof has to be real.
- The loop is the product; the game is a content pack.

## 5. Architecture

Deliberately minimal: no build step, no framework, no backend.

```
index.html            ~1,600 lines: HTML + CSS + the whole engine (vanilla JS, one IIFE)
pack-apex.js          content pack: window.PACK = {...} (77 cards, modules, ranks, legends, clip config)
sw.js                 service worker: network-first with cache fallback, VERSION string bumped each release
manifest.webmanifest  PWA manifest (installable)
icon-*.png            app icons
ROADMAP.md            shipped list, up next, notes
```

- **Hosting:** GitHub Pages straight from `main`. Every push redeploys in about a minute.
- **Rendering:** a tiny `h(tag, attrs, ...children)` helper builds DOM; each tab has a `renderX(v)` function that redraws its panel from state (`S`). No virtual DOM.
- **State:** a global `S` object, saved to `localStorage` under keys prefixed by the pack's `storagePrefix` (`apex_profile_v1`, `apex_manual_v1`, `apex_debrief_v1`, `apex_live_v1`, `apex_clip_review_v1`, ...).
- **Data never leaves the phone.** Backup/restore is a JSON file the user saves manually.
- **Offline:** works offline after the first load.

### The content pack format

Each card:

```js
{ id:"9.1", mod:9, title:"...", roles:["All"],
  concept:"the explanation the user reads",
  recall:"the question the user answers from memory",
  drill:"something to do in a real game or the practice range",
  kp:[ ["Must-have point shown to user", ["alt phrasing","another","stem"]], ... ],
  dp:[ ["Go-deeper point", ["alts"]] ],                // optional
  src:"where it came from", soon:"Season 32", tag:"..." } // optional
```

Packs also define `modules`, `newOrder` (study order), `debriefCauses`, `clips` (review questions), `ranks`, and so on. A new subject = a new pack file with the same shape.

### The grader (`gradeAnswer`)

Keyword matching, not AI:
1. Normalize text (lowercase, strip punctuation).
2. Each key point has alternative phrasings. A phrasing matches if **every word stem in it** appears in the answer (prefix match; for stems of 5+ letters, a substring or one-letter typo also counts).
3. **Got it** if hits ≥ max(n−1, ⌈0.75n⌉); **Shaky** if hits ≥ ⌈n/2⌉; otherwise **Missed**.
4. Measured accuracy: each card's own model answers grade Got it; short answers meant for a different card essentially never pass; whole paragraphs from other cards pass ~2–5% of the time.

### The scheduler (FSRS-4.5)

Default FSRS-4.5 weights. Missed / Shaky / Got it / ★ Full answer map to grades 1 / 2 / 3 / 4. Shaky answers come back within 3 days and do not raise the card's memory strength (uncapped FSRS gave Shaky answers 40+ day gaps; a 7-day cap still sent most mature cards a full week out). Cards from the earlier fixed-interval system were migrated by estimating stability from their old box. In a simulation over Ted's real 45 cards, FSRS cut reviews by ~55–65% over 180 days versus the old ladder.

## 6. Key decisions and why

| Decision | Why | Trade-off |
|---|---|---|
| Single HTML file, vanilla JS | Built and deployed from a phone; zero tooling; easy for an agent to read whole | Getting big (1,600 lines); no modules or tests |
| No backend, localStorage only | Privacy, zero cost, offline, no accounts | Data can be lost; no sync; no usage insight |
| Keyword grader instead of an LLM | Free, instant, offline, predictable, explainable ("you missed point 2") | Can't judge meaning; wording sensitivity; appeals needed |
| Typed recall only, paste blocked | Retrieval effort is the point; multiple choice is recognition, not recall | Slower on a phone; voice typing is the escape hatch |
| FSRS over a simple Leitner ladder | Fewer reviews for the same retention, adapts per card | More complex; default weights aren't personalized yet |
| Content separated into packs | Future multi-game / multi-skill | Pack is edited by scripts; schema is informal |
| Official sources over creator videos; no "meta" | Game patches change weapon balance; fundamentals last | Some useful but unverified tips were left out on purpose |
| Logging designed for 2 taps per game | Real users play ~20 games in a row and won't type between them | Less detail per game |

## 7. Known weak spots (please poke at these)

1. **`index.html` is one 1,600-line file** with global state and string-built UI. When should it be split, and into what?
2. **No automated tests in the repo.** Testing so far is ad-hoc Playwright scripts run by the agent (phone emulation plus a real backup file), not committed and not in CI.
3. **`pack-apex.js` is one giant JSON line,** so GitHub diffs of content changes are unreadable. Content is edited through throwaway Node scripts.
4. **The grader is lexical.** It can be fooled by keyword-stuffing and can miss correct answers phrased in unexpected ways. Appeals are logged locally but don't reach the developer yet (a Google Form auto-send is planned).
5. **Data durability.** localStorage can be wiped by the browser; backup is manual. No sync across devices.
6. **No error reporting or analytics.** If something breaks on a user's phone, we won't know.
7. **Service-worker versioning is manual** (bump `VERSION` in `sw.js`). Forget it and users can be served a stale app.
8. **Content provenance.** Cards are paraphrased from official patch notes and creator videos; before going public every card needs to be fully in our own words, with credit.
9. **Accessibility and visual design** haven't had a dedicated pass.
10. **FSRS isn't personalized.** Default weights; optimizing weights needs more review history.

## 8. Questions for an experienced builder

1. With agent-driven development, what structure would you move this toward next (files, modules, a framework or not), and when is it worth it?
2. What's the smallest useful test and CI setup for an app like this?
3. Would you keep the keyword grader, add an optional LLM grader, or mix them? How would you handle cost, privacy and offline use?
4. Simplest path to accounts and sync without losing offline-first?
5. Is the engine/content-pack split the right shape for multi-subject? What would you change in the schema?
6. What are your working habits with agents (CLAUDE.md, PR reviews, issue tracking, branching) that Ted should adopt now?
7. Before handing this to strangers, what would you fix first?

## 9. Run it locally

```bash
git clone https://github.com/tedkuhboom-cell/clip-review
cd clip-review
python3 -m http.server 8000     # then open http://localhost:8000
```

No dependencies. To test on a phone-sized screen, use Chrome DevTools device mode (we test as a Pixel 7).

---

*Feedback is easiest to act on as GitHub Issues on this repo, one topic per issue.*
