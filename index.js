#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { execa } from 'execa';
import { existsSync } from 'fs';
import { join } from 'path';

async function runCommand(command, args, description) {
  console.log(chalk.cyan(`\nRunning: ${description}...`));
  try {
    const { stdout } = await execa(command, args, { stdio: 'inherit' });
    console.log(chalk.green('✓ Success!'));
    return stdout;
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function main() {
  console.log(chalk.bold.magenta('\nWelcome to create-baml-app! 🦙'));
  console.log(chalk.yellow("Let's set up your BAML project...\n"));

  // Step 1: Select Language
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: chalk.blue('Which language would you like to use?'),
      choices: ['Python', 'TypeScript', 'Ruby'],
    },
  ]);

  // Step 2: Select Package Manager based on Language
  let packageManagerChoices;
  switch (language) {
    case 'Python':
      packageManagerChoices = ['pip', 'poetry', 'uv'];
      break;
    case 'TypeScript':
      packageManagerChoices = ['npm', 'pnpm', 'yarn', 'deno'];
      break;
    case 'Ruby':
      packageManagerChoices = ['bundle'];
      break;
  }

  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: chalk.blue(`Which package manager would you like to use for ${language}?`),
      choices: packageManagerChoices,
    },
  ]);

  // Step 3: Execute Commands
  console.log(chalk.magenta(`\nSetting up your ${language} BAML project with ${packageManager}...\n`));

  if (language === 'Python') {
    if (packageManager === 'pip') {
      // Initialize requirements.txt if it doesn't exist
      if (!existsSync('requirements.txt')) {
        console.log(chalk.yellow('\nInitializing new Python project with pip...'));
        await runCommand('touch', ['requirements.txt'], 'Creating requirements.txt');
      }
      try {
        await runCommand('pip', ['install', 'baml-py'], 'Installing baml-py');
      } catch (error) {
        console.log(chalk.red('\nError: pip is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install pip first:'));
        console.log(chalk.gray('https://pip.pypa.io/en/stable/installation/\n'));
        process.exit(1);
      }
      await runCommand('baml-cli', ['init'], 'Initializing BAML');
      await runCommand('baml-cli', ['generate'], 'Generating BAML files');
    } else if (packageManager === 'poetry') {
      // Initialize poetry project if pyproject.toml doesn't exist
      if (!existsSync('pyproject.toml')) {
        console.log(chalk.yellow('\nInitializing new Python project with Poetry...'));
        try {
          await runCommand('poetry', ['init', '--name=baml-project', '--description=A BAML project', '--author=', '--python=^3.8', '--no-interaction'], 'Creating Poetry project');
        } catch (error) {
          console.log(chalk.red('\nError: Poetry is not installed or not available in PATH'));
          console.log(chalk.yellow('Please install Poetry first:'));
          console.log(chalk.gray('https://python-poetry.org/docs/#installation\n'));
          process.exit(1);
        }
      }
      await runCommand('poetry', ['add', 'baml-py'], 'Adding baml-py');
      await runCommand('poetry', ['run', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('poetry', ['run', 'baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'uv') {
      // Initialize pyproject.toml properly with uv init if it doesn't exist
      if (!existsSync('pyproject.toml')) {
        console.log(chalk.yellow('\nInitializing new Python project with uv...'));
        try {
          await runCommand('uv', ['init'], 'Initializing uv project');
        } catch (error) {
          console.log(chalk.red('\nError: uv is not installed or not available in PATH'));
          console.log(chalk.yellow('Please install uv first:'));
          console.log(chalk.gray('https://github.com/astral-sh/uv#installation\n'));
          process.exit(1);
        }
      }
      await runCommand('uv', ['add', 'baml-py'], 'Adding baml-py');
      await runCommand('uv', ['run', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('uv', ['run', 'baml-cli', 'generate'], 'Generating BAML files');
    }
  } else if (language === 'TypeScript') {
    // Create tsconfig.json if it doesn't exist
    if (!existsSync('tsconfig.json')) {
      try {
        await runCommand('npx', ['tsc', '--init'], 'Creating tsconfig.json');
      } catch (error) {
        console.log(chalk.red('\nError: Node.js/npm is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install Node.js first:'));
        console.log(chalk.gray('https://nodejs.org/\n'));
        process.exit(1);
      }
    }

    if (packageManager === 'npm') {
      try {
        await runCommand('npm', ['--version'], 'Checking npm installation');
      } catch (error) {
        console.log(chalk.red('\nError: npm is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install npm first:'));
        console.log(chalk.gray('https://docs.npmjs.com/downloading-and-installing-node-js-and-npm\n'));
        process.exit(1);
      }
      await runCommand('npm', ['install', '@boundaryml/baml'], 'Installing @boundaryml/baml');
      await runCommand('npx', ['baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'pnpm') {
      try {
        await runCommand('pnpm', ['--version'], 'Checking pnpm installation');
      } catch (error) {
        console.log(chalk.red('\nError: pnpm is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install pnpm first:'));
        console.log(chalk.gray('https://pnpm.io/installation\n'));
        process.exit(1);
      }
      await runCommand('pnpm', ['add', '@boundaryml/baml'], 'Adding @boundaryml/baml');
      await runCommand('pnpm', ['exec', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'yarn') {
      try {
        await runCommand('yarn', ['--version'], 'Checking yarn installation');
      } catch (error) {
        console.log(chalk.red('\nError: yarn is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install yarn first:'));
        console.log(chalk.gray('https://classic.yarnpkg.com/en/docs/install\n'));
        process.exit(1);
      }
      await runCommand('yarn', ['add', '@boundaryml/baml'], 'Adding @boundaryml/baml');
      await runCommand('yarn', ['baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'deno') {
      try {
        await runCommand('deno', ['--version'], 'Checking deno installation');
      } catch (error) {
        console.log(chalk.red('\nError: deno is not installed or not available in PATH'));
        console.log(chalk.yellow('Please install deno first:'));
        console.log(chalk.gray('https://deno.land/#installation\n'));
        process.exit(1);
      }
      // For Deno, create deno.json if it doesn't exist
      if (!existsSync('deno.json')) {
        console.log(chalk.yellow('\nInitializing new Deno project...'));
        await runCommand('deno', ['init'], 'Creating deno.json');
      }
      await runCommand('deno', ['install', 'npm:@boundaryml/baml'], 'Installing @boundaryml/baml');
      await runCommand('deno', ['run', '-A', 'npm:@boundaryml/baml/baml-cli', 'init'], 'Initializing BAML');
      await runCommand('deno', ['run', '--unstable-sloppy-imports', '-A', 'npm:@boundaryml/baml/baml-cli', 'generate'], 'Generating BAML files');
      console.log(chalk.yellow('\nNote: As per BAML docs, for Deno in VSCode, add this to your config:'));
      console.log(chalk.gray('{\n  "deno.unstable": ["sloppy-imports"]\n}'));
    }
  } else if (language === 'Ruby') {
    try {
      await runCommand('bundle', ['--version'], 'Checking bundler installation');
    } catch (error) {
      console.log(chalk.red('\nError: bundler is not installed or not available in PATH'));
      console.log(chalk.yellow('Please install bundler first:'));
      console.log(chalk.gray('https://bundler.io/#getting-started\n'));
      process.exit(1);
    }
    // Initialize Gemfile if it doesn't exist
    if (!existsSync('Gemfile')) {
      console.log(chalk.yellow('\nInitializing new Ruby project...'));
      await runCommand('bundle', ['init'], 'Creating Gemfile');
    }
    await runCommand('bundle', ['add', 'baml', 'sorbet-runtime'], 'Adding baml and sorbet-runtime');
    await runCommand('bundle', ['exec', 'baml-cli', 'init'], 'Initializing BAML');
    await runCommand('bundle', ['exec', 'baml-cli', 'generate'], 'Generating BAML files');
  }

  console.log(chalk.bold.green('\n🚀 All done! Your BAML project is ready.'));
  console.log(chalk.cyan('Next steps: Check your project directory and start coding!'));
}

main().catch((error) => {
  console.error(chalk.red('An unexpected error occurred:', error.message));
  process.exit(1);
});
