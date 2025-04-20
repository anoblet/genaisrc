/**
 * Script to add comments to code files using AI.
 * It works with selected files or with staged/changed files if no selection is provided.
 */

const isDefined = (value) => value !== undefined && value !== null;

script({
  model: "github_copilot_chat:gpt-4.1",
  title: "Add Comments",
  description: "Add comments to code files",
});

export const comment = async () => {
  // Check if there are any selected files
  let filesToComment: string[] = [];
  // Store whether we need to stage files after commenting them
  let shouldStageAfter = false;
  // Store whether files were originally staged
  let hadStagedFiles = false;
  
  if (env.files && env.files.length > 0) {
    // Use selected files
    filesToComment = env.files.map(file => file.toString());
    console.log(`Using ${filesToComment.length} selected files`);
  } else {
    // No files selected, check for staged files
    const stagedChanges = await git.exec(["diff", "--cached", "--name-only", "--diff-filter=d"]);
    const hasStaged = stagedChanges && stagedChanges.trim().length > 0;
    
    if (hasStaged) {
      // Use staged files
      filesToComment = stagedChanges.trim().split("\n");
      hadStagedFiles = true;
      shouldStageAfter = true; // Make sure they remain staged
      console.log(`Using ${filesToComment.length} staged files`);
    } else {
      // No staged files, check for changed files
      const changedFiles = await git.exec(["diff", "--name-only", "--diff-filter=d"]);
      const hasChanges = changedFiles && changedFiles.trim().length > 0;
      
      if (hasChanges) {
        // Use changed files, but don't stage them
        filesToComment = changedFiles.trim().split("\n");
        console.log(`Using ${filesToComment.length} changed files (not staging them)`);
      } else {
        // No changes at all
        console.log("No files selected, staged, or changed. Nothing to process.");
        return; // Exit gracefully
      }
    }
  }

  // Filter out binary files and non-code files
  const codeExtensions = [
    ".js", ".ts", ".jsx", ".tsx", ".mjs", ".mts",
    ".py", ".rb", ".java", ".cs", ".go", ".rs",
    ".php", ".c", ".cpp", ".h", ".hpp", ".swift",
    ".kt", ".scala", ".sh", ".bash", ".pl"
  ];
  
  filesToComment = filesToComment.filter(file => {
    const lastDotIndex = file.lastIndexOf(".");
    // Skip files without extensions
    if (lastDotIndex === -1) return false;
    const extension = file.substring(lastDotIndex).toLowerCase();
    return codeExtensions.includes(extension);
  });
  
  if (filesToComment.length === 0) {
    console.log("No supported code files found to comment. Nothing to process.");
    return; // Exit gracefully
  }
  
  console.log(`Found ${filesToComment.length} code files to process`);

  // Process each file
  for (const file of filesToComment) {
    try {
      // Read file content
      const content = await workspace.readText(file);
      const contentStr = content?.toString() || "";
      if (contentStr.trim().length === 0) {
        console.log(`Skipping empty file: ${file}`);
        continue;
      }

      console.log(`Adding comments to ${file}`);
      
      // Generate comments for the file
      const result = await runPrompt(
        (ctx) => {
          // Safe extraction of file extension for language detection
          const lastDotIndex = file.lastIndexOf('.');
          const language = lastDotIndex !== -1 ? file.substring(lastDotIndex + 1) : '';
          
          ctx.def("CODE", content, {
            language: language,
            lineNumbers: true,
          });
          
          ctx.$`Add helpful comments to the CODE file. 
          Follow these guidelines:
          - Add function and class documentation comments
          - Explain complex logic or algorithms
          - Don't comment obvious code
          - Keep comments concise and relevant
          - Use the appropriate comment style for the language (// for JS/TS, # for Python, etc.)
          - Don't modify the actual code, only add comments
          - Return the entire file with comments added`;
        },
        {
          model: "github_copilot_chat:gpt-4.1",
          label: `commenting ${file}`,
          system: ["system.assistant"],
          systemSafety: true,
          responseType: "text",
        }
      );

      if (result.error) {
        console.error(`Error generating comments for ${file}: ${result.error}`);
        continue;
      }

      // Extract commented code - use the first fence or the full text if no fence
      let commentedCode = result.fences?.[0]?.content || result.text;
      
      // Ensure the file ends with a newline
      if (!commentedCode.endsWith('\n')) {
        commentedCode += '\n';
      }
      
      // Write the commented code back to the file
      await workspace.writeText(file, commentedCode);
      console.log(`Successfully added comments to ${file}`);
      
    } catch (error) {
      console.error(`Error processing file ${file}: ${error}`);
    }
  }

  console.log("Comments have been added to all processed files.");
  
  // Handle staging according to the rules
  if (shouldStageAfter) {
    // Re-stage all files that were originally staged
    console.log("Re-staging files that were originally staged");
    for (const file of filesToComment) {
      await git.exec(["add", file]);
    }
    console.log("Files have been re-staged");
  } else {
    console.log("Files remain unstaged as per requirements");
  }
};

export default comment;