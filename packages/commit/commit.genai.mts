import { message } from "../gcm/src/gcm.genai.mts";

script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Commit",
  description: "Commit",
});

export const commit = async () => {
  await message();
}

export default commit;
