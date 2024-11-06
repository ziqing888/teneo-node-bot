const chalk = require('chalk');

const logger = {
  info: (message) => console.log(chalk.cyan(message)),
  success: (message) => console.log(chalk.green(message)),
  warning: (message) => console.log(chalk.yellow(message)),
  error: (message) => console.log(chalk.red(message))
};

module.exports = logger;
