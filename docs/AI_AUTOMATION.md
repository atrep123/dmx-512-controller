# AI workflow automation

This guide captures how to run fully automated "generate → test → review" loops with large
language models (LLM) inside this repository. It is tailored for OpenAI Codex/GPT models, but the
same structure works for other providers.

## 1. Prerequisites

- **API access** – set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, `AI_AUTOMATION_*`
  overrides) in your shell, Task Scheduler or CI secrets store.
- **Codex CLI / VS Code extension** – install `codex` (`npm i -g @openai/codex-cli`) and/or the
  "OpenAI Codex" VS Code extension and enable *Agent (full access)* if you want an autonomous agent
  that edits files and runs commands.
- **Optional agents** – Auto-GPT, BabyAGI, LangChain or GPT-Engineer can be plugged in by pointing
  them at this repo; see section 5 for orchestration tips.

## 2. Local automation entry points

### `scripts/ai/generate.mjs`

`node scripts/ai/generate.mjs --prompt <file> --out <file>` calls the OpenAI Chat Completions API,
stores the response and keeps JSON metadata under `tmp/ai-history/`. Example:

```bash
export OPENAI_API_KEY=sk-...
npm run ai:generate -- \
  --prompt prompts/ai/sample-task.md \
  --out tmp/ai-output/sample.md \
  --model gpt-4.1-mini
```

Flags support inline prompts (`--prompt-text`), system instructions (`--system`), and temperature /
token overrides. See `scripts/ai/generate.mjs --help` for details.

### VS Code tasks

`.vscode/tasks.json` ships with two AI-centric tasks:

| Task | What it does |
| ---- | ------------ |
| `AI: Generate via OpenAI API` | Wraps the Node script above. Prompts for a prompt-file path and model and writes to `tmp/ai-output/latest.md`. |
| `AI: Codex full-auto` | Calls `codex exec --full-auto "<prompt>"` with an inline instruction string. Works once the Codex CLI is installed and authenticated. |

Run them via `⇧⌘B` (macOS) / `Ctrl+Shift+B` or *Run Task…*. Inputs are stored per-workspace so you
can quickly re-run the last automation job.

### Manual Codex agent

When the OpenAI Codex VS Code extension is set to *Agent (full access)*, it can autonomously:

1. Read/write any file under the workspace.
2. Run commands (e.g., `npm run test`, `pytest`) without prompting.
3. Open PRs or branches when paired with GitHub integration.

Keep an eye on the agent output panel; it streams diffs and logs for traceability.

## 3. Scheduled automation

### Cron / Task Scheduler

- **macOS/Linux** – add `0 3 * * * cd /path/to/repo && OPENAI_API_KEY=... npm run ai:generate -- --prompt prompts/ai/nightly.md --out tmp/ai-output/nightly.md >> logs/ai-nightly.log 2>&1`.
- **Windows Task Scheduler** – run `powershell.exe -File scripts/ai/run-nightly.ps1` which exports
  the API key, invokes `npm run ai:generate ...`, and writes logs to `%LocalAppData%\DMX4\logs`.

### GitHub Actions (example)

```yaml
name: Nightly AI upkeep
on:
  schedule:
    - cron: "0 3 * * *"
jobs:
  codex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Codex CLI
        run: npm i -g @openai/codex-cli
      - name: Run Codex agent
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: codex exec --full-auto "Update CHANGELOG with the latest metrics."
      - name: Run tests
        run: |
          npm ci
          npm run test
          pip install -r server/requirements.txt
          pytest server/tests -k "not mqtt"
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore(ai): nightly codex run"
```

Swap Codex for the local Node script (or GPT-Engineer) if preferred. Always run the frontend Vitest
suite and backend pytest suite before pushing generated code.

## 4. Automated testing loop

1. AI generates or edits files (`codex exec`, `npm run ai:generate`, Auto-GPT, etc.).
2. Run `npm run lint`, `npm run test`, `pytest server/tests`.
3. Feed failures back into the AI (most agents can read stderr or you can re-run manually with the
   failing logs pasted into the prompt).
4. Only merge once the suites are green and code review approves the diff.

Consider running tests in containers (Docker, devcontainers, GitHub Actions runners) to isolate any
untrusted code before it touches your workstation.

## 5. Orchestration patterns

- **LangChain / Autogen** – define a sequence: prompt → generate files → run tests → retry on failure.
- **GPT-Engineer** – drop a spec into `prompt` and let it scaffold a project snapshot inside a
  separate folder, then selectively copy artifacts here.
- **CI pipelines** – split jobs into "Generate", "Validate", "Publish" for traceable logs.
- **VS Code Tasks** – chain tasks via `dependsOn` if you want to run generation + tests with one
  command (e.g., `AI: Generate via OpenAI API` followed by `Run Tests`).

## 6. Safety checklist

- Keep API keys in `.env` (ignored) or secure secret stores.
- Never run AI-generated binaries outside sandboxed envs.
- Review diffs before committing—even in `--full-auto` mode.
- Prune `tmp/ai-output/` and `tmp/ai-history/` periodically; they can grow quickly.

With these pieces in place you can let an AI agent bootstrap features, regenerate boilerplate,
produce documentation, and still keep the human-in-the-loop bar for quality.

## 7. Desktop DMX helper endpoints

The desktop wrapper and onboarding wizard now rely on two backend APIs so that automation tasks (or
human QA) can quickly verify device connectivity without wiring custom scripts:

- `GET /dmx/devices` &rightarrow; enumerates USB/serial interfaces (FTDI/ENTTEC/DMXKing) and
  Art-Net nodes via broadcast ArtPoll. Returns `{ "serial": [...], "artnet": [...] }`. The call is
  safe to repeat in quick succession and falls back to empty lists if the underlying enumeration
  raises.
- `POST /dmx/test` &rightarrow; sends a one-shot DMX frame for sanity checks. Payload examples:
  - Serial: `{"type":"serial","path":"COM5","channel":1,"value":255}`
  - Art-Net: `{"type":"artnet","ip":"10.0.0.5","channel":1,"value":200}`

Both operations run their blocking work in worker threads so they are compatible with AI-driven CLI
loops (Codex/Tauri agents can call them directly before deciding how to patch configs). Any errors
result in `502` for easier retries, and successes include the `target`, `channel`, and `value` that
were sent—handy for scripted smoke tests.
