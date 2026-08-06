@AGENTS.md

# Git Policy

## Git Safety Rules

- Never run `git add`, `git commit`, `git push`, `git pull`, `git fetch`, or `git stash` without my explicit approval.
- Never create, delete, rename, merge, or rebase branches.
- Never modify Git history (`reset`, `rebase`, `amend`, `cherry-pick`, `revert`, `filter-branch`, etc.) unless I explicitly request it.
- Never resolve Git conflicts automatically.
- Never create or open pull requests unless I explicitly ask.
- Never tag releases or modify GitHub releases.
- Never change Git configuration (`git config`) without permission.
- Always explain what Git command you intend to run before asking for approval.
- Suggest commit messages when appropriate, but never commit automatically.
- Wait for my approval before performing any Git write operation.

# Development Workflow

- Resume the existing Ruflo swarm instead of creating a new one.
- Do not reanalyze unchanged files.
- Work on one task at a time.
- Use the minimum number of agents required.
- Keep responses concise.
- Run only affected tests unless I request a full test suite.
- Do not modify unrelated files.

# Token Usage Policy

- Always resume the existing Ruflo swarm if one exists.
- Never recreate the swarm unless I explicitly request it.
- Never reanalyze unchanged files.
- Work on only one task at a time.
- Use the minimum number of agents required (default: 3 or fewer).
- Inspect only files relevant to the current task.
- Keep explanations concise unless I ask for details.
- Run only affected tests unless I request a full test suite.
- Do not perform project-wide analysis unless I explicitly request it.
- Before starting any task, check whether the existing project context is sufficient instead of rescanning the repository.

# Session Resume Policy

At the beginning of every session:

1. Check for an existing Ruflo swarm.
2. Resume the existing project state.
3. Review only unfinished tasks.
4. Do not recreate completed work.
5. Continue from the next unfinished task.