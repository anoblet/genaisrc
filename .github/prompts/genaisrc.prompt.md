- Check if a package already exists before creating a new one

- Use the following format for the script:

```
export const [SCRIPT_NAME] = async () => {
  [CODE]
};

export default [SCRIPT_NAME];
```

- All scripts should have a package

- New packages are created using: `npm init -y -w packages/[SCRIPT_NAME]`

- If a package already exists, modify or replace it

- New scripts are created using `npx genaiscript script create [SCRIPT_NAME]`. Move all of the files generated from the `genaisrc` directory to the `packages/[SCRIPT_NAME]/src` directory

 - Check for Typescript errors after every change

 - Update the package name in `package.json` to [SCRIPT_NAME]
