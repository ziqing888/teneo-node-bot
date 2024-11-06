const axios = require('axios');
const chalk = require('chalk');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const readline = require('readline');
const 账户 = require('./account.js');
const 代理列表 = require('./proxy.js');
const { 使用代理 } = require('./config.js');

// 授权和 API 密钥
const authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";

// 日志配置
const log = {
  info: (msg) => console.log(chalk.blue(`[信息] ${new Date().toISOString()}: ${msg}`)),
  success: (msg) => console.log(chalk.green(`[成功] ${new Date().toISOString()}: ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`[警告] ${new Date().toISOString()}: ${msg}`)),
  error: (msg) => console.error(chalk.red(`[错误] ${new Date().toISOString()}: ${msg}`))
};

// 显示标题
function displayHeader() {
    process.stdout.write('\x1Bc');
    console.log(`${YELLOW}╔════════════════════════════════════════╗`);
    console.log(`${YELLOW}║      🚀  teneo节点挂机 🚀             ║`);
    console.log(`${YELLOW}║  👤    脚本编写：@qklxsqf              ║`);
    console.log(`${YELLOW}║  📢  电报频道：https://t.me/ksqxszq    ║`);
    console.log(`${YELLOW}╚════════════════════════════════════════╝`);
    console.log(); // 空行
}

// 全局变量
let 套接字 = [];
let 心跳间隔 = [];
let 倒计时间隔 = [];
let 潜在积分 = [];
let 倒计时 = [];
let 积分总数 = [];
let 今天积分 = [];
let 上次更新时间 = [];
let 消息 = [];
let 用户ID = [];

// 重试机制
async function retryOperation(operation, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      log.warning(`重试 ${attempt}/${retries} 次失败: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// 批量初始化账户
async function initializeAccounts() {
  const accountPromises = 账户.map((_, i) => initializeAccount(i));
  await Promise.all(accountPromises);
  log.success("所有账户已成功初始化");
}

// 初始化单个账户
async function initializeAccount(index) {
  try {
    log.info(`正在初始化账户 ${index + 1}`);
    const userId = await retryOperation(() => getUserId(index), 3, 2000);
    await connectWebSocket(index, userId);
  } catch (error) {
    log.error(`账户 ${index + 1} 初始化失败: ${error.message}`);
  }
}

// 获取用户 ID
async function getUserId(index) {
  const loginUrl = "https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/token?grant_type=password";
  const proxy = 代理列表[index % 代理列表.length];
  const agent = 使用代理 ? new HttpsProxyAgent(`http://${proxy.用户名}:${proxy.密码}@${proxy.主机}:${proxy.端口}`) : null;

  const response = await axios.post(loginUrl, {
    email: 账户[index].邮箱,
    password: 账户[index].密码
  }, {
    headers: {
      'Authorization': authorization,
      'apikey': apikey
    },
    httpsAgent: agent
  });
  log.success(`账户 ${index + 1} 成功获取用户 ID`);
  用户ID[index] = response.data.user.id;
  return response.data.user.id;
}

// WebSocket 连接
async function connectWebSocket(index, userId) {
  const url = `wss://secure.ws.teneo.pro/websocket?userId=${encodeURIComponent(userId)}&version=v0.2`;
  const proxy = 代理列表[index % 代理列表.length];
  const agent = 使用代理 ? new HttpsProxyAgent(`http://${proxy.用户名}:${proxy.密码}@${proxy.主机}:${proxy.端口}`) : null;

  套接字[index] = new WebSocket(url, { agent });

  套接字[index].onopen = () => {
    log.success(`账户 ${index + 1} 已连接`);
    startHeartbeat(index);
    startCountdownAndPoints(index);
  };

  套接字[index].onclose = () => {
    log.warning(`账户 ${index + 1} 连接已断开`);
    retryOperation(() => connectWebSocket(index, userId), 5, 5000);
  };

  套接字[index].onerror = (error) => {
    log.error(`账户 ${index + 1} WebSocket 错误: ${error.message}`);
  };

  套接字[index].onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.pointsTotal !== undefined && data.pointsToday !== undefined) {
      上次更新时间[index] = new Date().toISOString();
      积分总数[index] = data.pointsTotal;
      今天积分[index] = data.pointsToday;
      消息[index] = data.message;
      logAllAccounts();
    }

    // 检查服务器心跳消息
    if (data.message === "Pulse from server") {
      log.info(`账户 ${index + 1} 接收到服务器心跳`);
      setTimeout(() => startHeartbeat(index), 10000);
    }
  };
}

// 显示账户详细数据
function displayAccountData(index) {
  console.log(chalk.cyan(`======= 账户 ${index + 1} =======`));
  console.log(chalk.whiteBright(`邮箱: ${账户[index].邮箱}`));
  console.log(`用户 ID: ${用户ID[index]}`);
  console.log(chalk.green(`积分总数: ${积分总数[index]}`));
  console.log(chalk.green(`今天积分: ${今天积分[index]}`));
  console.log(chalk.whiteBright(`消息: ${消息[index]}`));
  if (使用代理) {
    const 代理 = 代理列表[index % 代理列表.length];
    console.log(chalk.hex('#FFA500')(`代理: ${代理.主机}:${代理.端口} (用户: ${代理.用户名})`));
  }
  console.log(chalk.cyan("_____________________________________________"));
}

// 日志输出所有账户
function logAllAccounts() {
  console.clear();
  displayHeader();
  账户.forEach((_, i) => displayAccountData(i));
}

// 心跳功能
function startHeartbeat(index) {
  心跳间隔[index] = setInterval(() => {
    if (套接字[index] && 套接字[index].readyState === WebSocket.OPEN) {
      套接字[index].send(JSON.stringify({ type: "PING" }));
      log.info(`账户 ${index + 1} 发送心跳`);
    }
  }, 10000);
}

// 倒计时和积分更新
function startCountdownAndPoints(index) {
  clearInterval(倒计时间隔[index]);
  updateCountdownAndPoints(index);
  倒计时间隔[index] = setInterval(() => updateCountdownAndPoints(index), 1000);
}

// 更新倒计时和积分
async function updateCountdownAndPoints(index) {
  const restartThreshold = 60000;
  const now = new Date();
  const nextHeartbeat = new Date(上次更新时间[index]);
  nextHeartbeat.setMinutes(nextHeartbeat.getMinutes() + 15);
  const diff = nextHeartbeat.getTime() - now.getTime();

  if (diff > 0) {
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    倒计时[index] = `${minutes}m ${seconds}s`;

    const maxPoints = 25;
    const timeElapsedMinutes = (now - new Date(上次更新时间[index])) / (60 * 1000);
    潜在积分[index] = Math.min(maxPoints, (timeElapsedMinutes / 15) * maxPoints);
  } else {
    倒计时[index] = "Calculating...";
    潜在积分[index] = 25;
  }

  logAllAccounts();
}

// 启动程序
displayHeader();
initializeAccounts().catch(error => log.error(`初始化失败: ${error.message}`));

process.on('SIGINT', () => {
  log.info('正在停止...');
  账户.forEach((_, i) => {
    clearInterval(心跳间隔[i]);
    clearInterval(倒计时间隔[i]);
    if (套接字[i]) 套接字[i].close();
  });
  process.exit(0);
});
