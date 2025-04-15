import { message } from "../gcm/src/gcm.genai.mts";

script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Commit",
  description: "Commit",
});

export const commit = async () => {
  // Run the message function to generate the commit message
  const commitMessage = await message();
}

export default commit;
