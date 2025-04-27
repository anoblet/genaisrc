import { fileURLToPath } from 'url';
import { envArray, getFiles, stageFiles } from "../../utility/src/utility.ts";

// Script metadata for the code comment generator tool
script({
  title: "Comment",
  description: "Add AI-generated comments to your code files",
});

const promptPath = fileURLToPath(new URL("./comment.genai.md", import.meta.url));
const prompt = (await workspace.readText(promptPath)).content;

/**
 * Main entry point for the comment generator.
 * Finds relevant files, processes them to add comments, and stages the changes.
 */
export const comment = async () => {
  // Retrieve files matching the configured extensions for commenting
  const files = await getFiles({ include: envArray(process.env.GENAISCRIPT_COMMENT_EXTENSIONS) });

  if (files.length === 0) {
    console.log("No files found to comment.");
    return;
  }

  for (const file of files) {
    try {
      // Attempt to process each file individually, allowing the script to continue on error
      await processFile(file)
    } catch (error) {
      // Log errors for individual files but continue processing others
      console.log(`Error processing file ${typeof file === 'string' ? file : file.filename}:`, error);
    }
  }

  // Stage all processed files for commit
  await stageFiles({ files });
};

/**
 * Processes a single file by generating comments using an AI prompt and writing the result.
 * @param file The file object containing filename, content, and type
 * @returns An object with error information if comment generation fails
 */
async function processFile(file) {
  try {
    const result = await runPrompt(
      (_) => {
        // Define the file content and language for the AI prompt
        _.def("FILE_CONTENT", file.content, {
          maxTokens: 10000,
          language: file.type,
        });

        // Insert the prompt template for comment generation
        _.$`${prompt}`;
      },
      {
        model: "github_copilot_chat:gpt-4.1",
        label: "generate code comments",
        system: ["system.assistant"],
        systemSafety: true,
        responseType: "text",
      }
    );

    // Overwrite the file with the commented version
    await workspace.writeText(file.filename, result.text);
  } catch (error) {
    // Handle errors during comment generation gracefully
    console.error(`Error generating comments for file ${typeof file === 'string' ? file : file.filename}:`, error);
    return { error: `Failed to generate comments for ${typeof file === 'string' ? file : file.filename}` };
  }
}

export default comment;