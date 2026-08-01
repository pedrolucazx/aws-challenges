# AWS Challenges

Two DIO ("AWS - DIO" course) code challenges, documented and specified here — not implemented in
this repo's history as running code, but as **specs, plans, and tasks** authored with
[spec-kit](https://github.com/github/spec-kit), handed off as GitHub issues, and executed later
via [Orca](https://github.com/stablyai/orca).

**Context**: these challenges exist alongside the real project this course feeds into —
[**imm-api**](https://github.com/pedrolucazx/imm-api), a habits/journal SaaS ("Inside My Mind")
that migrated its production infrastructure to AWS as the course progressed. Both labs below are
thematically grounded in real patterns from that project (habit reminders, the real avatar-upload
Lambda) without ever touching its production AWS resources — see each challenge's own README and
this repo's `.specify/memory/constitution.md` for exactly where that line is drawn.

## Challenges

| Folder | DIO Challenge | Spec | Status |
|---|---|---|---|
| [`step-functions/`](./step-functions/) | Explorando Workflows Automatizados com AWS Step Functions | [specs/001-step-functions-habit-lab](./specs/001-step-functions-habit-lab/) | Spec/plan/tasks ready — build pending |
| [`cloudformation/`](./cloudformation/) | Implementando sua Primeira Stack com AWS CloudFormation | [specs/002-cloudformation-avatar-stack](./specs/002-cloudformation-avatar-stack/) | Spec/plan/tasks ready — build pending |

## How this repo works

- `.specify/` — spec-kit's own project files: the constitution (non-negotiable rules for every
  spec in this repo) and templates.
- `specs/NNN-slug/` — one directory per challenge: `spec.md` (what/why), `plan.md` (how,
  Constitution Check), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, and
  `tasks.md` (the actual checklist, later mirrored to GitHub issues).
- `step-functions/` / `cloudformation/` — the actual DIO-graded deliverables once built: README,
  source/template files, and an `images/` folder with diagrams and evidence screenshots.

**The one rule that matters most** (constitution Principle I-a): no AI agent — not this repo's own
authoring sessions, not an agent Orca dispatches — ever runs an `aws` CLI command, mutating or
read-only. Every `aws` command this repo's tasks describe is written for Pedro to run himself, by
hand, in his own terminal. Issues generated from `tasks.md` are labeled `manual-only` wherever
that applies.

## Multi-agent support

This repo's spec-kit install and the [drawio-skill](https://github.com/Agents365-ai/drawio-skill)
diagram generator are both set up for Claude Code, Codex, and opencode side by side
(`.claude/skills/`, `.agents/skills/`, `.opencode/skills/`) — any of the three can pick up work
from an issue.
