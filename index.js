// index.js 文件，项目的主要入口

// 导入日志管理模块
const { displayHeader, log_info } = require('./src/logger');
const accounts = require('./config/account');
const startBot = require('./src/bot');

// 显示项目标题（欢迎信息）
displayHeader(); 

// 启动机器人，使用配置文件中的所有账户
accounts.forEach(account => {
  log_info(`正在启动账户 ${account.email}...`);
  startBot(account);
});
