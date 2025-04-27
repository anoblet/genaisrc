# CODE_STYLE

## General Principles

- Write clear, concise, and readable code.
- Prefer explicitness over implicitness.
- Use modern JavaScript/TypeScript features where appropriate.
- Keep functions small and focused on a single responsibility.
- Use descriptive names for variables, functions, and files.
- Avoid magic numbers and hardcoded values; use constants or configuration.
- Handle errors gracefully and provide meaningful messages.
- Prefer async/await for asynchronous code.
- Use consistent formatting and indentation (2 spaces).
- Add comments where necessary, but prefer self-explanatory code.
- Structure code to be easily extensible and maintainable.
- Prioritize clarity in control flow, especially in async logic.
- Use early returns to reduce nesting and improve readability.

## Imports

- Use ES module syntax (`import`/`export`).
- Group imports: external modules first, then internal modules, then styles/assets.
- Use relative imports for local files.
- Avoid unused imports.
- Order imports alphabetically within groups for consistency.

## File Structure

- Place related functions and constants together.
- Export only what is necessary.
- Keep files focused; split large files.
- Place configuration and constants at the top of the file.
- Use default exports only when a file has a single main export.

## Functions

- Use arrow functions for anonymous or inline functions.
- Use `async`/`await` for asynchronous operations.
- Prefer destructuring for function parameters when dealing with objects.
- Document function purpose and parameters if not obvious.
- Keep function bodies short; delegate to helpers if logic grows.
- Use clear, imperative names for actions (e.g., getFiles, runPrompt).

## Variables and Constants

- Use `const` by default; use `let` only when reassignment is needed.
- Use descriptive names; avoid single-letter names except for counters or iterators.
- Group related constants at the top of the file.
- Prefer camelCase for variable and function names.
- Use UPPER_CASE for constants that are truly constant.

## Prompts and Templates

- Store prompt templates in separate files when they are large or reused.
- Use template literals for multi-line strings.
- Read prompt templates asynchronously and cache if reused.

## Logging and Output

- Use `console.log` for informational messages.
- Provide clear, actionable output messages.
- Avoid leaving debug logs in production code.
- Use consistent, user-friendly phrasing in logs.

## Error Handling

- Check for error conditions early and return or throw as appropriate.
- Provide meaningful error messages.
- Prefer returning early on error to reduce nesting.

## Style and Formatting

- Use 2 spaces for indentation.
- Use semicolons.
- Use single quotes for strings, except when template literals are needed.
- Place spaces after commas and around operators.
- Keep lines under 100 characters when possible.
- Align object properties and parameters for readability.
- Prefer trailing commas in multiline objects and arrays.

## Comments

- Use comments to explain why, not what.
- Update comments when code changes.
- Use JSDoc for exported functions if needed.
- Prefer self-explanatory code over excessive comments.

## Async Patterns

- Always use async/await for asynchronous code; avoid raw Promises.
- Await all asynchronous operations unless concurrency is required.
- Handle errors in async functions with try/catch or error returns.

## Unique Qualities

- Use a top-down structure: configuration/constants, then main logic, then exports.
- Use workspace and utility abstractions for file and prompt handling.
- Prefer explicit script configuration (e.g., script({ title: "Style" })).
- Use clear, descriptive labels for prompt invocations.
- Emphasize modularity: each file should encapsulate a single concern.
- Use destructuring and template literals to keep code concise and expressive.
- Prefer clarity and maintainability over cleverness or brevity.

## Example

import { getFiles } from '../../utility/src/utility.ts';
import { fileURLToPath } from 'url';

const promptPath = fileURLToPath(new URL('style.prompt.md', import.meta.url));
const prompt = (await workspace.readText(promptPath)).content;

script({
  title: 'Style',
});

export const style = async () => {
  const files = await getFiles({});

  if (files.length === 0) {
    console.log('No files found to style.');
    return;
  }

  const file = files[0];

  const codeStyle = await workspace.readText('CODE_STYLE.md');

  const result = await runPrompt(
    (_) => {
      _.def('CODE_STYLE', codeStyle, {
        maxTokens: 10000,
      });

      _.def('FILE_CONTENT', file.content, {
        maxTokens: 10000,
      });

      _.$`${prompt}`;
    },
    {
      model: 'github_copilot_chat:gpt-4.1',
      label: 'Style Code',
      system: ['system.assistant'],
      systemSafety: true,
      responseType: 'text',
    },
  );

  await workspace.writeText('CODE_STYLE.md', result.text);
};

export default style;

Follow these conventions for all code in this project.