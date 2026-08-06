# Agent Knowledge Architecture

## Overview

Agent Knowledge is a multi-tenant SaaS platform for managing AI agent knowledge.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Convex
- WorkOS Authentication

### Shared
- packages/shared

## Architecture

User
    ↓
WorkOS
    ↓
Convex Authentication
    ↓
Permissions
    ↓
Knowledge
    ↓
Audit Logs
    ↓
AI Retrieval

## Core Modules

### Authentication
Responsible for user authentication and identity.

### Organizations
Multi-tenant organization management.

### Knowledge
Knowledge CRUD and version history.

### Agents
AI agent management.

### Retrieval
Knowledge search and ranking.

### Audit
Tracks important system events.

## Folder Structure

apps/
convex/
packages/
tests/
docs/

## Deployment

Frontend → Vercel

Backend → Convex