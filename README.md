# GenAIScript

> Scripting for Generative AI

## Prompting is Coding

Programmatically assemble prompts for LLMs using JavaScript. Orchestrate LLMs, tools, and data in a single script.

* JavaScript toolbox to work with prompts
* Abstraction to make it easy and productive
* Seamless Visual Studio Code integration or flexible command line
* Built-in support for GitHub Copilot and GitHub Models, OpenAI, Azure OpenAI, Anthropic, and more

## Hello world

Say you want to create an LLM script that generates a 'hello world' poem. You can write the following script:

```js
$`Write a 'hello world' poem.`
```

The `$` function is a template tag that creates a prompt. The prompt is then sent to the LLM (you configured), which generates the poem.

Let's make it more interesting by adding files, data, and structured output. Say you want to include a file in the prompt, and then save the output in a file. You can write the following script:

```js
// read files
const file = await workspace.readText("data.txt")
// include the file content in the prompt in a context-friendly way
def("DATA", file)
// the task
$`Analyze DATA and extract data in JSON in data.json.`
```

The `def` function includes the content of the file, and optimizes it if necessary for the target LLM. GenAIScript also parses the LLM output and will extract the `data.json` file automatically.

## Features

GenAIScript brings essential LLM prompt tooling into a cohesive scripting environment:

- **Stylized JavaScript** - Minimal syntax to build prompts using JavaScript or TypeScript
- **Fast Development Loop** - Edit, Debug, Run, Test your scripts in Visual Studio Code or with command line
- **LLM Tools** - Register JavaScript functions as LLM tools (with fallback for models that don't support tools)
- **MCP Client & Server** - Use tools exposed in Model Context Provider Servers; every script is a Model Context Provider Tool
- **LLM Agents** - Combine tools and inline prompts into an agent
- **Reuse and Share Scripts** - Scripts are files that can be versioned, shared, and forked
- **Data Schemas** - Define, validate, repair data using schemas
- **Ingest text and tables** - From PDFs, DOCX, CSV, XLSX, and more
- **Speech To Text** - Automatically transcribe audio or videos
- **Images and Videos** - Include images in prompts, extract frames from videos
- **Generate Files** - Extract files and diff from the LLM output with Refactoring UI
- **File search** - Grep or fuzz search files
- **Web search** - Using Bing or Tavily
- **Browser automation** - Browse and scrape the web with Playwright
- **RAG built-in** - Vector search using local database or Azure AI Search
- **Safety First!** - Built-in Responsible AI system prompts and Azure Content Safety
- **LLM Support** - GitHub Models, GitHub Copilot, Azure OpenAI, Google, Anthropic, Amazon, Alibaba, and more
- **Local Models** - Run with Open Source models like Phi-3 using Ollama, LocalAI

## Installation

### Visual Studio Code Extension

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install [GenAIScript Extension](https://marketplace.visualstudio.com/items?itemName=genaiscript.genaiscript-vscode)

### Command Line

The GenAIScript command line tool lets you run your scripts from any terminal.

```sh
npx genaiscript run my-script some/path/*.pdf
```

## Configuration

Before you start writing GenAIScripts, you need to configure your environment to have access to an LLM. You can use:

- GitHub Copilot Chat
- GitHub Models
- Azure OpenAI
- OpenAI
- Anthropic
- Google AI
- Local models via Ollama
- And many more

See the [configuration documentation](https://microsoft.github.io/genaiscript/getting-started/configuration) for details.

## Getting Started

Create a new script:

```js
// genaisrc/hello.genai.mjs
$`Write a 'hello world' poem.`
```

Run the script:

```sh
npx genaiscript run hello
```

## Documentation

For complete documentation, visit [https://microsoft.github.io/genaiscript/](https://microsoft.github.io/genaiscript/)

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit [https://cla.opensource.microsoft.com](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

This project is licensed under the [MIT License](LICENSE).