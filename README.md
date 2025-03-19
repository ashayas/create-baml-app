# Create BAML App 🐑

<p align="center">
<img src="https://github.com/ashayas/create-baml-app/raw/master/.github/assets/lamb.png" width="250" alt="Create BAML App"/>
</p>

<p align="center">
<a href="https://github.com/ashayas/create-baml-app"><img src="https://img.shields.io/badge/GitHub-ashayas%2Fcreate--baml--app-blue?logo=github" alt="GitHub"></a>
<a href="https://www.npmjs.com/package/create-baml-app"><img src="https://img.shields.io/npm/v/create-baml-app.svg" alt="npm version"></a>
<a href="https://www.npmjs.com/package/create-baml-app"><img src="https://img.shields.io/npm/dm/create-baml-app.svg" alt="npm downloads"></a>
<img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
</p>

A CLI tool to set up a BAML project with your preferred language and package manager. BAML is the AI framework from [Boundary ML](https://www.boundaryml.com) that adds engineering to prompt engineering.

## What is BAML? 🤔

BAML (Basically A Made-up Language) is a programming language for building AI applications. It provides:

- Type-safe structured outputs from LLMs
- Robust JSON parsing (fixes broken JSON, trailing commas, etc.)
- Function-calling for every model
- Support for multiple programming languages
- Better prompt management

BAML lets you define schema classes and functions that can be called from your preferred language (Python, TypeScript, Ruby, and more).

## Installation & Usage 🚀

You can create a new BAML project using npx without installing anything:

```bash
npx create-baml-app
```

This interactive CLI will:
1. Help you select a programming language (Python, TypeScript, Ruby)
2. Choose your preferred package manager
3. Set up a complete BAML project structure

## Supported Languages and Package Managers 🛠️

### Python
- **pip**: Standard Python package manager
  - Requires: Python installed on your system
- **poetry**: Modern Python dependency management
  - Requires: [Poetry](https://python-poetry.org/docs/#installation) installed
- **uv**: Fast Python package installer
  - Requires: [uv](https://github.com/astral-sh/uv) installed

### TypeScript
- **npm**: Standard Node.js package manager
  - Requires: [Node.js](https://nodejs.org/) installed
- **pnpm**: Fast, disk space efficient package manager
  - Requires: [pnpm](https://pnpm.io/installation) installed
- **yarn**: Alternative Node.js package manager
  - Requires: [Yarn](https://yarnpkg.com/getting-started/install) installed
- **deno**: Secure runtime for JavaScript and TypeScript
  - Requires: [Deno](https://deno.land/manual/getting_started/installation) installed
  - Note: For Deno in VSCode, add `{ "deno.unstable": ["sloppy-imports"] }` to your settings

### Ruby
- **bundle**: Ruby's package manager
  - Requires: [Ruby](https://www.ruby-lang.org/en/documentation/installation/) and [Bundler](https://bundler.io/) installed

## Project Structure 📁

After running `create-baml-app`, you'll have a basic BAML project with:

- The BAML CLI installed
- Basic project structure with configuration files
- Initial BAML source files

## Development Workflow 🧑‍💻

1. Write BAML function definitions in `.baml` files
2. Generate client code with `baml-cli generate`
3. Import and use the generated code in your application

## Resources 📚

- [BAML Documentation](https://docs.boundaryml.com/)
- [BAML GitHub Repository](https://github.com/BoundaryML/baml)
- [Boundary ML Website](https://www.boundaryml.com/)

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
