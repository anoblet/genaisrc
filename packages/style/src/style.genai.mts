import { getFiles } from "../../utility/src/utility.ts";
import { fileURLToPath } from "url";

const promptPath = fileURLToPath(new URL("style.prompt.md", import.meta.url));
const prompt = (await workspace.readText(promptPath)).content;

script({
  title: "Style",
});

export const style = async () => {
  const files = await getFiles({});

  if (files.length === 0) {
    console.log("No files found to style.");
    return;
  }

  const file = files[0];

  const codeStyle = await workspace.readText("CODE_STYLE.md");

  const result = await runPrompt(
    (_) => {
      _.def("CODE_STYLE", codeStyle, {
        maxTokens: 10000,
      });

      _.def("FILE_CONTENT", file.content, {
        maxTokens: 10000,
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

export default style;
