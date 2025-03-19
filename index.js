#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { execa } from 'execa';

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
      await runCommand('pip', ['install', 'baml-py'], 'Installing baml-py');
      await runCommand('baml-cli', ['init'], 'Initializing BAML');
      await runCommand('baml-cli', ['generate'], 'Generating BAML files');
    } else if (packageManager === 'poetry') {
      await runCommand('poetry', ['add', 'baml-py'], 'Adding baml-py');
      await runCommand('poetry', ['run', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('poetry', ['run', 'baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'uv') {
      await runCommand('uv', ['add', 'baml-py'], 'Adding baml-py');
      await runCommand('uv', ['run', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('uv', ['run', 'baml-cli', 'generate'], 'Generating BAML files');
    }
  } else if (language === 'TypeScript') {
    if (packageManager === 'npm') {
      await runCommand('npm', ['install', '@boundaryml/baml'], 'Installing @boundaryml/baml');
      await runCommand('npx', ['baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'pnpm') {
      await runCommand('pnpm', ['add', '@boundaryml/baml'], 'Adding @boundaryml/baml');
      await runCommand('pnpm', ['exec', 'baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'yarn') {
      await runCommand('yarn', ['add', '@boundaryml/baml'], 'Adding @boundaryml/baml');
      await runCommand('yarn', ['baml-cli', 'init'], 'Initializing BAML');
      await runCommand('npx', ['baml-cli', 'generate'], 'Generating BAML files');
    } else if (packageManager === 'deno') {
      await runCommand('deno', ['install', 'npm:@boundaryml/baml'], 'Installing @boundaryml/baml');
      await runCommand('deno', ['run', '-A', 'npm:@boundaryml/baml/baml-cli', 'init'], 'Initializing BAML');
      await runCommand('deno', ['run', '--unstable-sloppy-imports', '-A', 'npm:@boundaryml/baml/baml-cli', 'generate'], 'Generating BAML files');
      console.log(chalk.yellow('\nNote: For Deno in VSCode, add this to your config:'));
      console.log(chalk.gray('{\n  "deno.unstable": ["sloppy-imports"]\n}'));
    }
  } else if (language === 'Ruby') {
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
