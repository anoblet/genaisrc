# Code Style Guidelines

## General Principles
- Write concise, readable, and maintainable code.
- Prefer clarity over cleverness.
- Use descriptive names for variables, functions, and parameters.
- Document all exported functions with clear JSDoc comments, including parameter and return types, and behavior notes.
- Handle edge cases and invalid input defensively.
- Structure code for easy navigation and logical grouping.
- Organize files and directories with clear, purpose-driven naming (e.g., `.env` for environment, `.specstory/.what-is-this.md` for documentation).
- Use `.gitignore` or similar to exclude generated or dependency directories (e.g., `node_modules`).
- Prefer explicit over implicit logic.
- Avoid magic values; use clear, documented defaults.
- Keep functions pure unless side effects are required (e.g., git operations).
- Use constants for repeated values.
- Organize code into logical modules with clear responsibilities.
- Use dedicated files for documentation and explanations (e.g., `.specstory/.what-is-this.md`).
- Maintain a clean project root by grouping related files and using `.gitignore` for dependencies and build artifacts.
- Prefer early returns for invalid or trivial cases to reduce nesting.
- Favor immutability and avoid mutating input arguments.
- Use helper functions for repeated logic and to keep functions short.
- Prefer composition over inheritance for code reuse.
- Use consistent whitespace and indentation throughout the codebase.
- **Log errors with clear, contextual messages, including file or function names where possible.**
- **Allow for partial failure in batch operations by handling errors per item and continuing processing.**
- **Use try/catch blocks only around code that may throw, and keep error scopes as narrow as possible.**
- **When using async/await, always handle errors at each await point where failure is possible.**
- **Prefer explicit destructuring for object parameters, especially when passing file or configuration objects.**
- **Annotate all script entry points and main functions with JSDoc, describing their purpose and flow.**
- **When using external prompts or templates, load them defensively and validate their content before use.**
- **When iterating over arrays of files or objects, prefer for...of for clarity and async compatibility.**
- **When returning from functions that may fail, prefer returning error objects with context over throwing.**
- **When using external APIs or LLMs, validate and sanitize their outputs before use.**
- **When chunking or batching data, document the rationale for chunk size and limits.**
- **Log user-facing and technical errors separately where appropriate.**
- **When overwriting files, especially templates or configuration, document the rationale and ensure this is intentional.**
- **When loading configuration or templates from disk, allow for environment variable overrides and document this behavior.**
- **When registering scripts or modules for discoverability, use clear titles and document their purpose.**
- **Favor utility functions for normalization and validation of input, especially for environment variables and user input.**
- **Ensure all exported functions are covered by unit tests, and document test coverage gaps.**

## TypeScript and Typing
- Add explicit TypeScript type annotations for all function parameters and return types, including `Promise` return types.
- Use interfaces or type aliases for structured data (e.g., file objects, error responses).
- Prefer specific types over `any`; use `unknown` if the type cannot be determined.
- Annotate error parameters in catch blocks with `: unknown` or `: any` as appropriate.
- Document all interfaces and types with JSDoc.
- Use type-safe patterns for error handling and function signatures.
- Ensure all `.mts` files have complete type coverage.
- Use union types for parameters that accept multiple shapes (e.g., string | FileObject).
- Prefer explicit destructuring for object parameters.
- Use readonly properties in interfaces where mutation is not intended.
- Prefer enums or literal types for known value sets.
- **When returning error objects, define and use a consistent error interface with message and details fields.**
- **Annotate all async functions with their full return type, including Promise-wrapped types.**
- **When using external libraries or APIs, type their results and parameters explicitly.**
- **Document the expected structure of external API responses and validate them at runtime.**
- **When using workspace or script APIs, type their return values and parameters for clarity and safety.**
- **Document the rationale for type choices, especially when using union or intersection types.**
- **Use type guards for runtime validation of unknown input, especially when processing external data.**

## Functions
- Use arrow functions for all function definitions.
- Prefer explicit parameter destructuring for objects.
- Default parameters should be used for optional arguments.
- Functions should do one thing and do it well.
- Return early for invalid or trivial cases.
- Limit function length; refactor long functions into smaller helpers.
- Avoid side effects unless explicitly required.
- Export only what is necessary; keep helpers private unless needed externally.
- Document all exported functions with JSDoc, including parameter and return types, and edge case notes.
- Always apply filtering or transformation functions, even if input is undefined, to ensure consistent output types.
- Use async/await for asynchronous code, and always annotate async function return types.
- Avoid deeply nested callbacks or promise chains.
- **When processing collections, handle each item independently and log errors per item.**
- **When a function is intended to be used as a script entry point, annotate it with a clear JSDoc summary.**
- **If a function writes to disk or performs side effects, document this in its JSDoc.**
- **When using external prompts or templates, pass them as parameters or load them at the top of the function for clarity.**
- **When combining results from multiple async operations, document the aggregation logic and handle partial failures.**
- **When using chunking or batching, explain the logic and limits in comments.**
- **When using environment variables to control behavior (e.g., enabling/disabling features, overriding paths), document their effect and provide safe defaults.**
- **When processing files, ensure that file operations (read/write) are atomic and handle errors gracefully.**
- **When overwriting files, especially templates, confirm this is intentional and document the rationale.**
- **Use helper functions for normalization and validation of input, especially for environment variables and user input.**
- **Ensure all exported functions are covered by unit tests, and document test coverage gaps.**

## Arrays and Objects
- Use array methods (`map`, `filter`, etc.) for transformations and filtering.
- Always check for undefined or empty arrays before processing.
- Prefer immutable operations; avoid mutating input arguments.
- Use object spread/rest for shallow copies and updates.
- Validate object shapes and array contents defensively.
- Use plural names for arrays, singular for single items.
- Define interfaces for structured objects and use them consistently.
- Normalize array and object data before processing (e.g., lowercase, trim).
- Prefer `Record<string, T>` for key-value maps over plain objects when appropriate.
- **When iterating over arrays with async operations, use for...of to ensure sequential processing if needed.**
- **When returning arrays of results, include error objects for failed items if partial failure is possible.**
- **When aggregating results from multiple chunks or batches, document the aggregation and error handling strategy.**
- **When loading or processing file objects, ensure they have the expected properties (e.g., .content) and validate before use.**
- **Use utility functions for normalization and validation of arrays and objects, especially when processing user or environment input.**

## String Handling
- Normalize strings for comparison (e.g., `toLowerCase()`, `trim()`).
- Handle empty, null, or undefined strings gracefully.
- Prefer template literals for string composition.
- Avoid concatenation with non-string types.
- Use constants for repeated string values.
- Always document normalization and transformation steps in comments.
- Validate and sanitize external string input.
- **When loading external templates or prompts, validate their content and handle missing or empty cases gracefully.**
- **When generating or combining multi-part strings (e.g., commit messages), document the logic and ensure proper formatting.**
- **When using string-based configuration (e.g., environment variables for paths), validate and normalize before use.**
- **Use utility functions for normalization and validation of string input, especially for environment variables and user input.**

## Error Handling
- Fail gracefully and return safe defaults (e.g., empty arrays, `undefined`, or `false`).
- Avoid throwing unless absolutely necessary.
- Log errors with context when side effects are required.
- Use try/catch only around code that may throw.
- Provide actionable feedback in error messages.
- Use typed error responses (e.g., `ErrorResponse` interface) for error handling.
- Prefer returning error objects or safe defaults over throwing exceptions.
- Always include error context (e.g., function name, parameters) in logs or error objects.
- **When processing multiple files or items, log errors per item and continue processing others.**
- **When returning error objects, include both user-facing message and technical details.**
- **When catching errors, prefer using error instanceof Error to extract message safely.**
- **Log errors from external APIs or LLMs with both user-facing and technical details.**
- **When aggregating errors from batch operations, summarize and report them clearly.**
- **When overwriting files, especially templates, ensure errors are logged and the operation is intentional.**
- **Use utility functions for normalization and validation of error input, especially when processing user or environment input.**

## Comments and Documentation
- Use JSDoc for all exported functions, describing parameters, return values, and edge cases.
- Inline comments should clarify intent, not restate code.
- Update comments and documentation when code changes.
- Prefer comments that explain "why" over "what".
- Document the purpose of special files and directories (e.g., `.specstory/.what-is-this.md`).
- Document all interfaces and types.
- Summarize rationale for type additions or changes in code comments or commit messages.
- Use TODO and FIXME comments sparingly and resolve them promptly.
- **Annotate script metadata and configuration blocks with comments explaining their purpose.**
- **Document the flow of main script entry points, including error handling and side effects.**
- **Document chunking, batching, and aggregation logic, especially when interacting with external APIs.**
- **When overwriting files, especially templates, document the rationale and ensure this is intentional.**
- **Document normalization and validation steps for environment variables and user input.**

## Naming
- Use camelCase for variables and functions.
- Use descriptive names that reflect purpose and usage.
- Use singular names for single items, plural for arrays.
- Avoid abbreviations unless widely understood.
- Name files and directories to reflect their content and purpose.
- Use clear, consistent naming for parameters, especially in destructured objects.
- Prefix boolean variables and functions with `is`, `has`, or `can` for clarity.
- **When naming error objects or responses, use the Error suffix for clarity (e.g., FileProcessError).**
- **When naming functions that perform side effects, use verbs that indicate action (e.g., processFile, stageFiles).**
- **Name chunked or aggregated variables to reflect their role (e.g., chunkSize, commitMessage, summaryResult).**
- **When registering scripts or modules, use clear and descriptive titles for discoverability.**
- **Use names that reflect normalization or validation when returning processed input (e.g., normalizedFiles, validatedEnvArray).**

## Git Integration
- When interacting with git, prefer explicit file operations over broad actions.
- Always return the resulting state after performing git operations.
- Validate file paths and git states before operations.
- Handle git errors gracefully and report actionable feedback.
- Exclude dependencies and generated files from version control (e.g., `node_modules`).
- Stage only specified files when possible to avoid unintended changes.
- Document any git-related side effects or assumptions in code comments.
- **When generating commit messages, document the prompt logic and validation steps.**
- **When chunking diffs for commit message generation, explain the rationale and limits.**
- **When staging files after processing, ensure only intended files are staged and document this behavior.**
- **Use utility functions for normalization and validation of git input, especially when processing user or environment input.**

## Environment Variables
- Normalize and validate environment variable input.
- Convert environment variables to appropriate types (arrays, booleans) with defensive checks.
- Document expected environment variables and their types.
- Provide defaults for optional environment variables.
- Store environment configuration in a dedicated `.env` file.
- Always document normalization and conversion logic for environment variables.
- Avoid leaking sensitive environment variable values in logs or errors.
- **When using environment variables to configure file extensions or filters, validate and document their expected format.**
- **When allowing environment variable overrides for configuration or template paths, document this and provide safe defaults.**
- **When using environment variables to enable/disable features, document their effect and provide clear feedback to the user.**
- **Use utility functions for normalization and validation of environment variable input, especially for arrays and booleans.**

## Example Patterns
- Defensive checks for undefined, null, or empty values.
- Consistent use of normalization for string and array inputs.
- Clear separation of concerns between filtering, staging, and environment parsing logic.
- Use helper functions for repeated logic.
- Structure exports for clarity and discoverability.
- Prefer returning arrays or objects over null or undefined, unless undefined is a meaningful signal.
- Use type guards for runtime type validation when handling unknown input.
- **When processing files, handle each file independently and log errors per file.**
- **When using external prompts, load and validate them before use.**
- **When writing to disk, ensure atomicity and handle write errors gracefully.**
- **When aggregating results from multiple sources (e.g., LLM responses), document and validate the aggregation logic.**
- **When overwriting files, especially templates, confirm this is intentional and document the rationale.**
- **When registering scripts or modules, use clear titles and document their purpose.**
- **Use utility functions for normalization and validation of input, especially for environment variables and user input.**
- **Ensure all exported functions are covered by unit tests, and document test coverage gaps.**

## Improvements from Example
- Add TypeScript types and interfaces for all structured data.
- Annotate all function return types, especially for async functions.
- Use JSDoc to document all exported functions and interfaces.
- Prefer interfaces for file and error objects, as shown in the example.
- Ensure all error handling is type-safe and returns typed responses.
- Summarize changes and document rationale for type additions in code comments or commit messages.
- Use union types and explicit destructuring for flexible, type-safe APIs.
- Always apply filters and transformations defensively, even if input is undefined or empty.
- Review and refactor code regularly to maintain adherence to these guidelines.
- **Handle partial failure in batch operations by logging errors per item and continuing processing.**
- **Annotate script entry points and main functions with JSDoc, describing their flow and error handling.**
- **When loading external prompts or templates, validate their content and handle missing cases gracefully.**
- **When returning error objects, include both user-facing and technical details.**
- **Use for...of for async iteration over arrays to ensure sequential processing and error handling.**
- **When chunking or batching data for LLMs or APIs, document the logic and handle aggregation of results and errors.**
- **When combining multi-part outputs (e.g., commit messages), ensure formatting is consistent and document the process.**
- **When using LLMs or external APIs, always validate and sanitize their outputs before use.**
- **When overwriting files, especially templates or configuration, document the rationale and ensure this is intentional.**
- **When registering scripts or modules, use clear and descriptive titles for discoverability.**
- **Use utility functions for normalization and validation of input, especially for environment variables and user input.**
- **Ensure all exported functions are covered by unit tests, and document test coverage gaps.**