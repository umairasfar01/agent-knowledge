# Agent Knowledge Production Safety Guide

## Purpose

This document explains how to keep Agent Knowledge safe in production, recover from failures, and respond to incidents.

Agent Knowledge uses:

- Next.js / React
- Vercel
- Convex
- WorkOS AuthKit
- Bun
- Optional Gemini AI route

---

## 1. Critical systems

### Frontend

Hosted on Vercel.

Important routes:

- `/`
- `/dashboard`
- `/ask`
- `/knowledge`
- `/members`
- `/settings`
- `/api/ask/answer`
- `/api/workos/invite`

### Backend/database

Hosted on Convex.

Important tables:

- `users`
- `memberships`
- `knowledge`
- `agents`
- `auditLogs`
- `retrievalLogs`
- `organizationSettings`
- `rateLimits`

### Authentication

Handled by WorkOS AuthKit.

Important env vars:

- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_COOKIE_PASSWORD`
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

---

## 2. Environment variable checklist

Production must have these in Vercel:

```env
NEXT_PUBLIC_CONVEX_URL=
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_COOKIE_PASSWORD=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=
GEMINI_API_KEY=