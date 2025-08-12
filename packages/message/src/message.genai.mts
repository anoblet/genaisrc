import {
  envArray,
  envNumber,
  envString,
  model,
} from "../../utility/src/utility.ts";
import { minimatch } from "minimatch/dist/esm/index.js";

const excludedPaths = envArray("GENAISCRIPT_MESSAGE_EXCLUDED_PATHS");
const includePattern = envString("GENAISCRIPT_MESSAGE_INCLUDE");

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
    let diffOptions = {
      staged: true,
      askStageOnEmpty: false, // Don't ask since we've already handled staging
    };

    // Apply include/exclude logic based on environment variables
    if (includePattern) {
      // If include pattern is set, filter staged files first
      const stagedFiles = await git.listFiles("staged");
      if (stagedFiles && stagedFiles.length > 0) {
        // Apply include pattern filtering
        const filteredFiles = stagedFiles.filter((file) => {
          // Check include pattern
          const matchesInclude =
            !includePattern || minimatch(file, includePattern);
          // Check exclude pattern
          const matchesExclude =
            excludedPaths.length > 0 &&
            excludedPaths.some((pattern) => minimatch(file, pattern));

          return matchesInclude && !matchesExclude;
        });

        if (filteredFiles.length === 0) {
          console.log("No files match the include pattern. Exiting.");
          return;
        }

        // Use specific files for diff
        diffOptions.paths = filteredFiles;
      }
    } else {
      // If no include pattern, just use exclude paths as before
      diffOptions.excludedPaths = excludedPaths;
    }

    // Get the diff of staged changes
    const diff = await git.diff(diffOptions);

    // If no staged changes are found after our attempts, exit gracefully
    if (!diff) {
      console.log("No changes to commit. Exiting.");
      return;
    }

    // Constants for chunking
    // The diff may be too large to send as a single context to the LLM, so we chunk it
    // `chunkSize` and `chunkMax` are configurable limits to protect the LLM and avoid out-of-context errors
    const chunkSize = envNumber("GENAISCRIPT_MESSAGE_CHUNK_SIZE") || 1000; // Default chunk size if not set
    const chunkMax = envNumber("GENAISCRIPT_MESSAGE_CHUNK_MAX") || 10; // Default max chunks if not set

    // Chunk the diff if it's large to avoid exceeding LLM context limits
    // This divides the input diff string into an array of manageable pieces for the LLM to process
    const chunks = await tokenizers.chunk(diff, { chunkSize });
    if (chunks.length > 1) {
      console.log(
        `Staged changes chunked into ${chunks.length} parts due to size`,
      );
    }

    if (chunks.length > chunkMax) {
      // Prevents committing extremely large diffs that could overwhelm the LLM or make the commit message unhelpful
      // This is a safeguard to encourage smaller, more meaningful commits
      console.log(
        `Diff is too large (${chunks.length} chunks). Please commit smaller changes.`,
      );
      return;
    }

    // Generate a commit message for each chunk, then combine them
    // This loop handles potentially context-busting diffs in multiple LLM calls and collects all messages
    let message = "";
    for (const chunk of chunks) {
      // For each chunk, prompt the LLM to generate a conventional commit message
      // Defensive prompt engineering prohibits markdown output and clarifies diff line conventions to mitigate hallucination/confusion
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
      // When multiple chunks exist, summarize all generated messages into a single, coherent commit message
      // The summary call here aims to avoid the LLM generating repetitive or fragmented commit texts
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
    // This is the final step after all message generation and checks
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
