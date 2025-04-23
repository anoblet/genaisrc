script({
  title: "Comment - AST",
  description: "Adds comments to code files using AST-based transformation",
  system: ["system.assistant", "system.safety_jailbreak", "system.safety_harmful_content"],
});

// Using console.log for debugging instead of the incorrect debug import
const dbg = console.debug;

/**
 * Automatically adds comments to code files using AST-based transformation.
 * This function handles both selected files and git staged/modified files.
 */
export const comment = async () => {
  // Get files from environment or git if none provided
  let files = env.files;
  let useStaged = false;
  let filesWereStaged = false;

  if (!files.length) {
    // Check if there are staged changes
    const stagedFiles = await git.listFiles("staged", { askStageOnEmpty: false });
    
    if (stagedFiles.length > 0) {
      // Use staged files
      files = stagedFiles;
      useStaged = true;
      filesWereStaged = true;
      console.log("Using staged files for commenting");
    } else {
      // Use unstaged/modified files
      files = await git.listFiles("modified");
      console.log("Using unstaged/modified files for commenting");
    }
  }

  if (!files.length) {
    console.log("No files found to comment");
    return; // Fail gracefully by returning instead of canceling
  }

  // Filter to only process code files
  const codeExtensions = [".js", ".ts", ".mts", ".jsx", ".tsx", ".mjs", ".py", ".java", ".c", ".cpp", ".cs", ".go", ".rb", ".php", ".yaml", ".yml"];
  files = files.filter(({ filename }) => 
    codeExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  );

  if (!files.length) {
    console.log("No suitable code files found to comment");
    return; // Fail gracefully by returning instead of canceling
  }

  console.log(`Found ${files.length} code files to comment`);

  // Load ast-grep for AST-based transformation
  const sg = await host.astGrep();
  const changedFiles = [];

  // Process each file
  for (const file of files) {
    console.log(`Processing ${file.filename}`);
    
    // Determine language based on file extension
    let lang = "javascript"; // default
    const ext = file.filename.split('.').pop()?.toLowerCase();
    
    if (ext === "ts" || ext === "mts" || ext === "tsx") lang = "typescript";
    else if (ext === "py") lang = "python";
    else if (ext === "java") lang = "java";
    else if (ext === "c" || ext === "cpp") lang = "cpp";
    else if (ext === "cs") lang = "c_sharp";
    else if (ext === "go") lang = "go";
    else if (ext === "rb") lang = "ruby";
    else if (ext === "php") lang = "php";
    else if (ext === "yaml" || ext === "yml") lang = "yaml";
    
    // Create a changeset for this file
    const edits = sg.changeset();
    let hasChanges = false;
    
    try {
      // Find uncommented functions, classes, and other important code structures
      const { matches } = await sg.search(
        lang,
        file.filename,
        {
          rule: {
            any: [
              // Functions without preceding comments
              {
                kind: "function_declaration",
                not: {
                  precedes: {
                    kind: "comment",
                    stopBy: "neighbor",
                  }
                }
              },
              // Classes without preceding comments
              {
                kind: "class_declaration",
                not: {
                  precedes: {
                    kind: "comment",
                    stopBy: "neighbor",
                  }
                }
              },
              // For Python and other languages: methods without preceding comments
              {
                kind: "method_definition",
                not: {
                  precedes: {
                    kind: "comment",
                    stopBy: "neighbor",
                  }
                }
              }
            ]
          }
        }
      );

      if (matches.length === 0) {
        console.log(`No uncommented code structures found in ${file.filename}`);
        continue;
      }
      
      dbg(`Found ${matches.length} uncommented structures in ${file.filename}`);
      
      // Process each match to add comments
      for (const match of matches) {
        // Get the original code
        const originalCode = match.text();
        
        // Generate a comment for this code structure
        const res = await runPrompt(
          (ctx) => {
            ctx.def("CODE", originalCode);
            ctx.$`Generate a concise, professional, and informative comment for the following code. 
            The comment should describe what the code does, parameters, and return values if applicable.
            If it's a class, describe its purpose.
            Format the comment in the appropriate style for the language (e.g., JSDoc for JavaScript/TypeScript, 
            docstrings for Python, etc.).
            Only return the comment, don't include the code itself.`;
          },
          { 
            label: `Generating comment for ${match.getRoot().filename()}`, 
            cache: "code-comment",
            system: ["system.technical"] 
          }
        );
        
        if (res.error) {
          console.error(`Error generating comment: ${res.error.message}`);
          continue;
        }
        
        // Extract the generated comment
        const commentText = parsers.unfence(res.text, "*") || res.text;
        
        // Create the final code with comment
        const commentedCode = `${commentText}\n${originalCode}`;
        
        // Apply the edit
        edits.replace(match, commentedCode);
        hasChanges = true;
      }
      
      // If we have changes, commit them
      if (hasChanges) {
        const modifiedFiles = edits.commit();
        
        if (modifiedFiles.length > 0) {
          // Write the changes to disk
          await workspace.writeFiles(modifiedFiles);
          changedFiles.push(file.filename);
          console.log(`Added comments to ${file.filename}`);
        }
      }
      
      // If the files were originally staged, stage them again
      if (useStaged && hasChanges) {
        await git.exec(["add", file.filename]);
        console.log(`Re-staged ${file.filename}`);
      }
    } catch (error) {
      console.error(`Error processing ${file.filename}:`, error);
    }
  }

  // Summary
  if (changedFiles.length > 0) {
    console.log(`\nSuccessfully added comments to ${changedFiles.length} files:`);
    for (const file of changedFiles) {
      console.log(` - ${file}`);
    }
  } else {
    console.log("\nNo files were modified.");
  }
};

// Default export of the comment function
export default comment;