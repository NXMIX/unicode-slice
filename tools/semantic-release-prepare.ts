const path = require("path");
const { fork } = require("child_process");
const chalk = require("chalk");

const { readFileSync, writeFileSync } = require("fs");
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "..", "package.json")));

pkg.scripts.prepush = "npm run test:prod && npm run build";
pkg.scripts.commitmsg = "validate-commit-msg";

writeFileSync(path.resolve(__dirname, "..", "package.json"), JSON.stringify(pkg, undefined, 2));

// Call husky to set up the hooks
fork(path.resolve(__dirname, "..", "node_modules", "husky", "bin", "install"));

console.log();
console.log(chalk.green("Done!!"));
console.log();

if (pkg.repository.url.trim()) {
  console.log(chalk.cyan("Now run:"));
  console.log(chalk.cyan("  npm install -g semantic-release-cli"));
  console.log(chalk.cyan("  semantic-release-cli setup"));
  console.log();
  console.log(chalk.cyan('Important! Answer NO to "Generate travis.yml" question'));
  console.log();
  console.log(
    chalk.gray('Note: Make sure "repository.url" in your package.json is correct before')
  );
} else {
  console.log(chalk.red('First you need to set the "repository.url" property in package.json'));
  console.log(chalk.cyan("Then run:"));
  console.log(chalk.cyan("  npm install -g semantic-release-cli"));
  console.log(chalk.cyan("  semantic-release-cli setup"));
  console.log();
  console.log(chalk.cyan('Important! Answer NO to "Generate travis.yml" question'));
}

console.log();
