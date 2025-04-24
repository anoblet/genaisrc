 - Create a script which generates a git commit message from the files changed

 - The script name is `message`. The package has already been created.

 - Use this script as a reference: https://raw.githubusercontent.com/microsoft/genaiscript/refs/heads/main/packages/sample/genaisrc/samples/gcm.genai.mts

 - Only use staged files, or if no files are staged, stage all files, do not ask to stage files

 - Use the conventional commit format(https://www.conventionalcommits.org/en/v1.0.0/)

  - Commit after you are finished.

 - Do not use parameters

 - Do not require user input

 - Fail gracefully

 - Chunk the diff similar to the way the referenced script does
