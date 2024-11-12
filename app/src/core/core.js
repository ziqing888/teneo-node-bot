import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { Helper } from '../utils/helper.js';
import { API } from './api/api.js';
import logger from '../utils/logger.js';
import WebSocket from 'ws';

export default class Core extends API {
  constructor(account, proxy) {
    super('https://ikknngrgxuxgjhplbpey.supabase.co', proxy);
    this.acc = account;
    this.socket = null;
    this.wssReconnectAttempts = 0;
    this.maxwssReconnectAttempts = 5;
    this.pingInterval = 0;
    this.point = {
      'pointsToday': 0,
      'pointsTotal': 0
    };
    this.pingCount = 0;
  }

  // 登录方法
  async ['login']() {
    await Helper.delay(1000, this.acc, "尝试登录...", this);
    const response = await this.fetch("/auth/v1/token?grant_type=password", 'POST', undefined, {
      'email': this.acc.email,
      'password': this.acc.password,
      'gotrue_meta_security': {}
    });
    if (response.status == 200) {
      this.token = response.access_token;
      this.refreshToken = response.refresh_token;
      this.user = response.user;
    } else {
      this.handleError(response);
    }
  }

  // 获取用户信息
  async ['getUser']() {
    await Helper.delay(1000, this.acc, "获取用户信息...", this);
    const response = await this.fetch('/auth/v1/user', 'GET', this.token);
    if (response.status == 200) {
      this.user = response;
    } else {
      this.handleError(response);
    }
  }

  // 连接 WebSocket
  async ['connectWebSocket']() {
    let agent;
    try {
      await Helper.delay(500, this.acc, "连接到 WebSocket...", this);
      if (this.proxy) {
        if (this.proxy.startsWith('http')) {
          agent = new HttpsProxyAgent(this.proxy);
        }
        if (this.proxy.startsWith('socks')) {
          agent = new SocksProxyAgent(this.proxy);
        }
      }
      this.socketURL = 'wss://secure.ws.teneo.pro/websocket?userId=' + this.user.id + '&version=v0.2';
      this.socket = new WebSocket(this.socketURL, { 'agent': agent });

      this.socket.onopen = async () => {
        try {
          await Helper.delay(500, this.acc, "WebSocket 连接已打开", this);
          this.wssReconnectAttempts = 0;
        } catch (error) {
          logger.error("WebSocket onopen 出错: " + error);
          throw error;
        }
      };

      this.socket.onmessage = async event => {
        try {
          const data = JSON.parse(event.data);
          logger.info(event.data);
          await Helper.delay(2000, this.acc, "收到消息: " + data.message, this);
          if (data.pointsToday) {
            this.point = {
              'pointsToday': data.pointsToday,
              'pointsTotal': data.pointsTotal
            };
            await Helper.delay(1000, this.acc, "用户积分已更新", this);
          }
          this.startPing();
        } catch (error) {
          logger.error("处理 WebSocket 消息出错: " + error);
          throw error;
        }
      };

      this.socket.onerror = async error => {
        try {
          await Helper.delay(500, this.acc, "WebSocket 出错: " + error, this);
        } catch (handleError) {
          logger.error("处理 WebSocket 出错事件时出错: " + handleError);
          throw handleError;
        }
      };

      this.socket.onclose = async closeEvent => {
        try {
          if (closeEvent.wasClean) {
            await Helper.delay(500, this.acc, "WebSocket 连接已正常关闭", this);
          } else {
            await Helper.delay(500, this.acc, "WebSocket 连接意外关闭", this);
          }
          await this.stopPing();
          await this.reconnectWebSocket();
        } catch (error) {
          logger.error("处理 WebSocket 关闭事件时出错: " + error);
          throw error;
        }
      };

    } catch (error) {
      logger.error("connectWebSocket 出错: " + error);
      throw error;
    }
  }

  // WebSocket 重连方法
  async ["reconnectWebSocket"]() {
    try {
      if (this.wssReconnectAttempts < this.maxwssReconnectAttempts) {
        this.wssReconnectAttempts += 1;
        const delayTime = Math.min(5000, 1000 * this.wssReconnectAttempts);
        await Helper.delay(delayTime, this.acc, "尝试重新连接 (#" + this.wssReconnectAttempts + ')...', this);
        await this.connectWebSocket();
      } else {
        await Helper.delay(1800000, this.acc, "已达到最大重连次数，30 分钟后重试", this);
        await this.connectWebSocket();
      }
    } catch (error) {
      logger.error("reconnectWebSocket 出错: " + error);
      throw error;
    }
  }

  // 发送 Ping 消息
  async ['sendPing']() {
    this.pingCount += 1;
    await Helper.delay(0, this.acc, "发送 PING " + this.pingCount, this);
    this.socket.send(JSON.stringify({ 'type': 'PING' }));
    await Helper.delay(10000, this.acc, "PING " + this.pingCount + " 已发送", this);
  }

  // 开始 Ping 发送
  async ['startPing']() {
    if (!this.pingInterval) {
      await Helper.delay(0, this.acc, "启动 PING 发送，每 10 秒发送一次", this);
      this.pingInterval = setInterval(async () => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          await this.sendPing();
        }
      }, 10000);
    }
  }

  // 停止 Ping 发送
  async ['stopPing']() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // 错误处理方法
  async ['handleError'](error) {
    throw error;
  }
}
