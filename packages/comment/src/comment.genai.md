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
- For general function comments, use a single line unless using formal documentation
- For JavaScript/TypeScript:
  - Use JSDoc or TSDoc for all public functions, classes, and methods
  - Use single-line comments for implementation details
  - Document parameters, return values, and potential errors in JSDoc/TSDoc
- For Python: Use docstrings (""") for modules, classes, and functions
- For C#/Java: Use XML comments
- For other languages: Follow language-specific best practices

## Examples of Good Comments
```javascript
// BAD: This function adds two numbers
// GOOD: Calculate the sum with overflow protection for large integers

// BAD: Loop through array
// GOOD: Process each transaction in chronological order to maintain state consistency

// BAD: Multiple line comments for simple functions
// function addNumbers(a, b) {
//   // This function adds two numbers
//   // It takes a and b as parameters
//   // And returns their sum
//   return a + b;
// }

// GOOD: Single line comment for simple functions
// function addNumbers(a, b) {
//   // Calculate sum, ensuring numeric conversion
//   return Number(a) + Number(b);
// }

// GOOD: JSDoc for public functions
/**
 * Calculates the sum of two numbers with type checking and overflow protection
 * 
 * @param {number} a - First number to add
 * @param {number} b - Second number to add
 * @returns {number} The sum of a and b
 * @throws {Error} When inputs are not valid numbers
 */
// function safeAdd(a, b) {
//   // Implementation details
// }
```

## Instructions
- Return the entire file with comments added
- Preserve all existing code and comments exactly as they are
- Don't modify any functionality or code structure
- Insert helpful comments where they add value
- Use JSDoc/TSDoc for all public APIs, classes, functions and methods in JavaScript/TypeScript
- Use single-line comments for implementation details
- Keep comments clear and concise, don't elaborate when not needed
- If comments already exist, are up to date, and sufficient, do not add more comments