#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { execa } from 'execa';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import fs from 'fs';

function showHelp() {
  console.log(chalk.bold.magenta('\nCreate BAML App 🦙'));
  console.log('\nUsage:');
  console.log('  npx create-baml-app [project-name] [options]');
  console.log('\nOptions:');
  console.log('  -h, --help              Show this help message');
  console.log('  --use-current-dir, -.   Use current directory instead of creating a new one');
  console.log('\nExamples:');
  console.log('  npx create-baml-app my-baml-app');
  console.log('  npx create-baml-app my-baml-app --use-current-dir');
  console.log('  npx create-baml-app my-baml-app -.');
  process.exit(0);
}

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
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
  }

  // Get project name from arguments or prompt
  let projectName = args[0];
  if (!projectName) {
    const response = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project named? (Use "." to create in current directory)',
        default: 'my-app',
        validate: (input) => {
          if (input === '.') return true;
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name can only contain letters, numbers, dashes and underscores';
          }
          return true;
        }
      }
    ]);
    projectName = response.projectName;
  }

  // Determine target directory
  const useCurrentDir = projectName === '.' || args.includes('--use-current-dir') || args.includes('-.');
  const targetDir = useCurrentDir ? process.cwd() : resolve(projectName);
  
  // Check if directory is empty if using current directory
  if (useCurrentDir && existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(chalk.red('\nError: Current directory is not empty. Please use a new directory or empty the current one.'));
    process.exit(1);
  }

  // Create directory if not using current directory
  if (!useCurrentDir) {
    if (existsSync(targetDir)) {
      console.error(chalk.red(`\nError: Directory ${projectName} already exists. Please choose a different name or use --use-current-dir to use an existing directory.`));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`\nCreating a new BAML app in ${chalk.green(targetDir)}`));
    try {
      mkdirSync(targetDir, { recursive: true });
    } catch (error) {
      console.error(chalk.red(`Error creating directory: ${error.message}`));
      process.exit(1);
    }
  }

  // Change to target directory
  try {
    process.chdir(targetDir);
  } catch (error) {
    console.error(chalk.red(`Error changing to directory: ${error.message}`));
    process.exit(1);
  }

  console.log(chalk.yellow("\nLet's set up your BAML project...\n"));

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
    // Install TypeScript first based on package manager (except for Deno)
    if (packageManager !== 'deno') {
      try {
        switch (packageManager) {
          case 'npm':
            await runCommand('npm', ['install', 'typescript', '--save-dev'], 'Installing TypeScript');
            break;
          case 'pnpm':
            await runCommand('pnpm', ['add', 'typescript', '-D'], 'Installing TypeScript');
            break;
          case 'yarn':
            await runCommand('yarn', ['add', 'typescript', '--dev'], 'Installing TypeScript');
            break;
        }
      } catch (error) {
        console.log(chalk.red(`\nError: Failed to install TypeScript with ${packageManager}`));
        console.log(chalk.yellow(`Please install ${packageManager} first:`));
        switch (packageManager) {
          case 'npm':
            console.log(chalk.gray('https://docs.npmjs.com/downloading-and-installing-node-js-and-npm\n'));
            break;
          case 'pnpm':
            console.log(chalk.gray('https://pnpm.io/installation\n'));
            break;
          case 'yarn':
            console.log(chalk.gray('https://classic.yarnpkg.com/en/docs/install\n'));
            break;
        }
        process.exit(1);
      }
    }

    // Create tsconfig.json if it doesn't exist
    if (!existsSync('tsconfig.json')) {
      try {
        switch (packageManager) {
          case 'npm':
            await runCommand('npx', ['tsc', '--init'], 'Creating tsconfig.json');
            break;
          case 'pnpm':
            await runCommand('pnpm', ['exec', 'tsc', '--init'], 'Creating tsconfig.json');
            break;
          case 'yarn':
            await runCommand('yarn', ['tsc', '--init'], 'Creating tsconfig.json');
            break;
          case 'deno':
            // For Deno, we'll create a basic tsconfig.json directly
            console.log(chalk.cyan('\nCreating tsconfig.json for Deno...'));
            const denoConfig = {
              "compilerOptions": {
                "target": "ES2022",
                "lib": ["ES2022", "DOM"],
                "module": "ES2022",
                "moduleResolution": "node",
                "esModuleInterop": true,
                "strict": true,
                "skipLibCheck": true
              }
            };
            fs.writeFileSync('tsconfig.json', JSON.stringify(denoConfig, null, 2));
            console.log(chalk.green('✓ Success!'));
            break;
        }
      } catch (error) {
        console.error(chalk.red(`Error creating tsconfig.json: ${error.message}`));
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
