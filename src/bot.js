// bot.js 文件

const axios = require('axios');
const chalk = require('chalk');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const accounts = require('../config/account');
const proxies = require('../config/proxy');
const { useProxy } = require('../config/config');  // 引入 config.js 中的 useProxy 设置
const { log_info, log_success, log_warning, log_error, displayHeader } = require('./logger');

// 硬编码的配置数据
const authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag"; // 授权令牌，硬编码在这里
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag"; // API 密钥，硬编码在这里

let sockets = [];
let userIds = [];

// 定义 startCountdownAndPoints 函数
function startCountdownAndPoints(index) {
  // 清除已有的倒计时
  clearInterval(countdownIntervals[index]);
  updateCountdownAndPoints(index);
  countdownIntervals[index] = setInterval(() => updateCountdownAndPoints(index), 1000);
}

async function updateCountdownAndPoints(index) {
  // 省略了原函数的内容（与之前相同）
}

async function getUserId(index) {
  const loginUrl = "https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/token?grant_type=password";

  const proxy = proxies[index % proxies.length];
  const agent = useProxy ? new HttpsProxyAgent(`http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`) : null; // 根据 useProxy 决定是否设置代理

  try {
    const response = await axios.post(loginUrl, {
      email: accounts[index].email,
      password: accounts[index].password
    }, {
      headers: {
        'Authorization': authorization,
        'apikey': apikey
      },
      httpsAgent: agent // 使用代理
    });

    userIds[index] = response.data.user.id;
    log_success(`账户 ${index + 1} 用户 ID 获取成功`);
    startCountdownAndPoints(index);
    await connectWebSocket(index);
  } catch (error) {
    if (error.response) {
      // 请求发出后收到了服务器的错误响应
      log_error(`账户 ${index + 1} 获取用户 ID 失败: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 请求发出后没有收到响应
      log_error(`账户 ${index + 1} 获取用户 ID 失败: 没有收到服务器的响应，请检查网络或代理设置。`);
    } else {
      // 请求配置错误或其他原因
      log_error(`账户 ${index + 1} 获取用户 ID 失败: ${error.message}`);
    }
  }
}

async function connectWebSocket(index) {
  if (sockets[index]) return;
  const version = "v0.2";
  const url = "wss://secure.ws.teneo.pro";
  const wsUrl = `${url}/websocket?userId=${encodeURIComponent(userIds[index])}&version=${encodeURIComponent(version)}`;

  const proxy = proxies[index % proxies.length];
  const agent = useProxy ? new HttpsProxyAgent(`http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`) : null;

  sockets[index] = new WebSocket(wsUrl, { agent });

  sockets[index].onopen = () => {
    log_success(`账户 ${index + 1} WebSocket 连接成功`);
  };

  sockets[index].onmessage = (event) => {
    const data = JSON.parse(event.data);
    log_info(`账户 ${index + 1} 收到消息: ${JSON.stringify(data)}`);
  };

  sockets[index].onclose = () => {
    log_warning(`账户 ${index + 1} WebSocket 连接断开，正在尝试重新连接`);
    sockets[index] = null;
    restartAccountProcess(index);
  };

  sockets[index].onerror = (error) => {
    log_error(`账户 ${index + 1} WebSocket 连接错误: ${error.message}`);
  };
}

function restartAccountProcess(index) {
  setTimeout(() => {
    getUserId(index);
  }, 5000);
}

// 启动所有账户
displayHeader();
accounts.forEach((_, index) => {
  getUserId(index);
});

// 确保在模块导出中包含 startCountdownAndPoints
module.exports = {
  getUserId,
  connectWebSocket,
  startCountdownAndPoints
};
