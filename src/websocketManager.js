// WebSocket 管理模块 websocketManager.js
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const logger = require('./logger');
const proxies = require('../config/proxy.js');

let sockets = [];
let pingIntervals = [];

// 创建 WebSocket 连接
function createWebSocket(index, userId, version = "v0.2") {
  const url = "wss://secure.ws.teneo.pro";
  const wsUrl = `${url}/websocket?userId=${encodeURIComponent(userId)}&version=${encodeURIComponent(version)}`;

  const proxy = proxies[index % proxies.length];
  const agent = proxy ? new HttpsProxyAgent(`http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`) : null;

  return new WebSocket(wsUrl, { agent });
}

// 启动 WebSocket 心跳
function startPinging(index) {
  if (!sockets[index]) return;

  pingIntervals[index] = setInterval(() => {
    if (sockets[index].readyState === WebSocket.OPEN) {
      sockets[index].send(JSON.stringify({ type: "PING" }));
      logger.info(`Ping 发送到账户 ${index + 1}`);
    }
  }, 10000);
}

// 断开 WebSocket
function disconnectWebSocket(index) {
  if (sockets[index]) {
    sockets[index].close();
    sockets[index] = null;
    clearInterval(pingIntervals[index]);
    logger.info(`账户 ${index + 1} 已断开连接`);
  }
}

// 连接 WebSocket
function connectWebSocket(index, userId) {
  try {
    sockets[index] = createWebSocket(index, userId);
    sockets[index].on('open', () => {
      logger.success(`账户 ${index + 1} 已连接`);
      startPinging(index);
    });

    sockets[index].on('close', () => {
      logger.warning(`账户 ${index + 1} 已断开连接，正在重新连接...`);
      connectWebSocket(index, userId);
    });

    sockets[index].on('error', (error) => {
      logger.error(`账户 ${index + 1} 的 WebSocket 错误: ${error.message}`);
    });
  } catch (error) {
    logger.error(`账户 ${index + 1} 连接失败: ${error.message}`);
  }
}

module.exports = {
  connectWebSocket,
  disconnectWebSocket
};
