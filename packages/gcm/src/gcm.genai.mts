/**
 * Script to automate the git commit process with AI-generated commit messages.
 * It checks for staged changes, generates a commit message, and prompts the user to review or edit the message before committing.
 */

const isDefined = (value) => value !== undefined && value !== null

const parseBoolean = (value) => {
  if (value === "true") return true
  if (value === "false") return false
  throw new Error(`Invalid value: ${value}`)
}

const parameters = {
  chunkSize: {
    type: "number",
    default: 10000,
    description: "Maximum number of tokens per chunk",
  },
  maxChunks: {
    type: "number",
    default: 4,
    description:
      "Safeguard against huge commits. Askes confirmation to the user before running more than maxChunks chunks",
  },
  gitmoji: {
    type: "boolean",
    default: true,
    description: "Use gitmoji in the commit message",
  },
  auto: {
    type: "boolean",
    default: false,
    description: "Automatically stage all files, commit with generated message, and push changes",
  },
}

script({
  model: "github_copilot_chat:gpt-4o",
  title: "Generate Commit Message",
  description: "Generate a commit message for all staged changes",
  unlisted: true,
})

// Check for environment variables and set default values
const chunkSize = isDefined(process.env.GENAISCRIPT_GCM_CHUNK_SIZE)
  ? parseInt(process.env.GENAISCRIPT_GCM_CHUNK_SIZE)
  : env.vars.chunkSize ? env.vars.chunkSize : parameters.chunkSize.default

const maxChunks = isDefined(process.env.GENAISCRIPT_GCM_MAX_CHUNKS)
  ? parseInt(process.env.GENAISCRIPT_GCM_MAX_CHUNKS)
  : env.vars.maxChunks ? env.vars.maxChunks : parameters.maxChunks.default

const gitmoji = isDefined(process.env.GENAISCRIPT_GCM_GITMOJI)
  ? parseBoolean(process.env.GENAISCRIPT_GCM_GITMOJI)
  : env.vars.gitmoji ? env.vars.gitmoji : parameters.gitmoji.default

const auto = isDefined(process.env.GENAISCRIPT_GCM_AUTO)
  ? parseBoolean(process.env.GENAISCRIPT_GCM_AUTO)
  : env.vars.auto ? env.vars.auto : parameters.auto.default

// Check if there are any staged changes
const stagedChanges = await git.exec(["diff", "--cached", "--name-only"])
const hasStaged = stagedChanges && stagedChanges.trim().length > 0

// Stage all files first if in auto mode and no files are staged
if (auto && !hasStaged) {
  console.log("Auto mode: No files staged. Staging all files")
  await git.exec(["add", "-A"])
} else if (auto && hasStaged) {
  console.log("Auto mode: Files already staged, proceeding with existing staged files")
}

// Check for staged changes
const diff = await git.diff({
  staged: true,
  askStageOnEmpty: !auto, // Don't ask if in auto mode
  excludedPaths: ["package-lock.json", "**/package-lock.json"]
})

// If no staged changes are found, cancel the script with a message
if (!diff) cancel("no staged changes")

// Display the diff of staged changes in the console
console.debug(diff)

// chunk if case of massive diff
const chunks = await tokenizers.chunk(diff, { chunkSize })
if (chunks.length > 1) {
  console.log(`staged changes chunked into ${chunks.length} parts`)
  if (chunks.length > maxChunks && !auto) {
    const res = await host.confirm(
      `This is a big diff with ${chunks.length} chunks, do you want to proceed?`
    )
    if (!res) cancel("user cancelled")
  }
}

const gitPush = async () => {
  // Don't push automatically in auto mode, but also don't ask
  if (!auto && await host.confirm("Push changes?", { default: true }))
    console.log(await git.exec("push"))
}

const addInstructions = (ctx) => {
  ctx.$`
  
<type>: <description>
<body>

${gitmoji ? `- <type> is a gitmoji` : `- <type> can be one of the following: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`}
- <type> and <description> must be lowercase
- <description> is a short, imperative present-tense description of the change
- <body> is a short description of the changes
- Pretend you're writing an important newsworthy article. Give the headline in <description> that will sum up what happened and what is important. Then, provide further details in the <body> in an organized fashion.
- the diff is generated by "git diff"
- do NOT use markdown syntax
- do NOT add quotes, single quote or code blocks
- keep <description> short, 1 LINE ONLY, maximum 50 characters
- keep <body> short, 1 LINE ONLY, maximum 72 characters
- follow the conventional commit spec at https://www.conventionalcommits.org/en/v1.0.0/#specification
- do NOT confuse delete lines starting with '-' and add lines starting with '+'
`
}

let choice
let message
do {
  // Generate a conventional commit message based on the staged changes diff
  message = ""
  for (const chunk of chunks) {
    const res = await runPrompt(
      (_) => {
        _.def("GIT_DIFF", chunk, {
          maxTokens: 10000,
          language: "diff",
          detectPromptInjection: "available",
        })
        _.$`Generate a git conventional commit message that summarizes the changes in GIT_DIFF.`
        addInstructions(_)
      },
      {
        model: "large", // Specifies the LLM model to use for message generation
        label: "generate commit message", // Label for the prompt task
        system: ["system.assistant"],
        systemSafety: true,
        responseType: "text",
      }
    )
    if (res.error) throw res.error
    message += (res.fences?.[0]?.content || res.text) + "\n"
  }

  // since we've concatenated the chunks, let's compress it back into a single sentence again
  if (chunks.length > 1) {
    const res = await runPrompt(
      (_) => {
        _.$`Generate a git conventional commit message that summarizes the <COMMIT_MESSAGES>.`
        addInstructions(_)
        _.def("COMMIT_MESSAGES", message)
      },
      {
        model: "large",
        label: "summarize chunk commit messages",
        system: ["system.assistant"],
        systemSafety: true,
        responseType: "text",
      }
    )
    if (res.error) throw res.error
    message = res.text
  }

  message = message?.trim()
  if (!message) {
    console.log(
      "No commit message generated, did you configure the LLM model?"
    )
    break
  }

  // If auto mode is enabled, commit immediately but don't push
  if (auto) {
    console.log("Auto mode: using generated commit message")
    console.log(await git.exec(["commit", "-m", message]))
    // No push in auto mode
    break
  }

  // Prompt user to accept, edit, or regenerate the commit message
  choice = await host.select(message, [
    {
      value: "commit",
      description: "accept message and commit",
    },
    {
      value: "edit",
      description: "edit message in git editor",
    },
    {
      value: "regenerate",
      description: "run LLM generation again",
    },
    {
      value: "cancel",
      description: "cancel commit",
    },
  ])

  // Handle user's choice for commit message
  if (choice === "edit") {
    // @ts-ignore
    const { spawnSync } = await import("child_process")
    // 1) Launch git commit in an interactive editor
    const spawnResult = spawnSync(
      "git",
      ["commit", "-m", message, "--edit"],
      {
        stdio: "inherit",
      }
    )

    // 2) After the editor closes, forcibly exit the entire script
    console.debug("git editor closed with exit code ", spawnResult.status)
    if (spawnResult.status === 0) await gitPush()
    break
  }
  // If user chooses to commit, execute the git commit and optionally push changes
  if (choice === "commit" && message) {
    console.log(await git.exec(["commit", "-m", message]))
    await gitPush()
    break
  }

  if (choice === "cancel") {
    cancel("User cancelled commit")
    break
  }
} while (choice !== "commit")