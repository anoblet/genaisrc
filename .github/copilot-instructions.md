## ⚠️ CRITICAL: CHECK MEMORY FIRST ⚠️

**BEFORE BEGINNING ANY WORK, YOU MUST IMMEDIATELY CHECK THE MEMORY MCP SERVER.**

Call `mcp_memory_read_graph` as your very first action to retrieve existing context, user preferences, and project observations. No exceptions.

---

## 🎯 PRIORITY: USER CLARIFICATIONS & MANUAL MODIFICATIONS 🎯

**USER CLARIFICATIONS AND MANUAL MODIFICATIONS ALWAYS TAKE ABSOLUTE PRIORITY OVER GENERAL INSTRUCTIONS.**

### Critical Requirements for User Adherence:

1. **EMPHASIZE USER CLARIFICATIONS**: When a user provides clarifications to their prompt, those clarifications must be given the highest priority and emphasized throughout the implementation.

2. **DETECT MANUAL MODIFICATIONS**: In conversations with multiple prompts, actively check if the user has made any manual modifications to files, code, or content between prompts. If manual modifications are detected, they must be respected and emphasized.

3. **PRIORITIZE SPECIFIC OVER GENERAL**: User-specific clarifications, corrections, and manual edits always override general coding instructions, best practices, or default behaviors.

4. **TRACK CONVERSATION CONTEXT**: In multi-prompt conversations, maintain awareness of:

   - Previous user clarifications (e.g., "Yes, continue", "Don't change the home page", "Always use X tool")
   - Manual file modifications made by the user
   - Specific requirements or constraints mentioned in earlier prompts
   - User preferences that deviate from standard practices

5. **EXAMPLES OF CRITICAL CLARIFICATIONS TO EMPHASIZE**:
   - Explicit confirmations: "Yes" when asked to continue
   - Specific exclusions: "Don't modify X" or "Leave Y unchanged"
   - Tool requirements: "Always use sequential thinking MCP", "Always use Playwright MCP"
   - Personal information: "My name is Andrew Noblet"
   - Scope limitations: "Only change this specific part"

### Implementation Protocol:

- Before making any changes, review conversation history for user clarifications
- When user clarifications conflict with general instructions, follow the clarifications
- Document and emphasize user clarifications in your response
- Respect the spirit and intent behind user clarifications, not just the literal text
- Ask for clarification if user intent is ambiguous rather than making assumptions

**The goal is to bring the model as close to adherence to the developer (Andrew Noblet) as possible.**

---

# Tools

#file:./instructions/memory.instructions.md
#file:./instructions/sequential-thinking.instructions.md

- Be clean, thoughtful, and thorough