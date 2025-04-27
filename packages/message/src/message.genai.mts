/**
 * Script to generate git commit messages in the conventional commit format.
 * It automatically checks for staged changes (or stages all files if none are staged),
 * generates a commit message, and commits the changes.
 */

export const message = async () => {
  script({
    model: "github_copilot_chat:gpt-4.1",
    title: "Message",
    description: "Generate a conventional commit message for staged changes",
  });

  try {
    // Get the diff of staged changes
    const diff = await git.diff({
      excludedPaths: ["package-lock.json"],
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

    // Chunk the diff if it's large
    const chunks = await tokenizers.chunk(diff, { chunkSize });
    if (chunks.length > 1) {
      console.log(
        `Staged changes chunked into ${chunks.length} parts due to size`
      );
    }

    // Generate a commit message for each chunk, then combine them
    let message = "";
    for (const chunk of chunks) {
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
          model: "large",
          label: "generate commit message",
          system: ["system.assistant"],
          systemSafety: true,
          responseType: "text",
        }
      );

      if (result.error) {
        console.error(
          "Error generating commit message for chunk:",
          result.error
        );
        continue;
      }

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
          model: "large",
          label: "summarize chunk commit messages",
          system: ["system.assistant"],
          systemSafety: true,
          responseType: "text",
        }
      );

      if (!summaryResult.error) {
        commitMessage = (
          summaryResult.fences?.[0]?.content || summaryResult.text
        ).trim();
      }
    }

    if (!commitMessage) {
      console.log(
        "No commit message could be generated. Check your LLM configuration."
      );
      return;
    }

    // Commit the changes with the generated message
    console.log("Committing with message:");
    console.log(commitMessage);
    const commitResult = await git.exec(["commit", "-m", commitMessage]);
    console.log(commitResult);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

export default message;
