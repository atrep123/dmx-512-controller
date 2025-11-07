#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const getArg = (flag) => {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
};

const hasFlag = (flag) => args.includes(flag);

const showHelp = () => {
  console.log(`Usage: node scripts/ai/generate.mjs [options]

Options:
  --prompt <file>          Path to a Markdown/text prompt (mutually exclusive with --prompt-text)
  --prompt-text "<text>"   Inline prompt instead of reading from file
  --system "<text>"        Optional system message (defaults to senior-dev helper)
  --out <file>             Write completion to a file (stdout only when omitted)
  --model <name>           Override model (default: $OPENAI_MODEL or gpt-4.1-mini)
  --temperature <float>    Sampling temperature (default: 0.2)
  --max-tokens <int>       Max tokens for the response (default: 2048)
  --history-dir <dir>      Where to store JSON metadata (default: tmp/ai-history)
  --stdout                 Force printing the completion to stdout even when writing to file
  --json                   Print metadata JSON (includes usage + first 120 chars)
  --dry-run                Skip API call and only print the payload (debug)
  --help                   Show this message

Environment:
  OPENAI_API_KEY (required)
  OPENAI_MODEL, AI_AUTOMATION_SYSTEM_PROMPT, AI_AUTOMATION_TEMPERATURE,
  AI_AUTOMATION_MAX_TOKENS (all optional)
`);
};

if (hasFlag("--help")) {
  showHelp();
  process.exit(0);
}

let promptPath = getArg("--prompt");
const inlinePrompt = getArg("--prompt-text");

if (!promptPath && !inlinePrompt) {
  const fallback = path.resolve("prompts/ai/sample-task.md");
  if (fs.existsSync(fallback)) {
    promptPath = fallback;
  } else {
    console.error("Provide --prompt <file> or --prompt-text \"...\"");
    process.exit(1);
  }
}

if (promptPath && inlinePrompt) {
  console.error("Use either --prompt or --prompt-text, not both.");
  process.exit(1);
}

const promptContent = promptPath
  ? fs.readFileSync(path.resolve(promptPath), "utf8")
  : inlinePrompt;

const outputPath = getArg("--out");
const model =
  getArg("--model") ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const temperature = parseFloat(
  getArg("--temperature") ??
    process.env.AI_AUTOMATION_TEMPERATURE ??
    "0.2",
);
const maxTokens = parseInt(
  getArg("--max-tokens") ??
    process.env.AI_AUTOMATION_MAX_TOKENS ??
    "2048",
  10,
);
const systemPrompt =
  getArg("--system") ??
  process.env.AI_AUTOMATION_SYSTEM_PROMPT ??
  "You are a senior DMX controller engineer who writes concise, production-grade code and tests.";
const historyDir =
  getArg("--history-dir") ?? "tmp/ai-history";
const forceStdout = hasFlag("--stdout") || !outputPath;
const printJson = hasFlag("--json");
const dryRun = hasFlag("--dry-run");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required.");
  process.exit(1);
}

const messages = [];
if (systemPrompt) {
  messages.push({ role: "system", content: systemPrompt });
}
messages.push({ role: "user", content: promptContent });

const payload = {
  model,
  temperature,
  max_tokens: maxTokens,
  messages,
};

if (dryRun) {
  console.log("Dry run payload:");
  console.dir(payload, { depth: null });
  process.exit(0);
}

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
});

const data = await response.json();

if (!response.ok) {
  console.error("OpenAI API error:", data);
  process.exit(1);
}

const rawContent = data?.choices?.[0]?.message?.content;
const completion =
  typeof rawContent === "string"
    ? rawContent.trim()
    : Array.isArray(rawContent)
    ? rawContent
        .map((chunk) => chunk?.text ?? chunk?.content ?? "")
        .join("")
        .trim()
    : "";

if (!completion) {
  console.error("No completion returned:", JSON.stringify(data, null, 2));
  process.exit(1);
}

if (outputPath) {
  const resolved = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, completion, "utf8");
}

if (forceStdout) {
  console.log(completion);
}

if (printJson) {
  console.log(
    JSON.stringify(
      {
        model,
        usage: data.usage,
        finish_reason: data?.choices?.[0]?.finish_reason,
        preview: completion.slice(0, 120),
      },
      null,
      2,
    ),
  );
}

if (historyDir) {
  const historyPath = path.resolve(
    historyDir,
    `${Date.now()}-${model.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`,
  );
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  const metadata = {
    timestamp: new Date().toISOString(),
    promptPath: promptPath ? path.resolve(promptPath) : null,
    outputPath: outputPath ? path.resolve(outputPath) : null,
    model,
    usage: data.usage,
    request: payload,
    response: data,
  };
  fs.writeFileSync(historyPath, JSON.stringify(metadata, null, 2), "utf8");
}
