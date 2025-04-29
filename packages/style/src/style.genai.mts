import { getFiles } from "../../utility/src/utility.ts";
import { fileURLToPath } from "url";

// Determine the maximum number of tokens to use for style prompts, allowing override via environment variable
const maxTokens = process.env.GENAISCRIPT_STYLE_TOKENS
  ? parseInt(process.env.GENAISCRIPT_STYLE_TOKENS, 10)
  : 10000;

// Resolve the path to the style prompt template relative to this module
const promptPath = fileURLToPath(new URL("style.prompt.md", import.meta.url));
// Load the style prompt template content from disk
const prompt = (await workspace.readText(promptPath)).content;

// Register this script with a title for discoverability in the script system
script({
  title: "Style",
});

/**
 * Processes a single file by applying the code style prompt and writing the result.
 * @param file The file object to process, expected to have a .content property
 */
const processFile = async (file) => {
  // Allow override of the style prompt path via environment variable for flexibility in CI or local runs
  const stylePath = process.env.GENAISCRIPT_STYLE_PROMPT_PATH || "../../../.github/prompts/style.prompt.md";

  // Load the code style definition from the specified path
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
      model: "github_copilot_chat:gpt-4.1", // Specify the LLM model to use for style suggestions
      label: "Style Code",
      system: ["system.assistant"], // Use system prompt for assistant role
      systemSafety: true, // Enable safety checks for model output
      responseType: "text",
    },
  );

  // Overwrite the style prompt file with the result, which may be an error (potentially unintended)
  await workspace.writeText(stylePath, result.text);
};

/**
 * Main entry point for the style script.
 * Finds all files to style and processes each one sequentially.
 */
export const style = async () => {
  const files = await getFiles({});

  if (files.length === 0) {
    console.log("No files found to style.");
    return;
  }

  // Sequentially process each file to ensure deterministic output and avoid race conditions
  for (const file of files) {
    await processFile(file);
  }
};

export default style;