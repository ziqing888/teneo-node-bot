const axios = require('axios');
const logger = require('./src/logger');
const { connectWebSocket } = require('./src/websocketManager');
const accounts = require('./config/account.js');

// 原有的硬编码授权和 API 密钥
const authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";

let userIds = [];

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
    logger.success(`Account ${index + 1} User ID Acquired: ${userIds[index]}`);
    connectWebSocket(index, userIds[index]);
  } catch (error) {
    logger.error(`Error fetching User ID for Account ${index + 1}: ${error.response ? error.response.data : error.message}`);
  }
}

function startBot() {
  for (let i = 0; i < accounts.length; i++) {
    getUserId(i);
  }
}

startBot();