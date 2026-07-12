# Editorial Calendar — H2 2026

**Cadence:** bi-weekly, Mondays. The grid is anchored to the last published post
(2026-05-11); the literal "+2 weeks" slot (May 25) is already past, so the
calendar starts at the first future slot on that grid: **Monday, July 20, 2026**.

**Voice check (from the existing five posts):** contrarian-honest, short
declaratives, em dashes, specifics over inspiration. Every post says "here's
what actually happened," names a number or a regret, and ends with something
the reader can do Monday morning. Keep that.

**Category balance:** the enum is `Instructional Design`, `AI & Workforce`,
`Teaching`, `Cloud & Infra`, `Research`, `Notes`. Published so far:
ID ×2, Teaching ×2, Research ×1 — and **zero** in `AI & Workforce`, the core
research thesis. This calendar corrects that (AI & Workforce ×3) and opens
`Cloud & Infra`.

**Workflow per post:** create `src/content/posts/YYYY-MM-slug.mdx` with
`draft: true`, write, flip to `draft: false` on publish day. Target 550–950
words (the range of the existing five).

---

## Schedule

### 1 · Mon, Jul 20 — "One year into an NSF ATE grant: what the proposal said vs. what happened"

- **Category:** Research · **File:** `2026-07-gait-year-one.mdx`
- **Hook:** GAIT (NSF ATE #2500901) hit its first anniversary this month.
- **Brief:** Proposals are written in the optimistic mood; year one is where
  they meet registration systems, faculty schedules, and procurement. Which
  proposal commitments survived contact, which got redesigned, and what the
  team would write differently next time. Structure like the xAPI post: what
  worked / what didn't / what I'd do differently. Ends with advice for CC
  faculty considering a first ATE proposal.
- **Draws on:** GAIT co-PI work — faculty development, core-AI course
  redesign, community outreach.

### 2 · Mon, Aug 3 — "We rebuilt five IT concentrations at once. On purpose."

- **Category:** Teaching · **File:** `2026-08-five-concentrations.mdx`
- **Hook:** The five redesigned concentrations (Cybersecurity, Cloud &
  Networking, Data Analytics, Software Engineering, IT Support) go live Fall
  2026 — weeks after this post.
- **Brief:** Conventional wisdom says revise programs incrementally. The
  counter-argument: AI pressure on entry-level roles made incrementalism a
  losing strategy, and a shared redesign let the five concentrations agree on
  a common core instead of drifting apart. Include the unglamorous
  deliverables nobody blogs about — degree information sheets, advisor
  guides, student-facing materials — and argue a degree is a product that
  ships with documentation.
- **Draws on:** the Fall 2026 concentration launch; Curriculum Committee
  charter/RACI work.

### 3 · Mon, Aug 17 — "What we put in NC's first associate-degree AI courses — and what we left out"

- **Category:** AI & Workforce · **File:** `2026-08-ai-degree-decisions.mdx`
- **Hook:** Fall term starts; CSC 214 (Artificial Intelligence II) runs as a
  published OER under the grant.
- **Brief:** Curriculum decisions are claims about what entry-level AI work
  actually is. Defend three: aligning a two-year course to Azure AI-102
  (employers hire against certs, not transcripts); publishing as OER (grant
  money built it, so anyone can fork it); and the leave-outs — training
  models from scratch, proof-heavy math — in favor of RAG, evaluation,
  prompt operations, and the trolley-workshop ethics module. Invite readers
  to steal the OER.
- **Draws on:** CSC 214 design + OER publication, AI-102 alignment, GAIT.

### 4 · Mon, Aug 31 — "Your faculty aren't resisting AI. They're resisting unfunded mandates."

- **Category:** Teaching · **File:** `2026-08-faculty-ai-mandates.mdx`
- **Hook:** Semester underway; every college is running some flavor of
  "AI initiative" and calling slow uptake "resistance."
- **Brief:** The resistance framing is mostly wrong — what looks like
  resistance is workload arithmetic. What actually moved faculty in GAIT's
  development program: paid time, course-specific redesign help instead of
  generic workshops, small cohorts, and explicit permission to be bad at it
  for a semester. Name the anti-patterns (the mandatory webinar, the policy
  memo with no examples). Same "stop blaming the framework" move as the
  process-theater post.
- **Draws on:** GAIT faculty-development workstream; department-chair vantage.

### 5 · Mon, Sep 14 — "Six months of xAPI data: what the dashboard actually changed"

- **Category:** Instructional Design · **File:** `2026-09-xapi-six-months.mdx`
- **Hook:** Direct sequel to the May 8 post, which ended "this system runs
  every day" — readers were promised a follow-up in everything but words.
- **Brief:** Two terms of statements. Which queries faculty actually used vs.
  the vanity dashboards; whether the early-warning signal predicted the
  drops it claimed to; the cost of living with the dual-interpretation
  `failed` schema (and whether the cleanup happened); whether the
  re-engagement effect from the first post generalized past two students.
  Numbers, regrets, next steps — same template as the original.
- **Draws on:** the running xAPI lab system.

### 6 · Mon, Sep 28 — "The entry-level IT job isn't disappearing. It's un-bundling."

- **Category:** AI & Workforce · **File:** `2026-09-entry-level-unbundling.mdx`
- **Hook:** The trolley post explicitly teased this — "the quiet structural
  shift… the thing my current research focuses on." This is the thesis post.
- **Brief:** The role-not-refilled phenomenon, developed: AI triages the
  tickets that used to be the junior's whole day, and what remains either
  promotes up (juniors doing yesterday's mid-level work) or pushes down
  (absorbed into tooling). Ground it in regional evidence — advisory-board
  conversations, local posting patterns — not national think-pieces. Close
  with what a two-year curriculum concretely does about it, pointing at the
  Fall 2026 concentrations.
- **Draws on:** the core research agenda; employer advisory boards; POV bar
  thesis ("I'm working on closing that gap").

### 7 · Mon, Oct 12 — "LMS migration is an instructional design problem, not a comms problem"

- **Category:** Teaching · **File:** `2026-10-canvas-readiness.mdx`
- **Hook:** The Canvas Implementation Taskforce (Faculty Readiness Chair,
  2026–2027) is in its first term of real work.
- **Brief:** Colleges treat LMS migration as an announcement schedule; the
  actual risk is faculty capability, and capability-building is ID work —
  audience analysis, scaffolded practice, feedback loops. What the first 90
  days of readiness work prioritized and what got explicitly cut. Warn
  against "migration theater" (checklists that measure sent emails, not
  ready courses) — a deliberate callback to the process-theater post.
- **Draws on:** Faculty Readiness Chair role; process-theater vocabulary.

### 8 · Mon, Oct 26 — "Our best AI lab is the campus data center, not the cloud"

- **Category:** Cloud & Infra · **File:** `2026-10-datacenter-ai-lab.mdx`
- **Hook:** First `Cloud & Infra` post; budget season for spring equipment.
- **Brief:** Everyone assumes AI curriculum means cloud credits. The
  contrarian case: small open models on local GPUs turn the on-campus data
  center into an AI lab with real operational consequences — extending the
  real-infrastructure argument (labs teach verbs, production teaches
  grammar) into the AI era. Cost math vs. credits that expire; students who
  rack the GPU node learn infrastructure and AI in the same motion. Be
  honest about where cloud still wins (AI-102 alignment needs Azure).
- **Draws on:** live on-campus data center, student-worker rotation model,
  real-infrastructure post.

### 9 · Mon, Nov 9 — "LLMs are ID tools. Most L&D teams are using them as typing tools."

- **Category:** Instructional Design · **File:** `2026-11-llms-id-tools.mdx`
- **Hook:** DevLearn week — the L&D audience is paying attention (and
  remembers the 2016 Best in Show).
- **Brief:** L&D's dominant genAI use is drafting faster — the same courses,
  sooner. The leverage is on the analysis and evaluation ends: mining
  transcripts and tickets for real needs assessment, RAG over product docs
  to flag stale modules, agents that watch for drift between what the
  course says and what the product does. Warning threaded through: AI
  accelerates process theater as happily as it accelerates process.
- **Draws on:** the LLMs/RAG/agents speaking topic; VMware content-manager
  years; process-theater post.

### 10 · Mon, Nov 23 — "What employer advisory boards taught me about the 2027 entry-level hire"

- **Category:** AI & Workforce · **File:** `2026-11-advisory-board-signals.mdx`
- **Hook:** Thanksgiving week — short, listy, high-signal (the calendar's
  deliberate light slot).
- **Brief:** Synthesized (and anonymized) signals from a year of advisory
  meetings and industry partnerships: the gap between what employers say
  they want, what their postings ask for, and who they actually hire. Five
  to seven concrete observations, each with the "so the curriculum now does
  X" consequence. No inspiration, just field notes.
- **Draws on:** Red Hat / Palo Alto partnerships; high-school advisory work.

### 11 · Mon, Dec 7 — "Building an AI degree in 2026: the year-end audit, plus falsifiable 2027 predictions"

- **Category:** Research · **File:** `2026-12-year-end-audit.mdx`
- **Hook:** Year-end review season — but with receipts instead of vibes.
- **Brief:** An honest audit of the AI-program year: enrollment reality vs.
  hope, curriculum revisions already needed (AI moves faster than course
  approval cycles — the governance tension the Curriculum Committee chair
  now owns), what employers validated or vetoed. Then 3–5 predictions for
  2027 stated so they can be graded — because next December, they will be.
- **Draws on:** GAIT, committee chair role, the whole year of posts.

### 12 · Mon, Dec 21 — "Things I changed my mind about in 2026" *(flex slot)*

- **Category:** Notes · **File:** `2026-12-changed-my-mind.mdx`
- **Hook:** Holiday week; first `Notes` post — short by design, skippable
  without breaking the cadence if the break wins.
- **Brief:** One changed mind per 2026 post: what the xAPI data disproved,
  where the five-concentration bet wobbled, which advisory-board signal
  reversed. Self-audit format, cheap to write over break, and it seeds the
  January calendar.

---

## Backlog (swap-ins if a slot's hook evaporates)

- **Writing a Sophia course vs. teaching your own classroom** (ID) — course
  authoring for a national platform: no eye contact, no mid-lecture repair,
  assessment-first design.
- **What Azure AI-102 gets wrong about entry-level AI work** (AI & Workforce)
  — cert-alignment honesty from someone who aligned a course to it anyway.
- **Teaching AI skepticism to non-majors** (Teaching) — the Wingate Digital
  Wellness & AI honors course; what "digital wellness" means when the
  syllabus includes agents.
- **RH134 as a course spine** (Cloud & Infra) — designing NOS 220 async
  against Red Hat objectives; when vendor curricula help and when they
  hollow a course out.
- **Grant writing at a community college** (Research) — hold until the
  ASPIRE-IT decision lands; process-focused either way.
- **Assessment redesign in the AI era** (Teaching) — authentic assessment
  as the only integrity policy that survives contact with agents.

## Standing production notes

- Publish Mondays; the grid is May 11 + 14n. If a slot slips, slip the post,
  not the grid.
- Every post gets a `description` written as a subtitle, not a summary —
  match the existing five.
- Posts 5, 6, 7, 9 explicitly call back to earlier posts; link them (`/writing/…`).
- After each publish: the post auto-appears on `/cv` (Writing section) and
  the home page — regenerate `public/cv.pdf` (`npm run cv:pdf`) as part of
  the publish commit.
