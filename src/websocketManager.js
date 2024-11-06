const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const logger = require('./logger');
const proxies = require('../config/proxyConfig.json');

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
      logger.info(`Ping sent to Account ${index + 1}`);
    }
  }, 10000);
}

// 断开 WebSocket
function disconnectWebSocket(index) {
  if (sockets[index]) {
    sockets[index].close();
    sockets[index] = null;
    clearInterval(pingIntervals[index]);
    logger.info(`Account ${index + 1} Disconnected`);
  }
}

// 连接 WebSocket
function connectWebSocket(index, userId) {
  try {
    sockets[index] = createWebSocket(index, userId);
    sockets[index].on('open', () => {
      logger.success(`Account ${index + 1} Connected`);
      startPinging(index);
    });

    sockets[index].on('close', () => {
      logger.warning(`Account ${index + 1} Disconnected, Reconnecting...`);
      connectWebSocket(index, userId);
    });

    sockets[index].on('error', (error) => {
      logger.error(`WebSocket Error for Account ${index + 1}: ${error.message}`);
    });
  } catch (error) {
    logger.error(`Failed to connect Account ${index + 1}: ${error.message}`);
  }
}

module.exports = {
  connectWebSocket,
  disconnectWebSocket
};
