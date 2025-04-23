# Prompt

- Create a new script called comment.

- The script should use files from the env.files variable.

- Only if no files are provided, use git to figure out which files to comment.

- Only comment staged files.

- If no files are staged in git, stage all files without asking, comment them, and unstage them when you're finished.

- Do not use parameters in the script.

- If there are no files to comment, fail gracefully.

- Comment each file indiidually

- Write the files to the disk when you are finished

- Make sure files which were staged before you started have the changes staged as well

- Use `console.log` instead of `debug`

- Use the GENAISCRIPT_COMMENT_EXTENSIONS variable to decide which files to process. Do not process any other files.

- Do not supply default extensions.