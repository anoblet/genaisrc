import { comment } from "../../comment/src/comment.genai.mts";
import { message } from "../../message/src/message.genai.mts";
import { style } from "../../style/src/style.genai.mts";
import { envBoolean, model } from "../../utility/src/utility.ts";

// Register script metadata for integration with the automation framework
script({
  model,
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
 * Version management is handled separately by the wireit dependency chain.
 *
 * @returns {Promise<void>} Resolves when the commit workflow is complete
 */
export const commit = async () => {
  if (envBoolean("GENAISCRIPT_COMMIT_STAGE")) {
    // If staging all is enabled via environment variable, stage all file changes; ensures all modifications are included in the commit
    console.log("Staging all changes...");
    await git.exec(["add", "."]);
  } else {
    // Skips staging; relies on user to pre-stage changes, which can help with partial commits
    console.log("Staging is disabled");
  }

  await style(); // Learn code style (ensures future steps follow project conventions)
  await comment(); // Generate comments (documents code for maintainability)
  await message(); // Generate commit message and commit (finalizes the workflow)

  // Output whether the commit should be pushed, based on environment configuration
  if (envBoolean("GENAISCRIPT_COMMIT_PUSH")) {
    // Automatically push the new commit if the environment variable is set
    console.log("Pushing...");
    // If push is enabled, execute the git push command
    await git.exec(["push"]);
  } else {
    // Allows for review or further action before pushing changes to the remote repository
    console.log("Push has been disabled");
  }

  // Conditionally trigger deployment based on environment variable
  if (envBoolean("GENAISCRIPT_COMMIT_DEPLOY")) {
    // Deploy the latest pushed code if deployment is enabled; automates continuous delivery workflows
    console.log("Deploying...");
    await host.exec("npm run deploy");
  } else {
    // Prevent automatic deployments unless explicitly enabled; adds a layer of safety
    console.log("Deploy has been disabled");
  }
};

export default commit;
