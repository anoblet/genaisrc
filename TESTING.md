# Manual Testing Instructions for GENAISCRIPT_MESSAGE_INCLUDE

## Testing the include pattern functionality

### Setup
1. Set the environment variable:
   ```bash
   export GENAISCRIPT_MESSAGE_INCLUDE="**/*.ts"
   ```

2. Create test files and stage them:
   ```bash
   echo "console.log('test')" > test.ts
   echo "# Test markdown" > test.md
   echo '{"test": true}' > test.json
   git add test.ts test.md test.json
   ```

3. Run the message script to see that only TypeScript files are processed

### Expected Behavior
- When `GENAISCRIPT_MESSAGE_INCLUDE` is set to `**/*.ts`, only TypeScript files should be included in the diff
- When `GENAISCRIPT_MESSAGE_INCLUDE` is not set, all files are considered (existing behavior)
- The exclude pattern from `GENAISCRIPT_MESSAGE_EXCLUDED_PATHS` is applied to the included files

### Test Cases
1. **Include TypeScript only**: `GENAISCRIPT_MESSAGE_INCLUDE="**/*.ts"`
2. **Include multiple extensions**: `GENAISCRIPT_MESSAGE_INCLUDE="**/*.{ts,js,mts}"`
3. **Include with path restrictions**: `GENAISCRIPT_MESSAGE_INCLUDE="src/**/*.ts"`
4. **No include pattern**: Unset variable (default behavior)

### Cleanup
```bash
git reset
rm test.ts test.md test.json
unset GENAISCRIPT_MESSAGE_INCLUDE
```