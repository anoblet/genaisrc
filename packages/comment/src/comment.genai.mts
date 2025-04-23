/**
 * Script to add comments to files using AI.
 * It uses files from env.files or finds files to comment from git staged files.
 * If no files are staged, it will stage all files, comment them, and unstage them.
 * Uses GENAISCRIPT_COMMENT_EXTENSIONS environment variable to filter files by extension.
 */

script({
  title: "Comment",
  description: "Add AI-generated comments to your code files",
});

export const comment = async () => {
  let filesToComment: (string | WorkspaceFile)[] = [];
  let stagedFiles: string[] = [];
  let filesThatWereStaged: string[] = [];
  let filesWeStaged: string[] = [];
  
  // Get allowed extensions from environment variable
  const allowedExtensionsStr = process.env.GENAISCRIPT_COMMENT_EXTENSIONS || "";
  const allowedExtensions = allowedExtensionsStr ? allowedExtensionsStr.split(',').map(ext => ext.trim().toLowerCase()) : [];
  
  if (allowedExtensions.length === 0) {
    console.log("No file extensions specified in GENAISCRIPT_COMMENT_EXTENSIONS. Please set this environment variable.");
    return;
  }
  
  console.log(`Using allowed file extensions: ${allowedExtensions.join(', ')}`);

  // First, check if files were provided directly
  if (env.files && env.files.length > 0) {
    console.log("Using files provided in env.files");
    filesToComment = env.files;
  } else {
    // If no files provided, check git staged files
    console.log("No files provided, checking git staged files");
    try {
      const stagedChangesOutput = await git.exec(["diff", "--cached", "--name-only"]);
      
      if (stagedChangesOutput && stagedChangesOutput.trim().length > 0) {
        stagedFiles = stagedChangesOutput.trim().split("\n");
        console.log(`Found ${stagedFiles.length} staged files`);
        filesToComment = stagedFiles;
        filesThatWereStaged = [...stagedFiles];
      } else {
        // No staged files, stage all files
        console.log("No staged files found, staging all files");
        await git.exec(["add", "-A"]);
        
        // Get the newly staged files
        const allStagedOutput = await git.exec(["diff", "--cached", "--name-only"]);
        if (allStagedOutput && allStagedOutput.trim().length > 0) {
          stagedFiles = allStagedOutput.trim().split("\n");
          filesWeStaged = [...stagedFiles];
          filesToComment = stagedFiles;
          console.log(`Staged ${stagedFiles.length} files`);
        } else {
          console.log("No files to stage, exiting");
          return;
        }
      }
    } catch (error) {
      console.log("Error accessing git repository:", error);
      return;
    }
  }

  // Filter files by extension
  const filteredFiles = filesToComment.filter(file => {
    const filePath = typeof file === 'string' ? file : file.filename;
    const fileExt = filePath.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(fileExt);
  });
  
  console.log(`Filtered ${filesToComment.length} files to ${filteredFiles.length} files with allowed extensions`);
  filesToComment = filteredFiles;

  // Fail gracefully if no files to comment
  if (!filesToComment || filesToComment.length === 0) {
    console.log("No files to comment, exiting");
    return;
  }

  // Process each file individually
  for (const file of filesToComment) {
    try {
      const filePath = typeof file === 'string' ? file : file.filename;
      console.log(`Processing file: ${filePath}`);
      
      // Read the file
      const fileObj = await workspace.readText(filePath);
      
      if (!fileObj || !fileObj.content) {
        console.log(`Skipping empty file: ${filePath}`);
        continue;
      }

      // Generate comments for the file
      const result = await addCommentsToFile(filePath, fileObj.content);
      
      // Only write the file back if there was no error
      if (result.error) {
        console.log(`Error processing ${filePath}: ${result.error}`);
        console.log("Skipping file modification due to error");
        continue;
      }
      
      // Write the commented file back
      await workspace.writeText(filePath, result.content);
      
      // If the file was staged before, stage it again
      if (filesThatWereStaged.includes(filePath)) {
        console.log(`Re-staging modified file: ${filePath}`);
        await git.exec(["add", filePath]);
      }
    } catch (error) {
      console.log(`Error processing file ${typeof file === 'string' ? file : file.filename}:`, error);
    }
  }

  // Unstage files that weren't staged before
  if (filesWeStaged.length > 0) {
    console.log("Unstaging files that weren't staged before");
    await git.exec(["restore", "--staged", "."]);
  }
};

/**
 * Add comments to a file using AI.
 * Returns an object containing the commented content or an error if one occurred.
 */
async function addCommentsToFile(file: string, fileContent: string): Promise<{ content: string; error?: string }> {
  console.log(`Generating comments for ${file}`);
  
  // Determine file extension
  const fileExt = file.split('.').pop()?.toLowerCase();
  
  try {
    // Run the prompt to generate comments
    const result = await runPrompt(
      (_) => {
        _.def("FILE_CONTENT", fileContent, {
          maxTokens: 10000,
          language: fileExt,
        });
        
        _.$`Add helpful and descriptive comments to the FILE_CONTENT. 
        Focus on complex logic, non-obvious functionality, and important sections.
        Use the appropriate comment syntax for the file type.
        Return the entire file with comments added.
        Preserve all existing code and comments.
        Don't change any functionality.`;
      },
      {
        model: "github_copilot_chat:gpt-4.1",
        label: "generate code comments",
        system: ["system.assistant"],
        systemSafety: true,
        responseType: "text",
      }
    );
    
    if (result.error) {
      return { content: fileContent, error: result.error.toString() };
    }
    
    if (!result.text) {
      return { content: fileContent, error: "No output returned from LLM" };
    }
    
    return { content: result.text };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { content: fileContent, error: errorMessage };
  }
}

export default comment;