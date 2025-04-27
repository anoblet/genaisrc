import { getFiles } from "../../utility/src/utility.ts";
import { fileURLToPath } from "url";

const maxTokens = process.env.GENAISCRIPT_STYLE_MAX_TOKENS
  ? parseInt(process.env.GENAISCRIPT_STYLE_MAX_TOKENS, 10)
  : 10000;

const promptPath = fileURLToPath(new URL("style.prompt.md", import.meta.url));
const prompt = (await workspace.readText(promptPath)).content;

script({
  title: "Style",
});

const processFile = async (file) => {
  const codeStyle = await workspace.readText("CODE_STYLE.md");
  
  const result = await runPrompt(
    (_) => {
      _.def("CODE_STYLE", codeStyle, {
        maxTokens,
      });
      _.def("FILE_CONTENT", file.content, {
        maxTokens,
      });
      _.def("MAX_TOKENS", String(maxTokens), {
        maxTokens,
      });
      _.$`${prompt}`;
    },
    {
      model: "github_copilot_chat:gpt-4.1",
      label: "Style Code",
      system: ["system.assistant"],
      systemSafety: true,
      responseType: "text",
    },
  );

  await workspace.writeText("CODE_STYLE.md", result.text);
};

export const style = async () => {
  const files = await getFiles({});

  if (files.length === 0) {
    console.log("No files found to style.");
    return;
  }

  for (const file of files) {
    await processFile(file);
  }
};

export default style;
