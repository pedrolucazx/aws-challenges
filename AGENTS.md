# AGENTS.md — aws-challenges

Instructions for any AI agent (OpenCode, Codex CLI, Claude, or otherwise) picking up an issue in
this repo. Read this before touching anything. This file is the project-level instruction file
both [OpenCode](https://opencode.ai/docs/rules/) and [Codex CLI](https://developers.openai.com/codex/)
read automatically from the repo root.

## What this repo is

Portfolio deliverables for the "AWS - DIO" course: each top-level folder is one self-contained
DIO lab challenge (spec, code/template, architecture diagram, evidence of a successful run).
Every challenge is inspired by real patterns from [imm-api](https://github.com/pedrolucazx/imm-api)
(a habits/journal SaaS) but **never touches any real IMM AWS resource** — every resource created
by any lab is prefixed `aws-challenges-*` and isolated from IMM's production account.

## The hard rule: who is allowed to run `aws`

This repo has two execution modes depending on the challenge, and they are not interchangeable:

| Folder | Target | Who may run `aws` CLI/SDK calls |
|---|---|---|
| `step-functions/` | Real AWS account | **Nobody but Pedro, manually, in his own terminal.** No AI agent runs any `aws` call here, ever — not mutating, not even read-only (`describe-*`, `list-*`). Issues labeled `manual-only` exist specifically to mark these. |
| `cloudformation/` | Real AWS account | Same rule as above. |
| `cloudformation-infra-automatizada/` | **Floci** (local AWS emulator, not real AWS) | An agent MAY run `aws` here, but only against Floci's local endpoint. Never without `--endpoint-url http://localhost:4566` (or `AWS_ENDPOINT_URL` exported via `eval $(floci env)`) pointing at Floci, and never with a real AWS profile/credentials. Issues doing this are labeled `orca-exec`. |
| `lambda-s3-object-lambda/` | **Floci** | Same as above. |

If you are an agent and you are not 100% sure a command is targeting Floci (`localhost:4566`) and
not the real AWS account, stop and ask — do not run it. This constitution has never been relaxed
for the two real-AWS challenges; the two Floci challenges are a deliberate, explicit exception
scoped only to the local emulator.

## Isolated resource pattern

Every resource this repo creates (real or emulated) is named `aws-challenges-*` and scoped to
that one lab. No lab reads, writes, deploys to, or depends on any real imm-api bucket, Lambda,
role, table, user, habit, journal entry, ARN, or account state. When in doubt, check the
`README.md` inside the challenge folder — each one states explicitly what it does and does not
touch.

## Where the planning docs are

Each challenge was planned with [spec-kit](https://github.com/github/spec-kit) before any code was
written: `spec.md` (requirements/success criteria), `plan.md`, `data-model.md`, `contracts/`
(interface contracts), `quickstart.md` (exact setup/deploy/verify/teardown commands), `tasks.md`
(the `T0XX` breakdown every GitHub issue in this repo comes from).

**These live in `specs/<NNN>-<slug>/` on Pedro's machine and are intentionally *not* committed to
this public repo** (`.gitignore` excludes `/specs/`, alongside `/.claude/`, `/.opencode/`,
`/.specify/` — see the `chore: keep spec-kit engine and agent skill defs local-only` commit for
why: they're tooling scaffolding, not the deliverable). If you're working from a fresh clone that
doesn't have `specs/` on disk, you won't have these files — that's expected, not a bug.

In that case: **treat each GitHub issue's own title and body as the actionable spec.** Every issue
in this repo is written to be self-contained (references the exact file to write, the exact
resource/logical-ID names to use, and which prior task it depends on) precisely so execution never
strictly requires the local `specs/` folder. Use `data-model.md`/`contracts/*.md` filenames
mentioned in an issue as a hint for what a file *would* define, not as a hard dependency — infer
the same shape from the sibling challenge folders (`step-functions/`, `cloudformation/`) which are
the reference implementations for this repo's conventions.

## Labels you'll see on issues

| Label | Meaning |
|---|---|
| `step-functions`, `cloudformation`, `cloudformation-infra-automatizada`, `lambda-s3` | Which challenge the task belongs to |
| `manual-only` | Real AWS CLI call — only Pedro runs it, never an agent |
| `orca-exec` | Floci (local emulator) CLI call — an executing agent (this is you, if you're Orca-dispatched) runs it against `localhost:4566`, never real AWS |
| `floci` | Task is specific to the Floci-based challenges (setup, verification of Floci's API coverage, etc.) |

## Closing out a task

1. Do the work the issue describes (write the file, or — for `orca-exec` issues — run the Floci
   command and capture its terminal output as evidence, since Floci has no web console).
2. Update the challenge's `README.md` with the result (outputs, evidence file path, or a Teardown
   section entry — mirror how `step-functions/README.md` and `cloudformation/README.md` already do
   this).
3. Commit directly to `main` (this repo has no branch-protection/PR workflow — check `git log` if
   unsure, every prior commit here landed straight on `main`).
4. Close the issue referencing the commit SHA. If a task's premise turns out wrong once you're
   executing it (e.g. Floci doesn't support an API a task assumed), don't force it — comment on the
   issue with what you found and open a follow-up rather than fabricating evidence.

## Floci quickstart (for the two emulator-based challenges)

```bash
curl -fsSL https://floci.io/install.sh | sh   # or: brew install floci-io/floci/floci
floci start && eval $(floci env)              # exports AWS_ENDPOINT_URL=http://localhost:4566 + test creds
aws cloudformation validate-template --template-body file://template.yaml
```

Full command sequences (deploy/verify/teardown) per challenge are in that challenge's
`quickstart.md` (local, see above) or the challenge's own `README.md` once written.
