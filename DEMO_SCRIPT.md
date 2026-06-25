# Agent Knowledge Demo Script

## Demo goal

Show how Agent Knowledge helps a company create a trusted knowledge base for AI agents.

The story:

```text
Companies need AI agents, but agents need trusted, governed company knowledge.
Agent Knowledge is the company brain for agents.
```

---

## 1. Landing page

Open:

```text
/
```

Say:

```text
This is Agent Knowledge, a central knowledge platform for AI agents.
It helps teams store, govern, retrieve, and audit the knowledge agents use.
```

Show:

* Professional landing page
* Product message
* Features
* Security section
* Get started button

Click:

```text
Get started
```

Expected:

```text
User goes directly to login flow.
No dashboard flash before login.
```

---

## 2. Dashboard

Open:

```text
/dashboard
```

Say:

```text
The dashboard gives admins a live view of workspace health.
```

Show:

* Setup checklist
* Knowledge counts
* Agent/member counts
* Retrieval stats
* Knowledge health score
* Retrieval activity chart
* Top questions
* Top retrieved sources
* Recent audit activity

Point out:

```text
This helps teams see whether their agent knowledge is healthy and being used.
```

---

## 3. Knowledge base

Open:

```text
/knowledge
```

Say:

```text
This is where company knowledge is created, imported, governed, and assigned to agents.
```

Show:

* Create knowledge form
* Markdown import
* Import preview
* Bulk agent assignment
* Draft/verified status
* Can answer / can act permissions
* Export Markdown/CSV
* Knowledge cards

Demo import:

```md
# Refund Policy
Customers can request a refund within 7 days.

# Email Sending Rules
Agents may draft emails for review, but must not send emails automatically.
```

Show:

```text
Preview appears before import.
Imported items can be assigned to agents immediately.
```

---

## 4. Ask page

Open:

```text
/ask
```

Say:

```text
Now we can ask an agent a question.
The agent only retrieves verified knowledge assigned to it.
```

Select:

```text
Support Agent
```

Ask:

```text
Can customers get a refund?
```

Show:

* Matching verified source
* Confidence label
* Matched fields
* Source-grounded draft answer
* Source citation
* Optional AI answer button

Say:

```text
The draft answer is grounded in approved sources.
If there is no source, the app refuses to invent an answer.
```

---

## 5. Retrieval history

Open:

```text
/retrieval-history
```

Say:

```text
Every retrieval is logged, so teams can review what agents are being asked and what sources were used.
```

Show:

* Question
* Agent
* Actor email
* Result count
* Source titles
* Timestamp
* Filters/search

Search:

```text
refund
```

Show:

```text
The history can be filtered by question, agent, source, or user.
```

---

## 6. Global search

Open:

```text
/search
```

Say:

```text
Global search lets admins search across knowledge, agents, retrievals, and audit logs.
```

Search:

```text
refund
```

Show:

* Knowledge results
* Retrieval results
* Audit results if available

Also press:

```text
Ctrl + K
```

Show:

```text
The command palette makes navigation fast.
```

---

## 7. Approvals

Open:

```text
/approvals
```

Say:

```text
Draft knowledge can go through an approval workflow before agents can use it.
```

Show:

* Pending approval items
* Approve button
* Reject button
* Reviewer note modal
* Audit log creation

---

## 8. Reviews

Open:

```text
/reviews
```

Say:

```text
Knowledge can become stale, so Agent Knowledge tracks items due for review.
```

Show:

* Review queue
* Mark reviewed
* Last reviewed timestamp
* Audit log

---

## 9. Members

Open:

```text
/members
```

Say:

```text
Teams can invite members and manage roles.
```

Show:

* WorkOS invitations
* Member list
* Role change
* Remove member
* Last admin protection

---

## 10. Audit logs

Open:

```text
/audit
```

Say:

```text
Every important governance action is logged.
```

Show audit events for:

* Knowledge created
* Knowledge updated
* Knowledge approved/rejected
* Member role changed
* Settings updated
* Review completed

---

## 11. Settings

Open:

```text
/settings
```

Say:

```text
Admins can configure workspace defaults.
```

Show:

* Workspace display name
* Default knowledge category
* Default knowledge status
* Default answer/action permissions

Say:

```text
These defaults are applied when creating or importing new knowledge.
```

---

## Closing pitch

Say:

```text
Agent Knowledge gives companies a governed knowledge layer for AI agents.
It combines knowledge management, agent-scoped retrieval, approvals, audits, reviews, and team permissions in one platform.
```

Final message:

```text
This is like Notion for AI agents, but built around trust, governance, and retrieval.
```

---

## Best demo data

Use clean realistic demo data:

### Agents

* Support Agent
* Sales Agent
* Engineering Agent

### Knowledge

* Refund Policy
* Email Sending Rules
* Support Escalation Rule
* Pricing FAQ
* Engineering Release Notes Policy

### Good ask questions

```text
Can customers get a refund?
Can the support agent send emails?
When should support escalate an issue?
What pricing information can sales use?
```

---

## Demo checklist

Before demo:

* Remove test knowledge items
* Make sure at least 3 knowledge items are verified
* Make sure knowledge is assigned to Support Agent
* Run `/ask` once so retrieval history has data
* Check dashboard metrics
* Confirm landing page Sign in works
* Confirm dark theme stays stable after refresh
