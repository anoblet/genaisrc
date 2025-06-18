import { envArray, model } from "../../utility/src/utility.ts";

const excludedPaths = envArray("GENAISCRIPT_MESSAGE_EXCLUDED_PATHS");

/**
 * Script to generate git commit messages in the conventional commit format.
 * It automatically checks for staged changes (or stages all files if none are staged),
 * generates a commit message, and commits the changes.
 */

/**
 * Generates a conventional commit message for staged git changes and commits them.
 * Handles large diffs by chunking and summarizing, and ensures compliance with Conventional Commits.
 *
 * @returns {Promise<void>} Resolves when commit is complete or exits early if no changes.
 */
export const message = async () => {
  script({
    model,
    title: "Message",
    description: "Generate a conventional commit message for staged changes",
  });

  try {
    // Get the diff of staged changes, excluding package-lock.json for noise reduction
    const diff = await git.diff({
      excludedPaths,
      staged: true,
      askStageOnEmpty: false, // Don't ask since we've already handled staging
    });

    // If no staged changes are found after our attempts, exit gracefully
    if (!diff) {
      console.log("No changes to commit. Exiting.");
      return;
    }

    // Constants for chunking
    const chunkSize = 10000;
    const maxChunks = 4; // Safeguard against huge commits

    // Chunk the diff if it's large to avoid exceeding LLM context limits
    const chunks = await tokenizers.chunk(diff, { chunkSize });
    if (chunks.length > 1) {
      console.log(
        `Staged changes chunked into ${chunks.length} parts due to size`,
      );
    }

    // Generate a commit message for each chunk, then combine them
    let message = "";
    for (const chunk of chunks) {
      // For each chunk, prompt the LLM to generate a conventional commit message
      const result = await runPrompt(
        (ctx) => {
          ctx.def("GIT_DIFF", chunk, {
            maxTokens: chunkSize,
            language: "diff",
            detectPromptInjection: "available",
          });

          ctx.$`Generate a git conventional commit message that summarizes the changes in GIT_DIFF.
          
          Follow the Conventional Commits specification (https://www.conventionalcommits.org/):
          <type>[optional scope]: <description>
          
          [optional body]
          
          [optional footer(s)]
          
          - <type> must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
          - <description> must be imperative, present tense, lowercase, no period at end
          - The first line (header) should be 50 chars or less
          - The body should provide context and explain what and why (not how)
          - The full message should be clear and concise
          - Do NOT use markdown syntax, quotes, or code blocks
          - Do NOT confuse removed lines starting with '-' and added lines starting with '+'`;
        },
        {
          model,
          label: "generate commit message",
          system: ["system.assistant"],
          systemSafety: true,
          responseType: "text",
        },
      );

      if (result.error) {
        // Log and skip chunk if LLM fails to generate a message
        console.error(
          "Error generating commit message for chunk:",
          result.error,
        );
        continue;
      }

      // Prefer content from code fences if present, else use plain text
      message += (result.fences?.[0]?.content || result.text).trim() + "\n";
    }

    // If we chunked the diff, generate a summary commit message from all chunks
    let commitMessage = message.trim();
    if (chunks.length > 1) {
      console.log("Generating summary commit message from all chunks...");
      const summaryResult = await runPrompt(
        (ctx) => {
          ctx.$`Generate a git conventional commit message that summarizes the following individual commit messages.`;
          ctx.def("COMMIT_MESSAGES", message, {
            maxTokens: chunkSize,
            detectPromptInjection: "available",
          });
          ctx.$`
          Follow the Conventional Commits specification (https://www.conventionalcommits.org/):
          <type>[optional scope]: <description>
          
          [optional body]
          
          [optional footer(s)]
          
          - <type> must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
          - <description> must be imperative, present tense, lowercase, no period at end
          - The first line (header) should be 50 chars or less
          - The body should provide context and explain what and why (not how)
          - The full message should be clear and concise
          - Do NOT use markdown syntax, quotes, or code blocks`;
        },
        {
          model,
          label: "summarize chunk commit messages",
          system: ["system.assistant"],
          systemSafety: true,
          responseType: "text",
        },
      );

      if (!summaryResult.error) {
        // Use the summarized commit message if available
        commitMessage = (
          summaryResult.fences?.[0]?.content || summaryResult.text
        ).trim();
      }
    }

    if (!commitMessage) {
      // Defensive: If LLM fails to generate any message, abort commit
      console.log(
        "No commit message could be generated. Check your LLM configuration.",
      );
      return;
    }

    // Commit the changes with the generated message
    console.log("Committing with message:");
    console.log(commitMessage);
    const commitResult = await git.exec(["commit", "-m", commitMessage]);
    console.log(commitResult);
  } catch (error) {
    // Catch-all for unexpected errors in the commit process
    console.error("Error occurred:", error);
  }
};

export default message;