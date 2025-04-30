# Code Style Guidelines

## General Principles
- Write concise, readable, and maintainable code.
- Prefer clarity over cleverness.
- Use descriptive names for variables, functions, and parameters.
- Document all exported functions with clear JSDoc comments, including parameter and return types, and behavior notes.
- Handle edge cases and invalid input defensively.
- Structure code for easy navigation and logical grouping.

## Functions
- Use arrow functions for all function definitions.
- Prefer explicit parameter destructuring for objects.
- Default parameters should be used for optional arguments.
- Functions should do one thing and do it well.
- Return early for invalid or trivial cases.
- Limit function length; refactor long functions into smaller helpers.
- Avoid side effects unless explicitly required.

## Arrays and Objects
- Use array methods (`map`, `filter`, etc.) for transformations and filtering.
- Always check for undefined or empty arrays before processing.
- Prefer immutable operations; avoid mutating input arguments.
- Use object spread/rest for shallow copies and updates.
- Validate object shapes and array contents defensively.

## String Handling
- Normalize strings for comparison (e.g., `toLowerCase()`, `trim()`).
- Handle empty, null, or undefined strings gracefully.
- Prefer template literals for string composition.
- Avoid concatenation with non-string types.

## Error Handling
- Fail gracefully and return safe defaults (e.g., empty arrays, `undefined`, or `false`).
- Avoid throwing unless absolutely necessary.
- Log errors with context when side effects are required.
- Use try/catch only around code that may throw.

## Comments and Documentation
- Use JSDoc for all exported functions, describing parameters, return values, and edge cases.
- Inline comments should clarify intent, not restate code.
- Update comments and documentation when code changes.
- Prefer comments that explain "why" over "what".

## Naming
- Use camelCase for variables and functions.
- Use descriptive names that reflect purpose and usage.
- Use singular names for single items, plural for arrays.
- Avoid abbreviations unless widely understood.

## Git Integration
- When interacting with git, prefer explicit file operations over broad actions.
- Always return the resulting state after performing git operations.
- Validate file paths and git states before operations.
- Handle git errors gracefully and report actionable feedback.

## Environment Variables
- Normalize and validate environment variable input.
- Convert environment variables to appropriate types (arrays, booleans) with defensive checks.
- Document expected environment variables and their types.
- Provide defaults for optional environment variables.

## Miscellaneous
- Prefer explicit over implicit logic.
- Avoid magic values; use clear, documented defaults.
- Keep functions pure unless side effects are required (e.g., git operations).
- Use constants for repeated values.
- Organize code into logical modules with clear responsibilities.

## Example Patterns
- Defensive checks for undefined, null, or empty values.
- Consistent use of normalization for string and array inputs.
- Clear separation of concerns between filtering, staging, and environment parsing logic.
- Use helper functions for repeated logic.
- Structure exports for clarity and discoverability.