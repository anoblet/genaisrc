import { fileURLToPath } from "url";
import { envArray, envBoolean, getFiles, getModel, stageFiles } from "../../utility/src/utility.ts";

// Determine if comment generation is enabled via environment variable
const enabled = envBoolean("GENAISCRIPT_COMMENT_ENABLED");

const model = getModel();

/**
 * Script metadata for the code comment generator tool.
 * Used by the script runner to provide context and description.
 */
script({
  model,
  title: "Comment",
  description: "Comment",
});

// Resolve the path to the AI prompt template for comment generation
const promptPath = fileURLToPath(
  new URL("./comment.genai.md", import.meta.url),
);

// Read the prompt template content for use in AI requests
const prompt = (await workspace.readText(promptPath)).content;

/**
 * Main entry point for the comment generator.
 * Finds relevant files, processes them to add comments, and stages the changes.
 */
export const comment = async () => {
  try {
    // Check if the comment generation feature is enabled
    if (!enabled) {
      console.log("Comments are disabled.");
      return;
    }

    console.log("Starting comment generation...");

    // Retrieve files matching the configured extensions for commenting
    const files = await getFiles({
      include: envArray("GENAISCRIPT_COMMENT_EXTENSIONS"),
    });

    if (files.length === 0) {
      console.log("No files found to comment.");
      return;
    }

    // Iterate through each file and attempt to process it for comment generation
    for (const file of files) {
      try {
        // Attempt to process each file individually, allowing the script to continue on error
        await processFile(file);
      } catch (error) {
        // Log errors for individual files but continue processing others
        console.log(
          `Error processing file ${typeof file === "string" ? file : file.filename}:`,
          error,
        );
      }
    }

    // Stage all processed files for commit
    await stageFiles({ files });
  } catch (error) {
    // Handle any errors that occur during the overall process
    console.error("An error occurred while generating comments:", error);
  }

  console.log("Comment generation completed.");
};

/**
 * Processes a single file by generating comments using an AI prompt and writing the result.
 * 
 * @param file The file object containing filename, content, and type
 * @returns An object with error information if comment generation fails
 */
async function processFile(file) {
  try {
    console.log(`Processing file: ${file.filename}`);

    // Run the AI prompt to generate comments for the file content
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
        model,
        label: "Comment Code",
        system: ["system.assistant"],
        systemSafety: true,
        responseType: "text",
      },
    );

    // If the AI declines to generate a comment, log and skip writing
    if("Sorry, I can't assist with that." === result.text) {
      console.log(`No comment generated for file: ${file.filename}`);
    }

    // Overwrite the file with the commented version
    await workspace.writeText(file.filename, result.text);
  } catch (error) {
    console.error(`Error generating comment for file ${file.filename}:`, error);

    // Return an object with error information if comment generation fails
    return {
      error: {
        message: `Failed to generate comment for ${file.filename}`,
        details: error.message,
      },
      file: file.filename,
    };
  }
}

export default comment;