import fs from 'fs/promises';
import yaml from 'js-yaml';
import axios from 'axios';
import chalk from 'chalk';

const signupUrl = "https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/signup"; // 注册 URL
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag"; // API 密钥

// 注册用户的异步函数
async function registerUser(email, password) {
    try {
      const response = await axios.post(signupUrl, {
        email: email,
        password: password,
        data: { invited_by: "8wtOB" } // 邀请码
      }, {
        headers: {
          'apikey': apikey // API 密钥
        }
      });
      console.log(chalk.green(`注册成功: ${email}`));
    } catch (error) {
      console.error(chalk.red(`注册 ${email} 时出错:`, error.response ? error.response.data : error.message));
    }
  }
  
// 延迟函数
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
// 处理账户注册的主函数
async function processAccounts() {
    try {
      const fileContent = await fs.readFile('./accounts/accounts.yaml', 'utf-8'); // 读取 YAML 文件
      const accountData = yaml.load(fileContent); // 解析 YAML 数据
      const accounts = accountData.accounts; // 获取账户列表
  
      for (const account of accounts) {
        const [email, password] = account.email.split(':'); // 分割邮箱和密码
        const proxy = account.proxy; // 获取代理

        if (email && password && proxy) {
          await registerUser(email, password); // 注册用户
          console.log(chalk.cyan(`等待 5 秒后注册下一个邮箱...`));
          await delay(5000); // 延迟 5 秒
        } else {
          console.warn(chalk.yellow(`跳过无效条目: ${JSON.stringify(account)}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('读取账户文件时出错:'), error.message);
    }
}
  
processAccounts(); // 启动账户注册流程
