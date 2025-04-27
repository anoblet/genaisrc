import { comment } from "../comment/src/comment.genai.mts";
import { message } from "../message/src/message.genai.mts";

// Script metadata for integration with the generative AI scripting system.
// Specifies the model, title, and description for this script.
script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Commit",
  description: "Commit",
});

/**
 * Orchestrates the commit process by sequentially invoking
 * the comment and message modules. This ensures that both
 * code commentary and commit messages are generated together,
 * maintaining consistency and reducing manual steps.
 */
export const commit = async () => {
  await comment(); // Generate or update code comments before committing
  await message(); // Generate a commit message after comments are handled
};

export default commit;