const axios = require('axios');
const logger = require('./logger');
const { connectWebSocket } = require('./websocketManager');
const accounts = require('../config/account');

// 原有的硬编码授权和 API 密钥
const authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

let userIds = [];

// 获取用户 ID
async function getUserId(index) {
  const loginUrl = "https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/token?grant_type=password";

  try {
    const response = await axios.post(loginUrl, {
      email: accounts[index].email,
      password: accounts[index].password
    }, {
      headers: {
        'Authorization': authorization,
        'apikey': apikey
      }
    });

    userIds[index] = response.data.user.id;
    logger.log_success(`账户 ${index + 1} 用户 ID 获取成功: ${userIds[index]}`);
    connectWebSocket(index, userIds[index]);
  } catch (error) {
    logger.log_error(`账户 ${index + 1} 获取用户 ID 失败: ${error.response ? error.response.data : error.message}`);
  }
}

// 启动机器人
function startBot(account) {
  const index = accounts.indexOf(account);
  getUserId(index);
}

module.exports = startBot;

