# Agent Knowledge

Agent Knowledge is a SaaS platform for building a trusted company knowledge layer for AI agents.

It helps teams store company knowledge, assign knowledge to specific agents, govern what agents can use, retrieve source-grounded answers, and audit agent activity.

## What it solves

AI agents need reliable company context. Without governance, agents can answer from outdated, unapproved, or irrelevant information.

Agent Knowledge gives teams a central workspace to:

* Store trusted company knowledge
* Assign knowledge to specific agents
* Approve and review knowledge before use
* Retrieve answers with source citations
* Track retrieval history
* Audit workspace activity
* Manage team roles and permissions

## Tech stack

* Next.js / React
* TypeScript
* Tailwind CSS
* Convex
* WorkOS AuthKit
* Vercel
* Bun
* Optional Gemini AI answer generation

## Core features

### Authentication and workspace access

* WorkOS AuthKit login
* Protected app routes
* Convex users and memberships
* Role-based permissions
* Admin/member management
* WorkOS invitations
* Last admin/owner protection

### Knowledge management

* Create, edit, delete knowledge
* Markdown/text import
* Import preview
* Bulk assign imported knowledge to agents
* Export knowledge to Markdown or CSV
* Knowledge version history
* Restore old versions
* Organization defaults for new knowledge

### Agent management

* Create and manage agents
* Assign knowledge to agents
* Agent-scoped retrieval
* Agent detail pages

### Ask and retrieval

* Ask questions against verified knowledge
* Agent-specific retrieval
* Source citations
* Retrieval confidence labels
* Token-based ranking
* Source-grounded draft answer panel
* Optional Gemini AI answer generation
* No-source guard

### Governance

* Approval queue
* Approve/reject knowledge
* Reviewer notes
* Knowledge review reminders
* Audit logs
* Retrieval history
* Retrieval history filters
* Dashboard analytics

### Professional UI

* Public landing page
* Dark SaaS dashboard UI
* Command palette
* Global workspace search
* Toast notifications
* Confirmation dialogs
* Loading skeletons
* Breadcrumbs
* Setup checklist
* Advanced dashboard charts

## Important routes

### Public

* `/` — public landing page

### App

* `/dashboard`
* `/ask`
* `/search`
* `/knowledge`
* `/agents`
* `/approvals`
* `/reviews`
* `/retrieval-history`
* `/members`
* `/audit`
* `/settings`

## Environment variables

Production and local development require environment variables.

```env
NEXT_PUBLIC_CONVEX_URL=
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_COOKIE_PASSWORD=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=
GEMINI_API_KEY=
```

`GEMINI_API_KEY` is optional. If Gemini quota is unavailable, the app still works with source-grounded retrieval drafts.

Never commit real secret values to GitHub.

## Local development

Install dependencies:

```bash
bun install
```

Run Convex dev:

```bash
bunx convex dev
```

Run the web app:

```bash
cd apps/web
bun dev
```

Build:

```bash
bun run build
```

## Production deployment

The app is deployed on Vercel.

Recommended deploy flow:

```bash
bun run build
git status
git add .
git commit -m "Describe change"
git push origin main
```

Vercel deploys from the `main` branch.

## Production safety

See:

```text
PRODUCTION_SAFETY.md
```

That file covers:

* Backups
* Restore plan
* Vercel rollback
* Convex recovery
* Rate limits
* Smoke tests
* Incident response

## Demo flow

See:

```text
DEMO_SCRIPT.md
```

Recommended demo path:

```text
Landing page → Dashboard → Knowledge → Ask → Retrieval History → Members → Audit Logs → Settings
```

## Current readiness

* Demo-ready: yes
* Private beta-ready: mostly yes
* Public production-ready: needs monitoring and backup discipline
* Enterprise-ready: not yet
