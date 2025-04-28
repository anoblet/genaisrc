# Style

A GenAIScript package that iteratively improves code style documentation based on file examples.

## Overview

The Style script analyzes file content and uses it to improve and evolve coding style guidelines stored in a `CODE-STYLE.md` file. It's designed to learn from your codebase and iteratively enhance your code style documentation.

## Features

- Reads existing code style guidelines from `CODE-STYLE.md` in your project root
- Examines specified files as examples of ideal code
- Uses AI to iteratively improve the style guide based on the examples
- Preserves existing guidelines while adding new insights
- Updates the `CODE-STYLE.md` file with improved instructions

## Usage

### Requirements

- A `CODE-STYLE.md` file in your project root (will be created if it doesn't exist)
- Files to analyze as examples of desired code style

### Running the Script

```bash
npx genaiscript run style "src/**/*.ts"
```

This will:
1. Read your existing `CODE-STYLE.md` file
2. Analyze the provided files as examples of good code
3. Update your `CODE-STYLE.md` with improved guidelines

### Environment Variables

- `GENAISCRIPT_STYLE_MAX_TOKENS`: Maximum token limit for processing (defaults to 10000)

## How It Works

The Style script:
1. Loads your existing code style guide
2. Processes each input file as an example of ideal code
3. Uses AI to identify patterns, conventions, and best practices
4. Updates your style guide to reflect these insights
5. Maintains your existing guidelines while adding improvements

## Integration with Other Tools

This script works well in your development workflow:

- Run periodically to keep style guides updated with evolving patterns
- Include in onboarding processes to document your team's coding standards
- Use before code reviews to ensure style guidelines are current

## License

ISC