@AGENTS.md

# Project: IES AI-native platform prototype

A clickable prototype for an Intuit PM case study. Intuit Enterprise Suite (IES) is evolving from a mid-market finance suite into an AI-native business platform.

**Product name:** Concert.

**Source of truth:** `CASE_CONTEXT.md` has the full context (problem statements, ideal states, journey steps, research figures). Read it before building any new screen. Where it goes into more detail than this file, follow it.

**Keep `CASE_CONTEXT.md` current.** It will be used to build the presentation and the video, so it must always reflect the product as built. After any change to a screen, mechanic, data figure or assumption, update the matching part of `CASE_CONTEXT.md` in the same piece of work: the feature section in section 5, the build status and screen descriptions in section 6, and the assumptions (LOFAs) list for any new placeholder number.

## Core pattern: three AI action types

Every AI action in the product is visibly one of three types:

- **Automated**: AI does it alone (e.g., bank matching)
- **Assisted**: AI drafts, a human reviews and approves (e.g., adjusting entries)
- **Human handoff**: AI routes to a real expert when confidence is low or the topic is regulated (e.g., multi-state tax)

These three labels must appear as badges, used the same way everywhere in the UI. Use one shared badge component; never restyle or rename the labels per screen.

## Persona 1: Finance leader (controller/CFO at a multi-entity mid-market company)

- **F1 Continuous Close with Earned Autonomy**: reconciliation runs all month. Each AI task starts as Assisted and is promoted to Automated only after it proves its accuracy. Every action is logged and reversible.
- **F3 Expert Handoff**: low-confidence or regulated questions go to a vetted human expert inside the product, with context packaged. Pay per question. The expert's answer improves the agent.

## Persona 2: Third-party developer/ISV

- **D1 Group-Level IES API**: one connection covers a customer's whole group of entities (today it's one connection per entity).
- **D2 Agent Studio & Marketplace**: hosted agents with managed auth, published to an in-product marketplace, billed by Intuit, with revenue share.

## Rules

- Desktop-first web app that must also work on mobile (test at 390px width).
- Stack: Next.js + Tailwind + shadcn/ui.
- All data is static mock data in `/data`. No backend, no API keys, no live AI calls. AI responses are pre-scripted.
- Every screen with numbers shows a small "Illustrative data" label.
- No Intuit logos. The UI should feel like it could live inside IES without copying Intuit branding.
- Each journey is a guided flow: the user should always know what to click next. No dead ends.
