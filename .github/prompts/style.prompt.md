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

## Arrays and Objects
- Use array methods (`map`, `filter`, etc.) for transformations and filtering.
- Always check for undefined or empty arrays before processing.
- Prefer immutable operations; avoid mutating input arguments.
- Use object spread/rest for shallow copies and updates.
- Validate object shapes and array contents defensively.
- Use plural names for arrays, singular for single items.
- Define interfaces for structured objects and use them consistently.
- Normalize array and object data before processing (e.g., lowercase, trim).

## String Handling
- Normalize strings for comparison (e.g., `toLowerCase()`, `trim()`).
- Handle empty, null, or undefined strings gracefully.
- Prefer template literals for string composition.
- Avoid concatenation with non-string types.
- Use constants for repeated string values.
- Always document normalization and transformation steps in comments.

## Error Handling
- Fail gracefully and return safe defaults (e.g., empty arrays, `undefined`, or `false`).
- Avoid throwing unless absolutely necessary.
- Log errors with context when side effects are required.
- Use try/catch only around code that may throw.
- Provide actionable feedback in error messages.
- Use typed error responses (e.g., `ErrorResponse` interface) for error handling.
- Prefer returning error objects or safe defaults over throwing exceptions.

## Comments and Documentation
- Use JSDoc for all exported functions, describing parameters, return values, and edge cases.
- Inline comments should clarify intent, not restate code.
- Update comments and documentation when code changes.
- Prefer comments that explain "why" over "what".
- Document the purpose of special files and directories (e.g., `.specstory/.what-is-this.md`).
- Document all interfaces and types.
- Summarize rationale for type additions or changes in code comments or commit messages.

## Naming
- Use camelCase for variables and functions.
- Use descriptive names that reflect purpose and usage.
- Use singular names for single items, plural for arrays.
- Avoid abbreviations unless widely understood.
- Name files and directories to reflect their content and purpose.
- Use clear, consistent naming for parameters, especially in destructured objects.

## Git Integration
- When interacting with git, prefer explicit file operations over broad actions.
- Always return the resulting state after performing git operations.
- Validate file paths and git states before operations.
- Handle git errors gracefully and report actionable feedback.
- Exclude dependencies and generated files from version control (e.g., `node_modules`).
- Stage only specified files when possible to avoid unintended changes.

## Environment Variables
- Normalize and validate environment variable input.
- Convert environment variables to appropriate types (arrays, booleans) with defensive checks.
- Document expected environment variables and their types.
- Provide defaults for optional environment variables.
- Store environment configuration in a dedicated `.env` file.
- Always document normalization and conversion logic for environment variables.

## Example Patterns
- Defensive checks for undefined, null, or empty values.
- Consistent use of normalization for string and array inputs.
- Clear separation of concerns between filtering, staging, and environment parsing logic.
- Use helper functions for repeated logic.
- Structure exports for clarity and discoverability.
- Prefer returning arrays or objects over null or undefined, unless undefined is a meaningful signal.

## Improvements from Example
- Add TypeScript types and interfaces for all structured data.
- Annotate all function return types, especially for async functions.
- Use JSDoc to document all exported functions and interfaces.
- Prefer interfaces for file and error objects, as shown in the example.
- Ensure all error handling is type-safe and returns typed responses.
- Summarize changes and document rationale for type additions in code comments or commit messages.
- Use union types and explicit destructuring for flexible, type-safe APIs.
- Always apply filters and transformations defensively, even if input is undefined or empty.