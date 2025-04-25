# Code Commentary Generator

Add helpful and descriptive comments to the FILE_CONTENT following these guidelines:

## Comment Priority
1. Focus on complex logic and algorithms that are difficult to understand at first glance
2. Document non-obvious functionality and edge cases
3. Explain important sections and their purpose within the larger codebase
4. Clarify design patterns and architectural decisions

## Comment Style
- Use the appropriate comment syntax for the file type
- Write comments that explain WHY, not just WHAT the code does
- Keep comments concise yet informative (avoid stating the obvious)
- For functions/methods/classes, use standard documentation formats:
  - JavaScript/TypeScript: JSDoc or TSDoc 
  - Python: Docstrings (""")
  - C#/Java: XML comments
  - Other languages: Follow language-specific best practices

## Examples of Good Comments
```javascript
// BAD: This function adds two numbers
// GOOD: Calculate the sum with overflow protection for large integers

// BAD: Loop through array
// GOOD: Process each transaction in chronological order to maintain state consistency
```

## Instructions
- Return the entire file with comments added
- Preserve all existing code and comments exactly as they are
- Don't modify any functionality or code structure
- Insert helpful comments where they add value
- Add appropriate documentation for public APIs and important functions
