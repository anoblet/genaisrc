import { comment } from "../comment/src/comment.genai.mts";
import { message } from "../message/src/message.genai.mts";
import { style } from "../style/src/style.genai.mts";

// Register script metadata for integration with the automation framework
script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Commit",
  description: "Commit",
});

/**
 * Orchestrates the commit workflow:
 * 1. Learns code style to ensure consistency.
 * 2. Generates descriptive code comments.
 * 3. Produces a commit message and performs the commit.
 * 
 * This function abstracts the multi-step commit process to enforce best practices and maintain code quality.
 */
export const commit = async () => {
  await style(); // Learn code style (ensures future steps follow project conventions)
  await comment(); // Generate comments (documents code for maintainability)
  await message(); // Generate commit message and commit (finalizes the workflow)
};

export default commit;
