# Design brief: [PRODUCT NAME]

Status: revision 2 (sans-serif only, orange handoff, ink buttons, light mode only). No screens built yet. Once approved, this file governs every visual decision in the prototype (see `CLAUDE.md`).

---

## 1. Who we're designing for, and what they need to feel

| Audience | Starting attitude | What the design must do |
|---|---|---|
| Finance leaders (controller, CFO) | Skeptical of AI. Some IES users call today's AI "pretty much always wrong" and want it switched off. | Show the AI's work. Make every AI action easy to inspect, easy to reverse, and clearly labelled by who is accountable. |
| Developers and ISVs | Burned by per-entity connections, fees and no revenue share. Evaluating whether to build here at all. | Look like a serious, well-engineered platform. Be precise about data, endpoints and money. |

**The feeling:** an audited workpaper, not a pitch deck. Calm, exact, nothing hidden. The product earns trust the way a good accountant does: it shows its sources, uses the conventions finance people already know, and never overstates its certainty.

**What we are not:** a flashy AI startup. No gradients, glows, sparkles, "magic" icons, purple-to-blue washes, or animated shimmer on AI output. The AI is presented as a colleague that shows its evidence, not a spectacle.

---

## 2. Design principles

1. **Evidence before assertion.** Every AI output sits next to its reason and its confidence. A number the AI produced is never shown without a way to see where it came from.
2. **Speak finance fluently.** Use accounting conventions a controller trusts on sight: negatives in parentheses, right-aligned tabular figures, a double rule above totals, tick marks for reconciled items.
3. **Accountability is always visible.** The Automated / Assisted / Human handoff badge answers "who is responsible for this?" It appears on every AI action, looks identical everywhere, and never relies on colour alone.
4. **Tables are the primary structure; cards are the exception.** Finance work happens in lists and ledgers. We don't chop content into identical cards.
5. **One bold element.** The confidence meter with its autonomy threshold (section 8) is the memorable, signature component. Everything around it stays quiet.
6. **Always show the next step.** Each screen in a guided journey has one visually dominant primary action.

---

## 3. Colour

The ground is a cool, faintly green-grey, a nod to ledger paper, deliberately not the warm cream common in AI-generated interfaces. The interface chrome is deliberately greyscale: buttons, links and navigation are dark ink. Colour appears only when the AI is doing something (the three action badges) or when something is right or wrong (status). That way colour always means something. We avoid bright green entirely so nothing reads as copied Intuit branding.

The prototype is **light mode only**.

### 3.1 Base palette

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#F3F5F4` | App background (ledger paper) |
| `--surface` | `#FFFFFF` | Tables, panels, dialogs |
| `--surface-sunken` | `#EBEFED` | Table header row, code blocks, inset areas |
| `--ink` | `#17212B` | Primary text, figures |
| `--ink-muted` | `#56636F` | Secondary text, column headers, captions (5.6:1 on canvas) |
| `--ink-faint` | `#7A868F` | Placeholder text and disabled states only; not for body text |
| `--rule` | `#D5DCD9` | Borders, table dividers |
| `--rule-strong` | `#AEB8B4` | Totals double rule, focused input borders |
| `--primary` | `#2A3440` | Primary buttons, active navigation, links (12.6:1 with white) |
| `--primary-hover` | `#17212B` | Primary hover |
| `--primary-tint` | `#E6EAE8` | Selected row background, active tab ground (neutral, not blue) |
| `--focus` | `#17212B` | 2px focus ring with 2px white offset |

### 3.2 AI action badges (the three types)

Each type has its own hue **and** its own fill style **and** its own icon, so the three stay distinguishable in greyscale and for colour-blind users. The fill level also carries meaning: the more the AI does on its own, the more solid the badge.

| Type | Hue | Badge style | Icon (lucide) | Text / fill |
|---|---|---|---|---|
| **Automated** | Deep teal | Solid fill, white text | `check-check` (not `zap`, which reads as flashy) | bg `#0E6468`, text `#FFFFFF` (6.9:1) |
| **Assisted** | Slate blue | Tinted fill with 1px border | `pen-line` | bg `#EAF0F8`, border `#A9C0DB`, text `#2D5B94` (6.0:1) |
| **Human handoff** | Burnt orange | White fill with 1px border | `user-round` | bg `#FFFFFF`, border `#E9B98E`, text `#A34A00` (5.9:1) |

Soft tints for row highlights and panel accents: Automated `#E6F1F1`, Assisted `#EAF0F8`, Handoff `#FDF0E6`.

Why these hues: teal reads as steady and mechanical; blue reads as collaborative and calm; burnt orange reads as "a person is stepping in" without the error connotation of red or the red undertone of plum. Teal, blue and orange also stay distinguishable for the common forms of colour blindness, and the fill style and icon back them up.

Rules:
- Badge text is always the full label: "Automated", "Assisted", "Human handoff". Never abbreviated, never renamed per screen.
- One shared `<ActionBadge type=… />` component. No screen restyles it.
- These three hues are reserved for AI action types. Do not reuse teal, slate blue or burnt orange for anything else (buttons, links, charts, tags).

### 3.3 Status colours

Kept separate from the badge hues so "who did it" and "is it OK" never get confused.

| Token | Hex | Use |
|---|---|---|
| `--positive` | `#2B6E4F` | Reconciled, approved, balanced (6.1:1 on white). Muted forest, not brand green. |
| `--warning` | `#8E1B1B` | Needs attention: material variances, unusual items, approaching deadlines (9.0:1 on white) |
| `--warning-tint` | `#FBECEA` | Background for flagged rows |
| `--negative` | `#B42318` | Errors: failed checks, out-of-balance, sync failures (6.6:1 on white) |
| `--negative-tint` | `#FCEBEA` | Background for rows in error |

**Warning is a bold dark red**, not amber, so it can't be mistaken for the burnt-orange Human handoff badge. Because warning and error sit in the same red family, they are told apart by treatment, never by hue alone:

| State | Text | Icon (lucide) | Container |
|---|---|---|---|
| Warning | `--warning`, weight 600 | `triangle-alert` | `--warning-tint` background, 3px `--warning` left border |
| Error | `--negative`, weight 500 | `circle-x` | Solid `--negative` fill with white text for banners; `--negative-tint` for rows |

Warnings are about *judgement* ("this variance is material, look at it"); errors are about *failure* ("this check did not pass"). Use a warning when a human should look, and an error only when something is actually broken.

### 3.4 Charts

Charts use neutral ink shades: `#2A3440`, `#6B7782`, `#AEB8B4`, and `--rule` for gridlines. Badge hues appear in charts only when the series *is* an action type (e.g., "tasks by type: Automated / Assisted / Handoff").

---

## 4. Typography

| Role | Typeface | Why |
|---|---|---|
| Everything: UI, body, titles, headline figures | **IBM Plex Sans** (400, 500, 600) | Engineered, neutral, serious; excellent tabular figures; credible to both finance and developer audiences. One family keeps the interface plain and enterprise-grade. |
| Code only | **IBM Plex Mono** (400, 500) | API requests, responses, and agent config in the developer journey. Never used for UI labels or small data. |

Both load through `next/font/google`. They replace the Geist fonts from the Next.js starter.

### 4.1 Type scale

Base 15px for dense finance UI, on a minor-third ratio (≈1.2), rounded to whole pixels.

| Token | Size / line height | Family, weight | Use |
|---|---|---|---|
| `display` | 40 / 46 | Sans 600, tracking -0.01em | Landing headline, close-readiness score |
| `h1` | 28 / 34 | Sans 600 | Page title (one per screen) |
| `h2` | 20 / 26 | Sans 600 | Section headings |
| `h3` | 16 / 22 | Sans 600 | Panel and table titles |
| `body` | 15 / 22 | Sans 400 | Default text |
| `body-strong` | 15 / 22 | Sans 500 | Emphasis, figures in tables |
| `small` | 13 / 18 | Sans 400 | Captions, column headers, helper text, "Illustrative data" |
| `badge` | 12 / 16 | Sans 500 | Badge labels only |
| `code` | 13 / 20 | Mono 400 | Code blocks |

### 4.2 Rules

- **Sentence case everywhere**: headings, buttons, column headers, badges. No all-caps labels, no letter-spaced eyebrows above headings.
- Maximum 72 characters per line for prose (AI explanations, expert answers).
- On mobile (<640px): `display` drops to 32/36, `h1` to 24/30. Everything else stays the same.

### 4.3 Numbers (finance conventions)

- Always `font-variant-numeric: tabular-nums` for any figure in a table, meter or summary.
- Right-align numeric columns, and put the column header on the same alignment.
- Currency: `$1,284,500.00` in tables; `$1.28M` only in summary figures, with the full value in a tooltip.
- Negatives in parentheses: `(12,400.00)`, in `--ink`, not red. Red is reserved for *problems*, not for negative numbers.
- Zero shown as an en dash `–` in ledgers.
- Percentages to one decimal where precision matters (`98.1%`), whole numbers in summaries (`94%`).

---

## 5. Spacing and layout

### 5.1 Spacing scale (4px base)

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon-to-label gap inside badges |
| `space-2` | 8 | Between related inline items |
| `space-3` | 12 | Table cell vertical padding, compact stacks |
| `space-4` | 16 | Table cell horizontal padding, panel padding on mobile, minimum page gutter |
| `space-6` | 24 | Panel padding on desktop, gap between panels |
| `space-8` | 32 | Between page sections |
| `space-12` | 48 | Page top padding, major section breaks |
| `space-16` | 64 | Landing page section spacing only |

### 5.2 Layout

- **App shell:** a slim left rail (desktop, 232px) with entity switcher and navigation; the main column is left-aligned with a max content width of 1200px. On mobile the rail becomes a top bar with a menu sheet.
- **Journey bar:** a single row at the top of the main column showing the guided journey: "Step 2 of 5: Exception queue", with the five steps as a thin segmented track. This is a real sequence, so numbering is appropriate here.
- **Next-step footer:** each journey screen ends with a sticky footer (bottom-right on desktop, full width on mobile) holding the one primary action for that step, e.g., "Review drafted entry". The user never has to hunt for what to click.
- **Alignment:** everything left-aligned except numeric columns (right-aligned). Nothing centred except the landing hero and empty states.

```
Desktop (≥1024px)
┌──────────┬───────────────────────────────────────────────┐
│ [PRODUCT │ Step 2 of 5: Exception queue ▬▬▬▬▭▭▭          │
│  NAME]   │                                               │
│          │ Exception queue               Illustrative data│
│ Entity ▾ │ 14 items need review across 4 entities        │
│          │ ┌───────────────────────────────────────────┐ │
│ Close    │ │ table                                     │ │
│ Queue    │ └───────────────────────────────────────────┘ │
│ Experts  │                                               │
│ Activity │                     [ Review drafted entry ]  │
└──────────┴───────────────────────────────────────────────┘

Mobile (390px)
┌───────────────────────────┐
│ ☰ [PRODUCT NAME]  Entity ▾│
│ Step 2 of 5 ▬▬▭▭▭          │
│ Exception queue            │
│ Illustrative data          │
│ ┌───────────────────────┐ │
│ │ stacked row           │ │
│ └───────────────────────┘ │
│ [ Review drafted entry  ] │
└───────────────────────────┘
```

### 5.3 Breakpoints

`sm` 640, `md` 768, `lg` 1024, `xl` 1280. Designed at 1440 desktop, verified at 390 mobile.

---

## 6. Surfaces, borders and radius

- **Borders over shadows.** Surfaces are separated by a 1px `--rule` border. Shadows appear only on floating layers (menus, dialogs, toasts): `0 8px 24px rgba(23,33,43,0.12)`.
- **Radius follows hierarchy, not one value for everything:**
  - 4px: badges, inputs, buttons, small chips
  - 6px: panels and tables
  - 10px: dialogs and sheets
  - Full pill: none. Badges are softly squared, not pills, so they read as labels rather than tags.

---

## 7. Component styles

### 7.1 Panels (our "cards")

Use a panel when content has its own title and actions (e.g., "Close readiness", "Expert profile"). Don't wrap every item in one.

- `--surface` background, 1px `--rule` border, 6px radius, no shadow.
- Header: `h3` title left, optional actions and the "Illustrative data" label right, 16px/24px padding, separated from the body by a 1px rule.
- Body padding 24px desktop, 16px mobile.
- An AI-produced panel (e.g., "Drafted adjusting entry") gets a 3px left border in its action-type hue plus the badge in the header. This is the only coloured border treatment.

### 7.2 Tables (the workhorse)

- Header row: `--surface-sunken`, `small` text in `--ink-muted`, weight 500, sentence case. No all caps.
- Rows: 44px min height (40px in "compact" views like the activity log), 12px/16px cell padding, 1px `--rule` divider between rows. No zebra striping.
- Numeric columns right-aligned, tabular figures.
- **Totals row:** a double rule on top (two 1px `--rule-strong` lines, 2px apart), weight 600. The accountant's double underline, used only for true totals.
- **Reconciled tick:** a small `--positive` check glyph in a narrow leading column for reconciled items, echoing audit tick marks.
- **Row states:** hover `#F7F9F8`; selected `--primary-tint` with a 2px `--ink` left bar; flagged for attention `--warning-tint` with a 3px `--warning` left border; in error `--negative-tint`.
- **Action type column:** the `ActionBadge` sits in its own column, placed right after the description, so the eye can scan "who's responsible" top to bottom.
- **Mobile:** tables with more than 3 columns collapse into stacked rows. The description and badge go on the first line, the key figure right-aligned on the same line, and secondary fields below in `small`.

### 7.3 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `--primary` fill, white text, 4px radius, 40px height | The single next step on a screen |
| Secondary | White fill, 1px `--rule-strong` border, `--ink` text | Alternative actions ("Edit entry") |
| Quiet | Text only, `--ink`, underlined | Tertiary ("View full log") |
| Destructive | White fill, `--negative` text and border | "Reverse action" |

Labels say exactly what happens: "Approve entry", "Send to expert", "Promote to Automated". No arrows appended. The resulting toast uses the same verb: "Entry approved", "Sent to expert".

### 7.4 "Illustrative data" label

Every screen with numbers shows it, top-right of the page header (and on each standalone panel that has figures). `small` size, `--ink-muted`, with a lucide `info` icon at 14px. Tooltip: "Figures are fictional and for demonstration only."

### 7.5 Audit trail entries

Each logged AI action is a row with: timestamp, the action in plain language ("Matched 312 bank transactions to invoices"), action badge, confidence, and a quiet "Reverse" button. Reversed entries stay in the log with a strikethrough description and a "Reversed by Priya Nair, 14 Mar" note. Nothing disappears.

---

## 8. AI confidence: the signature component

Confidence is where distrustful finance leaders decide whether to believe the product, so it gets the most care. Three rules:

1. **Words first, number second.** "High confidence, 97%", never a bare "97%".
2. **Never shown without reasons.** Every confidence display has a "Why" disclosure listing the evidence.
3. **Honest bands.** Low confidence is shown plainly and triggers the handoff route; we never hide or soften it.

### 8.1 Confidence bands

| Band | Range | Meaning in the product |
|---|---|---|
| High | 90–100% | Eligible to run as Automated if the task has earned it |
| Medium | 70–89% | AI drafts, a human reviews (Assisted) |
| Low | below 70% | AI proposes handing off to an expert |

### 8.2 The confidence meter

A horizontal bar of **10 segments** (each is 10 percentage points), 6px tall, 2px gaps between segments.

- Filled segments in `--ink`; unfilled in `--rule`. The partially filled final segment fills proportionally.
- A **threshold notch**: a 2px vertical tick in `--ink`, extending 4px above and below the bar, marking the level this task must reach to be promoted to Automated (e.g., 95%). Hovering it shows "Promotion threshold: 95%".
- Label to the left: "High confidence" in `body-strong`; the figure to the right in tabular `small`.
- Compact version for table cells: 5 segments (20 points each), 4px tall, figure only, band shown in the tooltip.

```
High confidence  ▮▮▮▮▮▮▮▮▮▯│  97%
                           ↑ promotion threshold
Low confidence   ▮▮▮▮▮▮▯▯▯▯ │ 58%   → Send to expert
```

The meter is deliberately monochrome. The action badge says *who* is responsible; the meter says *how sure* the AI is. Keeping them visually separate stops users reading "teal = safe".

### 8.3 "Why" disclosure

A quiet "Why this?" toggle under any AI output opens an evidence list:

- **Sources**: which records were used ("Invoice INV-2291, Bank line 14 Mar, Vendor: Halden Logistics").
- **Checks passed / failed**: tick or cross per rule ("Amount matches exactly ✓", "Date within 2 days ✓", "Payee name differs ✗").
- **Comparable history**: "Similar entries approved 23 of 24 times."

### 8.4 Track record (Earned Autonomy)

For promotion decisions, show the task's track record, not just today's confidence:

- A row of month cells (last 6 months): each cell is a small square shaded by that month's accuracy, with the figure on hover.
- Summary sentence: "412 of 420 matches correct over 3 months (98.1%)".
- The promotion prompt: "Bank matching at Northwind Freight has passed the 95% threshold for 3 months. Promote to Automated?" with actions "Promote to Automated" and "Keep as Assisted". A note beneath: "You can move it back at any time."

---

## 9. Motion

- Default: none. No entrance animations, no hover lifts on panels, no shimmer on AI text.
- Responsive motion only: disclosures expand in 150ms, dialogs fade in 150ms, toasts slide in from the bottom.
- **One orchestrated moment** per journey, on the resolution screen: the close-readiness score counts up to its new value and the meter segments fill in sequence (600ms total). This is the payoff of the finance journey.
- Honour `prefers-reduced-motion`: all motion becomes instant.

---

## 10. Voice and copy

- Plain verbs, sentence case, no filler. "14 items need review", not "Let's tackle your exceptions!"
- When the AI explains itself (reasoning, "why" panels, recommendations), it speaks in the first person, talking to the user in-product: "I drafted an accrual of $18,400.00 for unbilled freight, based on 3 open POs." Panel titles follow suit: "Why I drafted this", "What I learned". Log entries and labels stay impersonal ("Drafted a $18,400.00 accrual").
- The product never describes itself as a demo, prototype or walkthrough, and never narrates the screen to a reviewer. Headings say what the screen is; the line under them is real status text (see `CASE_CONTEXT.md` section 6, copy rules).
- Name things by what users understand: "Connect your whole group", not "Group-scoped OAuth token provisioning" (developer screens can go one level more technical, but still lead with the outcome).
- Errors and empty states give direction: "No exceptions left for Northwind Freight. Next: review intercompany eliminations."
- Research figures in callouts always carry their source type, per `CASE_CONTEXT.md` section 8.

---

## 11. Brand and product mark

- Wordmark: `[PRODUCT NAME]` set in IBM Plex Sans 600, `--ink`, with a simple square mark in `--ink` containing a check-and-rule glyph (a tick above a double underline, echoing the totals rule). Easy to swap once the name is chosen.
- No Intuit logos, no QuickBooks green, no copied Intuit type or illustration style.

---

## 12. Accessibility floor

- All text meets WCAG AA (4.5:1). Contrast values above have been checked.
- Badges never rely on colour: every one has an icon and a full text label.
- Visible 2px `--focus` ring on every interactive element.
- Touch targets at least 40px on mobile.
- Tooltips carry only secondary information; anything essential is visible on the page.

---

## 13. Choices revised during review

The first plan was checked against the defaults an AI-generated finance UI tends to produce, and revised:

- **Font:** first reached for Inter, the generic SaaS default. Changed to IBM Plex Sans. A serif for titles was proposed and dropped at review in favour of a single sans-serif family.
- **Badge hues:** plum (Human handoff) was dropped because its red undertone suggests errors. Handoff moved to burnt orange; Assisted moved from ochre to slate blue so it doesn't sit next to orange.
- **Primary colour:** navy buttons were replaced with dark ink so blue only ever means Assisted.
- **Warning colour:** added a bold dark red (`#8E1B1B`) instead of amber, so warnings never look like the orange handoff badge. It is separated from the error red by weight, icon and container.
- **Background:** considered a warm off-white; switched to a cool ledger-paper grey-green so it reads as finance, not editorial.
- **Structure:** replaced a grid of rounded shadowed cards with table-first layouts, bordered panels, and a radius that varies by hierarchy.
- **Confidence:** a percentage with a coloured progress bar was the obvious default. Replaced it with the segmented monochrome meter with a promotion-threshold notch, which ties confidence directly to Earned Autonomy.
- **Warning colour:** dropped the usual amber warning state because it would clash with the Assisted badge.
