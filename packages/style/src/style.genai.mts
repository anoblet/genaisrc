import {
  envBoolean,
  getFiles,
  model,
  stageFiles,
} from "../../utility/src/utility.ts";
import { fileURLToPath } from "url";

// Determine the maximum number of tokens to use for style prompts, allowing override via environment variable
const maxTokens = process.env.GENAISCRIPT_STYLE_TOKENS
  ? parseInt(process.env.GENAISCRIPT_STYLE_TOKENS, 10)
  : 10000;

// Resolve the path to the style prompt template relative to this module
const promptPath = fileURLToPath(new URL("style.prompt.md", import.meta.url));
// Load the style prompt template content from disk
const prompt = (await workspace.readText(promptPath)).content;

// Allow override of the style prompt path via environment variable for flexibility in CI or local runs
const stylePath =
  process.env.GENAISCRIPT_STYLE_PROMPT_PATH ||
  "../../../.github/prompts/style.prompt.md";

// Register this script with a title for discoverability in the script system
script({
  model,
  title: "Style",
});

/**
 * Processes a single file by applying the code style prompt and writing the result.
 *
 * Loads the code style definition, runs the prompt engine with the file content and style,
 * and writes the result back to the style prompt file (potentially overwriting the template).
 *
 * @param file The file object to process, expected to have a .content property
 */
const processFile = async (file) => {
  // Load the code style definition from the specified path (may be overridden by env)
  const codeStyle = await workspace.readText(stylePath);

  // Run the style prompt using the loaded code style and file content as context
  const result = await runPrompt(
    (_) => {
      // Define context variables for the prompt engine
      _.def("CODE_STYLE", codeStyle, {
        maxTokens,
      });
      _.def("FILE_CONTENT", file.content, {
        maxTokens,
      });
      _.def("MAX_TOKENS", String(maxTokens), {
        maxTokens,
      });
      // Inject the prompt template for execution
      _.$`${prompt}`;
    },
    {
      model,
      label: "Style Code",
      system: ["system.assistant"], // Use system prompt for assistant role
      systemSafety: true, // Enable safety checks for model output
      responseType: "text",
    },
  );

  // Overwrite the style prompt file with the result, which may be an error (potentially unintended)
  // NOTE: This may unintentionally overwrite the style prompt template with model output
  await workspace.writeText(stylePath, result.text);
};

/**
 * Main entry point for the style script.
 *
 * Checks if style processing is enabled, finds all files to style, processes each sequentially,
 * and stages the style prompt file for commit.
 *
 * @returns {Promise<void>} Resolves when styling is complete or skipped
 */
export const style = async () => {
  if (!envBoolean(process.env.GENAISCRIPT_STYLE_ENABLED)) {
    // Early exit if style processing is disabled via environment variable
    console.log("Style is disabled");
    return;
  }

  const files = await getFiles({});

  if (files.length === 0) {
    // No files to process, exit early
    console.log("No files found to style.");
    return;
  }

  // Sequentially process each file to ensure deterministic output and avoid race conditions
  for (const file of files) {
    await processFile(file);
  }

  // Stage the prompt file (possibly for git commit)
  await stageFiles({ files: [{ filename: stylePath }] });
};

export default style;