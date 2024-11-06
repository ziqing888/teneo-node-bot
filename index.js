const axios = require('axios');
const chalk = require('chalk');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const readline = require('readline');
const 账户 = require('./account.js');
const 代理列表 = require('./proxy.js');
const { 使用代理 } = require('./config.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

const 授权 = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";
const 接口密钥 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";

function displayHeader() {
    process.stdout.write('\x1Bc'); // 清屏
    console.log(chalk.yellow("╔════════════════════════════════════════╗"));
    console.log(chalk.yellow("║       🚀  teneo节点挂机 🚀            ║"));
    console.log(chalk.yellow("║    👤    脚本编写：@qklxsqf            ║"));
    console.log(chalk.yellow("║   📢  电报频道：https://t.me/ksqxszq   ║"));
    console.log(chalk.yellow("╚════════════════════════════════════════╝"));
    console.log(); // 空行

  console.log(chalk.cyan(`_____________________________________________`));
}

function 显示账户数据(index) {
  console.log(chalk.cyan(`================= 账户 ${index + 1} =================`));
  console.log(chalk.whiteBright(`邮箱: ${账户[index].邮箱}`));
  console.log(`用户 ID: ${用户ID[index]}`);
  console.log(chalk.green(`积分总数: ${积分总数[index]}`));
  console.log(chalk.green(`今天积分: ${今天积分[index]}`));
  console.log(chalk.whiteBright(`消息: ${消息[index]}`));
  const 代理 = 代理列表[index % 代理列表.length];
  if (使用代理) {
    console.log(chalk.hex('#FFA500')(`代理: ${代理.主机}:${代理.端口} (用户: ${代理.用户名})`));
  }
  console.log(chalk.cyan(`_____________________________________________`));
}

function 日志所有账户() {
  console.clear();
  显示标题();
  for (let i = 0; i < 账户.length; i++) {
    显示账户数据(i);
  }
  console.log("\n状态:");
  for (let i = 0; i < 账户.length; i++) {
    console.log(`账户 ${i + 1}: 潜在积分: ${潜在积分[i]}, 倒计时: ${倒计时[i]}`);
  }
}

async function 连接WebSocket(index) {
  if (套接字[index]) return;
  const 版本 = "v0.2";
  const url = "wss://secure.ws.teneo.pro";
  const wsUrl = `${url}/websocket?userId=${encodeURIComponent(用户ID[index])}&version=${encodeURIComponent(版本)}`;

  const 代理 = 代理列表[index % 代理列表.length];
  const agent = 使用代理 ? new HttpsProxyAgent(`http://${代理.用户名}:${代理.密码}@${代理.主机}:${代理.端口}`) : null;

  套接字[index] = new WebSocket(wsUrl, { agent });

  套接字[index].onopen = async () => {
    上次更新时间[index] = new Date().toISOString();
    console.log(`账户 ${index + 1} 已连接`, 上次更新时间[index]);
    开始发送心跳(index);
    开始倒计时和积分(index);
  };

  套接字[index].onmessage = async (事件) => {
    const 数据 = JSON.parse(事件.data);
    if (数据.pointsTotal !== undefined && 数据.pointsToday !== undefined) {
      上次更新时间[index] = new Date().toISOString();
      积分总数[index] = 数据.pointsTotal;
      今天积分[index] = 数据.pointsToday;
      消息[index] = 数据.message;

      日志所有账户();
    }

    if (数据.message === "Pulse from server") {
      console.log(`服务器心跳收到，账户 ${index + 1}。开始发送心跳...`);
      setTimeout(() => {
        开始发送心跳(index);
      }, 10000);
    }
  };

  套接字[index].onclose = () => {
    套接字[index] = null;
    console.log(`账户 ${index + 1} 已断开`);
    重启账户进程(index);
  };

  套接字[index].onerror = (错误) => {
    console.error(`账户 ${index + 1} WebSocket 错误:`, 错误);
  };
}

function 断开WebSocket(index) {
  if (套接字[index]) {
    套接字[index].close();
    套接字[index] = null;
    重启账户进程(index);
  }
}

function 开始发送心跳(index) {
  心跳间隔[index] = setInterval(async () => {
    if (套接字[index] && 套接字[index].readyState === WebSocket.OPEN) {
      const 代理 = 代理列表[index % 代理列表.length];
      const agent = 使用代理 ? new HttpsProxyAgent(`http://${代理.用户名}:${代理.密码}@${代理.主机}:${代理.端口}`) : null;
      
      套接字[index].send(JSON.stringify({ type: "PING" }), { agent });
      日志所有账户();
    }
  }, 10000);
}

function 停止发送心跳(index) {
  if (心跳间隔[index]) {
    clearInterval(心跳间隔[index]);
    心跳间隔[index] = null;
  }
}

process.on('SIGINT', () => {
  console.log('正在停止...');
  for (let i = 0; i < 账户.length; i++) {
    停止发送心跳(i);
    断开WebSocket(i);
  }
  process.exit(0);
});

function 开始倒计时和积分(index) {
  clearInterval(倒计时间隔[index]);
  更新倒计时和积分(index);
  倒计时间隔[index] = setInterval(() => 更新倒计时和积分(index), 1000);
}

async function 更新倒计时和积分(index) {
  const 重启阈值 = 60000;
  const 当前时间 = new Date();

  if (!上次更新时间[index]) {
    上次更新时间[index] = {};
  }

  if (倒计时[index] === "Calculating...") {
    const 上次计算时间 = 上次更新时间[index].计算时间 || 当前时间;
    const 计算持续时间 = 当前时间.getTime() - 上次计算时间.getTime();

    if (计算持续时间 > 重启阈值) {
      重启账户进程(index);
      return;
    }
  }

  if (上次更新时间[index]) {
    const 下次心跳 = new Date(上次更新时间[index]);
    下次心跳.setMinutes(下次心跳.getMinutes() + 15);
    const 差距 = 下次心跳.getTime() - 当前时间.getTime();

    if (差距 > 0) {
      const 分钟 = Math.floor(差距 / 60000);
      const 秒 = Math.floor((差距 % 60000) / 1000);
      倒计时[index] = `${分钟}m ${秒}s`;

      const 最大积分 = 25;
      const 时间流逝 = 当前时间.getTime() - new Date(上次更新时间[index]).getTime();
      const 时间流逝分钟 = 时间流逝 / (60 * 1000);
      let 新积分 = Math.min(最大积分, (时间流逝分钟 / 15) * 最大积分);
      新积分 = parseFloat(新积分.toFixed(2));

      if (Math.random() < 0.1) {
        const 奖励 = Math.random() * 2;
        新积分 = Math.min(最大积分, 新积分 + 奖励);
        新积分 = parseFloat(新积分.toFixed(2));
      }

      潜在积分[index] = 新积分;
    } else {
      倒计时[index] = "Calculating...";
      潜在积分[index] = 25;

      上次更新时间[index].计算时间 = 当前时间;
    }
  } else {
    倒计时[index] = "Calculating...";
    潜在积分[index] = 0;

    上次更新时间[index].计算时间 = 当前时间;
  }

  日志所有账户();
}

function 重启账户进程(index) {
  断开WebSocket(index);
  连接WebSocket(index);
  console.log(`WebSocket 已重启，索引: ${index}`);
}

async function 获取用户ID(index) {
  const 登录地址 = "https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/token?grant_type=password";

  const 代理 = 代理列表[index % 代理列表.length];
  const agent = 使用代理 ? new HttpsProxyAgent(`http://${代理.用户名}:${代理.密码}@${代理.主机}:${代理.端口}`) : null;

  try {
    const 响应 = await axios.post(登录地址, {
      email: 账户[index].邮箱,
      password: 账户[index].密码
    }, {
      headers: {
        'Authorization': 授权,
        'apikey': 接口密钥
      },
      httpsAgent: agent
    });

    用户ID[index] = 响应.data.user.id;
    日志所有账户();

    const 资料地址 = `https://ikknngrgxuxgjhplbpey.supabase.co/rest/v1/profiles?select=personal_code&id=eq.${用户ID[index]}`;
    const 资料响应 = await axios.get(资料地址, {
      headers: {
        'Authorization': 授权,
        'apikey': 接口密钥
      },
      httpsAgent: agent
    });

    console.log(`账户 ${index + 1} 的资料数据:`, 资料响应.data);
    开始倒计时和积分(index);
    await 连接WebSocket(index);
  } catch (错误) {
    console.error(`账户 ${index + 1} 的错误:`, 错误.response ? 错误.response.data : 错误.message);
  }
}

显示标题();

for (let i = 0; i < 账户.length; i++) {
  潜在积分[i] = 0;
  倒计时[i] = "Calculating...";
  积分总数[i] = 0;
  今天积分[i] = 0;
  上次更新时间[i] = null;
  消息[i] = '';
  用户ID[i] = null;
  获取用户ID(i);
}

