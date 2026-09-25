# Case context: IES AI-native platform prototype

Read this file before building anything. It is the source of truth for what we are building and why.

---

## 1. The case (Intuit PM intern case study)

**Brief:** Evolve Intuit Enterprise Suite (IES) from an integrated mid-market suite into an AI-native business platform for mid-market companies (50–2,500 employees) and the developers/ISVs who build for them.

**Primary deliverable:** a clickable, interactive prototype, navigable in 10–15 minutes, demonstrating the key AI moments (agent workflows, expert handoff, developer experience).

**Other deliverables (not built here):** ≤10-slide deck, ≤3-minute video.

**The case explicitly asks the prototype to show:**
- AI agents, services and APIs for customers and developers
- The human + AI operating model: what is autonomous, what is assisted, when experts step in
- The developer journey: discovery → onboarding → building → publishing → monetisation

**Product name:** Concert.

---

## 2. The core pattern (applies to every screen)

Every AI action in the product is visibly one of three types, shown as a consistent badge:

| Badge | Meaning | Example |
|---|---|---|
| **Automated** | AI does it alone | Bank transaction matching |
| **Assisted** | AI drafts, a human reviews and approves | Drafted adjusting entry |
| **Human handoff** | AI recommends a vetted expert when confidence is low or the topic is regulated; the user confirms (and sees the price) before anyone is booked | Multi-state tax question |

Tasks are not fixed in a bucket. They **earn** their way from Assisted to Automated by proving accuracy over time, and can be moved back to Assisted if they make a mistake (see F1). Both changes need the controller's approval.

---

## 3. Personas and problem statements

### Finance leader (controller / CFO / owner at a multi-entity mid-market company)

**FL-1 — Close, silos, multi-entity**
- I am a controller at a multi-entity mid-market firm.
- I am trying to close consolidated books fast and give leadership decision-ready numbers.
- But the close takes 10–15 working days of manual reconciliation.
- Because data sits in disconnected tools, and even IES keeps connected workforce data separate from the books.
- Which makes me feel buried in manual work, and I don't trust the automation enough to hand it over.

**FL-2 — Access to expertise**
- I am a CFO or owner without in-house tax or FP&A specialists.
- I am trying to make high-stakes calls with expert backing when they come up.
- But expertise costs $3–15k/month and is hard to find.
- Because of a structural accountant shortage.
- Which makes me feel stuck making calls alone.

### Developer / ISV building for mid-market finance teams

**DEV-1 — Integrations and data-thin APIs**
- I am an ISV building on IES.
- I am trying to build products that work across a customer's whole group of entities.
- But I must connect to each entity separately; there is no cross-entity or intercompany API; premium APIs are gated.
- Because IES runs on the QuickBooks Online API, and IES-only APIs are only "planned for the future".
- Which makes me feel burdened: the features customers pay for are the ones I can't reach.

**DEV-2 — Agent frameworks and monetisation**
- I am a developer who wants to build AI agents for IES customers.
- I am trying to build, distribute and earn from agents on IES.
- But there is no framework for third-party agents, the local MCP server is painful to set up, and the economics are fees with no revenue share.
- Because the platform was designed for data-sync apps paying for access.
- Which makes me feel taxed, not partnered with, and weighing whether to build here at all.

---

## 4. Ideal states (customer voice, by bucket)

**FL-1**
- Automated: "Transactions from every entity and every tool reconcile continuously, and intercompany eliminations just happen. By month-end most of the close is done."
- Assisted: "I get a prepared close: exceptions flagged, adjustments drafted, variances explained. I review and approve, and I can see why it made each call."
- Handoff: "Anything unusual or material comes to me or an expert with context attached."
- Trust: "I trust it because it shows its work and proved itself on small things first."

**FL-2**
- Automated: "Deadlines, filings and compliance checks are watched for me."
- Assisted: "When I face a decision, I get a drafted analysis with my own numbers pulled in."
- Handoff: "When the AI isn't confident, a qualified expert who can already see my data picks it up inside the product. I pay for the question, not a retainer."

**DEV-1**
- Automated: "I connect once to a customer's whole group. Entities, dimensions and intercompany data come through."
- Assisted: "The tooling tells me what IES data exists and how to use it."
- Handoff: "When docs and AI can't solve it, I reach an Intuit engineer who knows the answer."

**DEV-2**
- Automated: "Auth, hosting and security checks for my agent are handled."
- Assisted: "The platform helps me get my agent in front of the customers who need it."
- Handoff: "My agent can pass work to the customer or an expert when unsure, using the same pattern as IES's own agents."
- Outside the buckets: "When my agent creates value, I earn from it."

---

## 5. Features selected for the prototype

### F1 — Continuous Close with Earned Autonomy (finance, MVP / quick win)
- Reconciliation and intercompany eliminations run continuously all month across every entity; the close becomes a "close-readiness score" instead of a month-end scramble.
- Each AI task starts as **Assisted**. The system tracks accuracy per task type and per entity, and proposes promoting a task to **Automated** only once it has proven itself (e.g., "Bank matching: 98% accurate over 3 months — promote to Automated?").
- Every AI action is logged, explained ("why the AI proposed this") and reversible.
- Material or unusual items route to the controller.
- **Why it's different from today's IES:** IES already lets users set how much automation runs. Earned Autonomy makes autonomy something a task earns from its track record, not a setting.

**Promotion/demotion mechanic**
- Accuracy threshold is tracked per task type AND per entity (a task can be reliable in one entity's data and not another's).
- Promotion: when a task has met its accuracy threshold for enough consecutive months (prototype: 95% for 3 months for bank matching; 97% for intercompany eliminations), the controller is offered "Promote to Automated" or "Keep as Assisted". Promotion is never automatic.
- When a promoted (Automated) task makes an error, the controller is notified and given the option to demote it back to Assisted. Demotion is not automatic.
- "Reversible" means reversible within the tracked accuracy window. Reversing an action counts as negative feedback and adjusts that task/entity's confidence score downward.

**What counts as a mistake, and how it is detected**
- A mistake is an Automated action that later turns out to be wrong (e.g., a bank line matched to the wrong invoice or amount; an intercompany elimination booked in the wrong period).
- Once a task is Automated, no one reviews it by default, so the product uses three signals to find misses:
  1. **Reversal by a person:** someone on the team undoes or corrects an Automated action.
  2. **Contradiction by a later record:** a later event disagrees with the action (e.g., an invoice the AI marked paid receives a second payment and becomes overpaid; a vendor statement shows a bill still open; an account stops reconciling).
  3. **Spot checks:** **4%** of Automated actions are still routed to a person for review as Assisted. This keeps a promoted task producing a measurable accuracy figure, so earned autonomy can be re-checked instead of assumed.

**How a miss is flagged**
- A new item appears in the exception queue with the Automated badge and a warning flag, stating what happened, how it was caught (which of the three signals), the action's original confidence, and what was fixed.
- The task's track record is updated (the month of the miss is marked).
- The controller is **always notified** of a miss. Demotion is **recommended** only when (a) the task's accuracy falls below its threshold, or (b) the miss is **material** (prototype: over **$10,000**). This avoids nagging about one small miss on a task that is 99.9% right.
- The controller chooses "Move back to Assisted" or "Keep Automated". A demoted task can earn Automated again by meeting its threshold for the required months.

**How it appears in the prototype (exception queue, "Earned autonomy" section)**
- Promotion example: Bank matching at Cedarline Freight LLC, 98.2% accurate over 3 months (3,576 of 3,640), threshold 95%.
- Demotion example: Intercompany eliminations at Cedarline Holdings, Inc. (Automated) eliminated a $24,500.00 management fee with Cedarline Freight Texas a month early. Caught by a spot check; the reviewer reversed and rebooked it. September accuracy is 97.4% (37 of 38), still above the 97% threshold, but the miss is material, so the AI recommends moving the task back to Assisted.

### F3 — Expert Handoff (finance, bold bet)

**Trigger (automated)**
- AI evaluates every task it works on for (a) a confidence score, and (b) topic category.
- Confidence below ~70% triggers a handoff suggestion.
- Certain categories always trigger a suggestion regardless of confidence: multi-state tax, entity restructuring, M&A, audit prep. These are flagged as high-liability/regulated, not just low-confidence.

**Decision (assisted — human must confirm)**
- The AI does NOT auto-book an expert. It surfaces a card: its attempted answer, confidence score, why it's unsure, and a recommendation to loop in an expert.
- Pricing is shown upfront on this same card, before the user commits.
- The controller/CFO clicks to confirm the handoff. One click, explicit consent, no surprise charge.

**Execution (automated once confirmed)**
- Context is auto-packaged: relevant transactions, entity, the AI's draft answer, and its confidence reasoning. The user does not re-explain anything.
- Routes to a vetted expert from the network (credentialed CPAs, tax specialists, CAS firms — not Intuit employees).

**Business model**
- Pay-per-question, not a retainer or subscription. This directly answers FL-2's pain of being priced out of ongoing advisory help.
- Price shown before the user confirms.
- Revenue split: Intuit takes a platform fee, the expert takes the rest.
- D5 (Expert Network API, roadmap) would let third-party ISVs/advisory firms join this same expert pool.

**Learning loop**
- The expert's answer feeds back into the model as training signal, so the AI's confidence on similar future questions improves over time. This is the same "earn autonomy" mechanism as F1, applied to advisory topics instead of reconciliation.

**Known assumptions (flag as LOFA, not fact)**
- The confidence threshold, exact pricing, and revenue split are all assumed, not evidenced. Do not present these as researched figures anywhere in the UI — label placeholder numbers as illustrative.

**Why it's different:** IES today offers setup/support staff (account managers, customer success), not domain advisory at the moment of need.

### D1 — Group-Level IES API (developer, bold bet, sequenced first)
- One connection covers a customer's whole group of entities.
- Cross-entity reads, intercompany transactions, dimensions, consolidated reports, and group-level events/webhooks.
- **Why it's different:** today each IES entity is a separate connection; the API can't post across entities or create intercompany transactions; no consolidated-report endpoint was found.

**Token model**
- Presented to the developer and customer as a single "Connect" flow covering the whole group (one consent screen).
- Internally, the credential carries per-entity scopes, so a customer can select which entities to include, and access can be revoked per entity rather than all-or-nothing.
- This is a deliberate hybrid: simple on the surface, granular underneath, matching how enterprise platforms typically scope multi-entity access.
- **The consent decision belongs to the customer, not the developer.** A developer's own sandbox is always fully connected (see D2's "no OAuth redirect pain") — there is nothing for them to authorize. The per-entity consent screen is something a real customer sees once, in their own IES account, when they choose to install an agent. A developer building against the sandbox should only ever be shown that screen as a non-interactive preview of what their customer will see, never as a control they operate themselves.

### D2 — Agent Studio & Marketplace (developer, bold bet)
- Build: Intuit-hosted agents with managed OAuth, multi-tenant setup, and a sandbox pre-loaded with a multi-entity company. No local server or OAuth redirect pain.
- Declare: each agent declares which actions are Automated / Assisted / Handoff.
- Publish: agents are listed in an in-product marketplace, surfaced inside IES at the moment of need, with a trust badge.
- Earn: billed through Intuit with a revenue share to the developer.
- **Why it's different:** today's marketplace is the shared QuickBooks one (Apps.com); partner tiers charge developers ($0 / $300 / $1,700 / $4,500 per month plus metered reads); no revenue share exists; Intuit's agents are first-party only.

**Trust model (tiered)**
- Baseline: all listed agents pass an Intuit security/technical review before publishing (matches real App Partner Program assessment). This review covers security, not financial-advice quality. UI should state this distinction explicitly, e.g. "Reviewed for security".
- Liability: by default, liability for an agent's output sits with the user who installs it (ToS-based, standard disclaimer), not with Intuit or the developer. This is a deliberate design choice to keep Intuit's and developers' exposure low — flag as a stated assumption/LOFA, not settled fact.
- Trust badge: a second, separate layer on top of the security review. Users who've used an installed agent can rate it as "trustworthy." Once a threshold number of ratings is reached AND a threshold percentage rate it trustworthy, the agent is labeled "Community trusted." This is crowd-sourced, distinct from Intuit's baseline review.

**Agent declaration**
- For this prototype, an agent's Automated/Assisted/Handoff actions are shown as descriptive text in its marketplace listing (not a machine-enforced schema — that's D3, Agent Trust Contract, currently roadmap-only). Label this as a simplification if asked.

**Revenue share**
- Calculated per active install (not per API call or per transaction).

### Not in the prototype (roadmap only)
- F2 Bring-Your-Stack Ledger (medium term)
- D3 Agent Trust Contract (medium term; depends on F1's trust ledger)
- D5 Expert Network API (long term; depends on F3)
- Dropped: F4 Decision Room, F5 Compliance Radar, D4 Dev Copilot

### Known business-model assumptions (LOFAs)
- F1's demotion notification UX is assumed, not tested.
- F1's spot-check rate (4%), materiality limit ($10,000), promotion thresholds (95% / 97%) and required months (3) are placeholder numbers, not evidenced.
- F1's close-readiness target (95, the "ready to close" zone on the dial) is a placeholder number, not evidenced. The concept it stands for is real — a close never needs to hit a literal 100 before the books lock, because some items are immaterial, or by design stay open until later in the cycle (an accrual to true up next month, an expert-dependent item like the Arizona tax question) — but the exact cutoff of 95 is illustrative, not derived from a close-management benchmark.
- F1's rule for when demotion is recommended (below threshold, or a material miss) is a design position, not validated with controllers.
- F3's expert names, credentials, prices ($180 / $220 per question) and response times shown in the prototype are fictional and illustrative.
- D2's liability model (user-assumed risk) is a stated design position, not a resolved legal answer.
- D2's trust-score thresholds (rating count and percentage) are placeholder numbers.
- D1's per-entity scoping adds backend complexity not reflected in the simple "one connect" UI shown to users.
- D2's revenue split (70% developer / 30% platform fee), Flowcast's price ($220/month default), and its installs-and-revenue history are placeholder numbers, not evidenced.
- D2's "Test in your sandbox" is a fixed illustrative preview, not a live computation against whatever's currently saved in Agent Studio — editing a declared action's text does not change the test's outcome, since Flowcast's real decision logic runs off-platform, in Ridgeline Software's own systems, which this prototype cannot call.

---

## 6. Prototype structure and current build

This section describes what the prototype actually shows today. Keep it in sync with the build; it is the source for the deck and the video.

### Build status

| Area | Route | Status |
|---|---|---|
| Landing page | `/` | Built |
| Finance hub | `/finance` | Built |
| Finance screens 1–4 | `/finance/close-dashboard` … `/finance/expert-handoff` | Built |
| Developer hub | `/developer` | Built |
| Developer screens 1–5 | `/developer/discovery` … `/developer/monetisation` | Built |
| Connecting screen | `/together` | Built |

### Demo company (fictional, all figures illustrative)

**Cedarline Group**, regional freight and cold-chain logistics, 640 employees, HQ Denver. Six entities across three states:

| Entity | State | Close readiness (start) |
|---|---|---|
| Cedarline Holdings, Inc. (parent) | Colorado | 91 |
| Cedarline Freight LLC | Colorado | 84 |
| Cedarline Cold Storage LLC | Colorado | 66 (flagged "Needs attention") |
| Cedarline Freight Texas LLC | Texas | 79 |
| Cedarline Fleet Services LLC | Texas | 88 |
| Cedarline Distribution Arizona LLC | Arizona | 72 |

Close period: September 2026, close workday 2 of a 4-day target (last month took 9 workdays). Group readiness starts at **78** with **15** exceptions. AI actions this month: 5,371 (4,902 Automated, 461 Assisted, 8 Human handoff). All data lives in `data/company.ts`; journey steps in `data/journeys.ts`.

### Landing page

Header with the product mark and links to Finance and Developers. Product name; one-line vision ("The AI-native platform for mid-market finance, where the AI shows its work, earns its autonomy, and calls in an expert when it should."); a legend table "Every AI action says who is responsible" (what each badge means, who is accountable, an example from the Cedarline close); a line explaining that tasks start Assisted and earn Automated; a "Get started" section with two entry cards, "I'm a finance leader" (links to `/finance`, "Open Finance") and "I'm a developer" (links to `/developer`, "Open Developer platform"), each listing its own screens. Footer: "Cedarline Group is a fictional company. All figures are illustrative."

### Navigation model: hub and spoke

**Finance hub (`/finance`)**
A landing page for the finance persona listing all 4 screens as clickable cards, in any order:
1. Close dashboard
2. Exception queue
3. Assisted fix
4. Multi-state tax review

Each card shows a one-line description of what that screen demonstrates, written as real product copy (see copy rules below), not demo narration. A visible step indicator (e.g. "Step 2 of 4") still appears once inside a screen, and each screen has Next/Back controls so a reviewer can walk the full sequence in order if they choose — but every screen must also be enterable directly from the hub, in any order, without depending on state set by a previous screen.

**Developer hub (`/developer`)**
Same pattern, for the 5 developer screens:
1. Agent Studio
2. Marketplace listing
3. Group-Level API
4. API explorer
5. Revenue

**Self-contained screens**
Because screens can be entered out of order, each screen has a short context line at the top establishing what state the viewer is looking at — written as real in-product UI copy (e.g. a subheading or status line a real user would see), not a meta-explanation of the demo. Screens do not assume the state left behind by a prior screen — each screen loads its own complete mock state from `/data`. **One exception:** the expert handoff decision (sent / not now / not decided) is shared, because an expert's answer only exists if the controller asked for one. It is read by the Multi-state tax review screen (which handles all three states — undecided, declined, answered — on one screen, rather than splitting "recommend" and "resolve" across two) and by the Arizona row in the exception queue. **A second, equivalent exception on the developer side:** Flowcast's listing details and declared actions are shared between Agent Studio (which edits them) and Marketplace listing (which displays them), for the same reason — a customer's marketplace listing should reflect what the developer actually configured, not a screen-local copy. Every other developer screen (Group-Level API, API explorer, Revenue) remains fully self-contained.

**Navigation**
- Every screen has a persistent way back to its hub (not just Back to previous step).
- Next/Back still moves through the full step sequence for a reviewer walking it in order.
- The connecting screen (developer's agent inside the finance close) is reachable from both hubs, not just from the end of a forced sequence.

**Copy rules (apply to every screen)**
- The app reads as the real product, never as a demo of itself. No explaining the screen to a reviewer, no "prototype/demo/MVP/mockup/concept", no narrating the persona at the user, no meta-labels like "Feature: Expert Handoff".
- Headings say what the screen is ("Close dashboard", "Multi-state tax review"). Context lines are real status text ("6 entities | 15 open exceptions | Readiness 78/100").
- The AI's explanations are in the AI's own voice, talking to the user in-product ("I drafted this because…", "Why I'm recommending an expert").
- Confirmations, empty states and microcopy read like production SaaS copy.
- The one exception is the "Illustrative data" label (section 7), which is a disclosure.

### Hubs and shared frame (as built)

- **Finance hub (`/finance`):** heading "Finance"; status line "Cedarline Group, 6 entities | September 2026 close, workday 2 of 4 | Readiness 78 (green mini ring) | 15 open exceptions"; five numbered cards (title, one-line description, the action badges that screen features, "Open …" link) plus a sixth, dashed card "Agents in your close" linking to the connecting screen.
- **Developer hub (`/developer`):** heading "Developer platform"; status line "Sandbox: Cedarline Group, 6 entities | Group-Level API | Hosted agents"; same card layout for the five developer screens plus "Agents in your close".
- **Screen header:** product mark and workspace name ("Cedarline Group" or "Developer platform"), a "Finance home" / "Developer home" link back to the hub, "Step N of 5: <title>" and a clickable 5-segment track. The hub itself shows no step indicator.
- **Bottom bar:** "Back to <previous screen>" (screen 1 goes back to the hub), a short status or next-action hint, and one primary button to the next screen. Screen 5's button leads to the connecting screen ("See agents in your close").
- **State:** each screen starts from the same complete mock state in `/data`. Actions on a screen (approve, edit, promote, close) update that screen only. The two exceptions are the expert handoff decision and Flowcast's agent config (see the navigation model above), both kept for the browser session via `sessionStorage` (`lib/handoff-store.ts`, `lib/agent-store.ts`).

### Finance screens (as built)

Each screen has a heading, an in-product status line, and the "Illustrative data" label. The AI's explanations are written in its own voice ("Why I drafted this", "What I learned").

1. **Close dashboard.** Status line: "September 2026 close | Cedarline Group, 6 entities | Workday 2 of 4 | Readiness 78 | 15 open exceptions", with readiness shown as a green mini ring. Close readiness shown as the readiness dial (78 in large green type inside a 270° ring of ticks, a soft rounded "ready zone" band and legend from 95 to 100, "17 to target 95") beside context (workday, last month's close of 9 workdays, exceptions, intercompany pairs eliminated 35 of 38); "What the AI did this month" by badge (4,902 / 461 / 8); readiness by entity table with a green mini ring per entity and for the group total (Cold Storage flagged "Needs attention"); recent AI activity log where reversible actions have a Reverse button (reversed actions are struck through, including an intercompany elimination reversed by a spot check), and — in its correct chronological position alongside Concert's own entries — a Flowcast-sourced row (a marketplace agent, captioned "Flowcast, from Ridgeline Software" instead of an entity name), reversible the same way as any native row; see the connecting screen below. Next: "Review exceptions".
2. **Exception queue.** Status line: "September 2026 close | 15 open exceptions | 2 autonomy decisions waiting". An "Earned autonomy" section ("Tasks move between Assisted and Automated based on their accuracy at each entity. Nothing changes until you approve it.") with two panels:
   - **Promotion:** bank matching at Cedarline Freight LLC, 98.2% over 3 months (3,576 of 3,640), 6-month accuracy record, Promote to Automated / Keep as Assisted.
   - **Demotion:** intercompany eliminations at Cedarline Holdings, Inc. The AI explains in its own voice that it eliminated a $24,500.00 fee a month early; how it was caught (spot check, 4%); what was fixed; "…over your $10,000.00 materiality limit, so I recommend moving it back to Assisted"; September marked "1 miss" in the track record; Move back to Assisted / Keep Automated.

   Below: the "Needs a person" table (7 highest-priority of 15), every row badged with confidence, amount and status; material items flagged in dark red; a failed bank feed flagged as an error. "Review draft" opens Assisted fix and "Review handoff" opens the multi-state tax review. Next: "Review drafted entry".
3. **Assisted fix.** Heading "Review drafted entry". Status line: "Cedarline Cold Storage LLC | Journal entry JE-0930-017 | Draft, awaiting your approval | Medium confidence, 88%" (the status updates to "Approved and posted" or "Reversed"). Drafted journal entry (accrue $18,400.00 unbilled freight; Dr 6120 Freight in, Cr 2110 Accrued liabilities; auto-reverses Oct 1) beside "Why I drafted this": first-person reasoning that flags the above-contract PO, medium confidence 88% with the 95% promotion mark, sources (3 POs), checks (one failed: PO-5562 billed 4% above contract), comparable history (approved 23 of 24 times). Edit amount (contract-rate total $18,157.69 suggested), Approve and post entry, activity log (AI drafted, you changed, you approved), Reverse entry (counts as a miss for accrual drafting). Next: "Review the tax question".
4. **Multi-state tax review.** One screen, not two — it used to be split into "Expert handoff" and "Resolution," but both carried the same title and Resolution already duplicated Expert handoff's recommendation card whenever nothing had been sent yet, so the two were folded into one screen with two states, the same "screen that changes shape as you act on it" pattern Assisted fix already uses. A three-stage strip (Flagged → You decide → Sent with context) is always shown, and a "Close readiness" dial sits in the right column throughout.
   - **Not yet sent (undecided or declined):** status line "Cedarline Cold Storage LLC | Arizona tax question | Low confidence, 58% | Expert recommended, not booked". If declined, a dark-red warning leads: "Unreviewed AI draft. Don't use it for filing or accrual decisions. You chose not to send this question to an expert." The "My draft answer" panel holds the question, the 58% draft, what the AI couldn't determine (where customers took delivery), and "Why I'm recommending an expert" (confidence below 70%; multi-state tax is regulated; no precedent in the group). Below it, "Choose an expert": the recommended expert (Dana Whitfield, CPA, 14 years, licensed AZ/CO/TX, 4.9 from 312 questions, $180.00 per question, within 4 business hours) with "Compare 2 experts", the price before commitment ("Illustrative price. Charged once, when you confirm."), and Confirm and send / Not now. The right column shows "What the expert receives", the packaged context, with a note that experts are independent CPAs and firms who see only this.
   - **Sent:** status line becomes "… | Answered by Dana Whitfield, CPA | Accrual awaiting your approval" (then "Closed"). The recommendation collapses to one line — "My draft answer" now just recaps the 58% draft above "✓ Sent to Dana Whitfield, CPA · $180.00", with an "Undo send" — and the expert's answer appears in its place (register for Arizona transaction privilege tax; accrue on the 29 Arizona-delivered invoices; flag future inventory moves), received in 3 hours 12 minutes, plus an Assisted accrual drafted from it ($4,871.25; Dr 6410 Sales and use tax expense, Cr 2235 Sales tax payable, Arizona). "Approve accrual and close item" closes the item; the readiness dial counts up from 78 to **83** ("12 to target 95") and Cold Storage goes 66 → 81. The right column swaps to "What I learned," in the AI's voice: inventory held in a new state is now a physical-presence signal flagged for all 6 entities; tax questions still go to an expert because the topic is regulated, but with a stronger draft.

   Next: "See agents in your close".

### Developer screens (as built)

The developer's sandbox customer is Cedarline Group, the same 6 entities as the finance side; Cedarline Cold Storage LLC is flagged in both (low close readiness on the finance side, a projected cash shortfall here). The through-line ISV is **Ridgeline Software**, and the agent built across these screens is **Flowcast**, a multi-entity cash flow forecaster (fictional, illustrative pricing and figures throughout).

1. **Agent Studio.** Status line: "Sandbox: Cedarline Group | Flowcast | Editing" (or "Saved"). Flowcast's identity (name, icon) is fixed; everything else is an editable form, seeded from Flowcast's current saved listing and committed only on "Save configuration" (a local draft, matching how a real settings form behaves):
   - **Listing details:** tagline, category, description and price, each a plain editable field.
   - **Declared actions:** up to 5 rows, each with a type toggle (Automated / Assisted / Human handoff, styled like the badge itself) and an editable description. Actions can be added ("Add a declared action") or removed. The panel is explicit that this is a declaration customers read, "not code Intuit runs" — Flowcast's actual decision logic runs in Ridgeline Software's own systems, never on this screen.
   - **Auth and hosting** checklist (managed OAuth, multi-tenant hosting, a pre-loaded sandbox) is fixed, not editable.
   - **"Test in your sandbox"** stays a canned preview (Cedarline Cold Storage LLC flagged, balance $41,920.35 against a $50,000.00 minimum, projected in 9 days) — framed as illustrative, not a live call to Flowcast's real logic, so it does not change if you edit a declared action's text.
   - Saving writes to the shared agent-config store (see above), so Marketplace listing reflects it immediately. Next: "Publish the agent".
2. **Marketplace listing.** Status line: "Flowcast | Live since April 2, 2026 | Reviewed for security". A listing preview as a customer would see it, reading live from whatever was last saved in Agent Studio: the agent's icon, tagline, price and description, then every declared action as a badge **with its full description text** (not just a bare badge — this is the "descriptive text in its marketplace listing" the spec calls for), a "Reviewed for security" badge, and either "Community trusted" or a ratings-so-far count. A "Trust on the marketplace" panel explains the two tiers by name (the security review checks security, not advice quality; Community trusted needs both a ratings-count threshold and a trustworthy-percentage threshold — Flowcast has 34 of the 50 ratings needed, at 91% trustworthy against an 85% bar, so it is not yet eligible). A "Liability" panel states plainly that liability for an installed agent's output sits with the customer who installed it. Next: "See the group-level API Flowcast is built on".
3. **Group-Level API.** Status line: "Sandbox: Cedarline Group | 6 entities | One connection for the group". A side-by-side code comparison — "Today: one connection per entity" (looping per-entity calls, no consolidated or intercompany endpoint) against "Group-Level API: one connection for the whole group" (one call returning every entity's balance, the consolidated total, and pending intercompany transfers) — with the two real supporting figures cited by source (Intuit App Partner Program Guide; Intuit IES developer FAQ). A "What's available" list: cross-entity reads, intercompany transactions, dimensions, consolidated reports, group-level events/webhooks. Next: "Try the group-level API".
4. **API explorer.** Status line: "Sandbox: Cedarline Group | 6 entities | Always connected". The developer's sandbox is always fully connected — no consent step, matching D2's "no OAuth redirect pain." A "Your sandbox" panel lists the 6 entities as fixed, read-only context (not a control). "Try a request" sends `GET /v1/groups/cedarline-group/cash-position` and returns one JSON response across all 6 entities, the consolidated total, and pending intercompany transfers, including Cedarline Cold Storage LLC's balance below its minimum threshold — the same balance Flowcast's cash shortfall alert flags. A separate "What your customer sees" panel shows the per-entity consent screen from D1's token model as a disabled, greyed-out preview only, captioned "Your customer sees and controls this screen." — it is never something the developer can click. Next: "See revenue".
5. **Revenue.** Status line: "Flowcast | 168 active installs | Next payout $25,872.00 on October 15, 2026". Four stat tiles — active installs, this month's revenue share (with the total billed to customers alongside it), lifetime revenue share (with lifetime total billed), and the developer's split (70%) — plus a 6-month installs-and-revenue table (April through September 2026, growing from 6 to 168 active installs) with both **total billed** and **your share (70%)** columns, and a "Next payout" panel. Revenue is calculated per active install, split 70% developer / 30% platform fee (both illustrative); the historical billed price is fixed at $220.00/month regardless of whatever price is currently saved in Agent Studio, since past months don't change retroactively. Next: "See agents in your close".

**Connecting screen (reachable from both hubs).** "Agents in your close." Reachable from either hub, so it's written as an observer's caption rather than assuming which persona arrived — "Here's what shows up in Cedarline Group's close once Flowcast is installed," the same pattern Marketplace listing already uses ("This is what a customer sees...") rather than assuming the reader is either the controller or the developer. In-universe, this is really the finance controller's screen; a developer would never see inside a real customer's close, so their path here is framed as a preview of that screen, not their own.
- **Installed agent:** Flowcast's profile — icon, tagline, "by Ridgeline Software," install date (September 14, 2026), Reviewed for security, and either Community trusted or a ratings-so-far count — read live from the same agent-config store Agent Studio writes to, with a link to the full Marketplace listing.
- **Recent AI activity:** one real logged action, styled identically to the Close dashboard's own activity table — Flowcast flagged Cedarline Cold Storage LLC's balance below its minimum, labelled Automated, captioned "By Flowcast" instead of an entity name.
- **What else Flowcast does here:** its other declared actions (Assisted, Human handoff), read live from the store.
- **How marketplace agents are labelled:** states the trust-pattern message plainly — every marketplace agent's actions carry the same three labels as Concert's own, whoever built it.
- Cedarline Group is one of Flowcast's 168 active installs (the same figure shown on Revenue), not a separate invented example.
- **Bidirectional:** the same Flowcast flag also appears in the Close dashboard's own "Recent AI activity" table (see below), in its correct chronological position, reversible through the same mechanism as any native row — the connection isn't only visible on this one capstone screen.

---

## 7. Build rules

- Web app (Next.js + Tailwind + shadcn/ui), desktop-first, must work at 390px mobile width.
- All data is static mock data in `/data`. No backend, no API keys, no live AI calls — AI responses are pre-scripted.
- The demo company is fictional. Every screen with numbers shows a small **"Illustrative data"** label.
- Do not present the illustrative numbers as research findings.
- No Intuit logos or copied Intuit branding.
- Every step has a clear next action; no dead ends; the whole thing is navigable in 10–15 minutes.
- Follow `/docs/design.md` for all visual decisions. Summary: calm, "audited workpaper" feel; IBM Plex Sans only (Plex Mono for code); cool ledger-grey background with dark-ink buttons, so colour appears only on AI badges and status. Badges: **Automated** solid teal, **Assisted** tinted slate blue, **Human handoff** white with burnt-orange border, each with its own icon. Warnings are bold dark red, errors a brighter red, told apart by icon and weight. Confidence is shown as words first ("Low confidence, 58%") on a monochrome 10-segment bar with a notch at the promotion threshold. Close readiness has its own green accent: an instrument-style dial (270° ring of ticks, score large in the centre, a rounded "ready zone" band and legend from 95 to 100) and a green mini ring in tables and status lines. Finance conventions: tabular figures, negatives in parentheses, double rule above totals. Light mode only. Copy reads as the real product, never as a demo (see the copy rules in section 6); the AI explains itself in the first person.

---

## 8. Real research figures (for copy and callouts only — always label the source type)

Use these only where a screen needs a real-world reference point, and keep the source label.

| Figure | Source | Type |
|---|---|---|
| Mid-market close takes 10–15 working days | FloQast 2025 (via Onetribe) | Vendor |
| Enterprise median close 6.4 days | APQC (2,300 orgs, 2017 data) | Independent, dated |
| Growing businesses use ~10 software programs | Intuit 2024 survey | Vendor (Intuit) |
| Record-low 27,994 new CPA exam candidates in 2024 | NASBA data | Independent |
| 300,000+ accountants left the field 2019–22 | CPA Journal citing WSJ | Independent |
| Fractional CFO $3–15k/month | Various providers | Vendor |
| CAS advisory median ~$3,000/month per client | CPA.com | Industry body |
| 11% of CFOs actively use AI in core finance | L.E.K. 2025 (~100 CFOs) | Independent |
| 48% of CFOs say they'd follow AI over their judgment | Board survey (100 CFOs) | Vendor |
| 27% cite unclear ownership when an AI decision goes wrong | Board survey (100 COOs) | Vendor |
| IES partner tiers: $0 / $300 / $1,700 / $4,500 per month | Intuit App Partner Program Guide | Primary |
| IES API: one connection per entity; no cross-entity posting or intercompany creation | Intuit IES developer FAQ | Primary |

**Real user voice (paraphrase in UI; do not invent quotes):**
- IES users praise consolidation for ending manual consolidated statements, but some call the AI "pretty much always wrong" and want to switch it off.
- Developers have dropped or removed QuickBooks integrations over the fee change; an IES developer calls inaccessible custom fields, dimensions and projects "a real burden".

---

## 9. Open items

- Whether Intuit's announced customer-built agents (Anthropic partnership, Feb 2026) are live — treat as "announced", not "live", in any copy.
