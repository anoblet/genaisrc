import { comment } from "../comment/src/comment.genai.mts";
import { message } from "../message/src/message.genai.mts";

// Script metadata for the Commit module
script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Commit",
  description: "Commit",
});

// Asynchronous commit function that awaits comment and message actions
export const commit = async () => {
  await comment(); // Add a comment, likely related to the commit process
  await message(); // Send or log a message, possibly for commit notification
};

export default commit;
