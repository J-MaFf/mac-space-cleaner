# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Layered Workflow: GitHub Issues + Beads

This repo follows the `git-policies` layered model: **GitHub Issues are the shippable
unit** (branch → PR → `Fixes #N` → squash-merge, human-gated). **Beads is the
execution/memory layer underneath** — the `bd ready` queue, the dependency graph, and
`bd remember` persistent memory. Beads never replaces the GitHub Issue / PR flow above it.

### Durable sync — `bd dolt push` runs automatically

Push immediately after every bead mutation (`bd create` / `bd update` / `bd close`) —
no confirmation needed, don't batch it for session close:

```bash
bd dolt push
```

This syncs `refs/dolt/data` on `origin`, which is separate from `refs/heads/*` and is
**not** gated by branch protection on `main`. Use `bd dolt pull` to pick up other
machines' changes, and `bd bootstrap` on a fresh clone.

### Session close

Make code changes durable on the **feature branch** — never commit or push to `main`
directly:

```bash
git add <files> && git commit -S -m "..."   # signed commit, on the feature branch
git push -u origin <feature-branch>          # push the branch, never main
bd dolt push                                 # bead state should already be synced by now
```

Then open/update the PR (`Fixes #N`, assignee `J-MaFf`, appropriate label) and **stop at
the merge gate**. Merging to `main` always stays human-gated via PR review — never
auto-merge, regardless of how freely bead state or the feature branch sync.

### Memory

`bd remember "<insight>"` is for **repo-scoped** knowledge that should travel with this
repo (in the Dolt DB, synced like everything else above). It does not replace the
user's global/cross-repo Claude memory system — that stays the home for context that
isn't specific to this repo.

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Never commit or push `.beads/` changes to `main` directly; feature-branch pushes and
  `bd dolt push` are fine, merges to `main` are not.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->


## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Add a brief overview of your project architecture_

## Conventions & Patterns

_Add your project-specific conventions here_
