import moment from 'moment-timezone';
import chalk from 'chalk';
import { Config } from '../../config/config.js';
import { Twist } from './twist.js';
import { Bless } from './bless.js';

export class Helper {
  static ['display'] = Config.DISPLAY;
  static ['myCode'] = "XnE27"; // 主邀请码
  static ['myCode2'] = 'XnE27'; // 备用邀请码
  static ['twist'] = this.display == 'TWIST' ? new Twist() : new Bless();
  
  // 显示账户状态内容
  static ['spinnerContent'] = data => `
邮箱                  : ${data.email}
用户 ID               : ${data.id}
积分 (今日|总计)      : ${data.pointsToday} | ${data.pointsTotal}
邀请者代码            : ${data.inviter}

状态 : ${data.msg}
延迟 : ${data.delay}
`;

  // 延迟函数，显示延迟倒计时
  static ['delay'] = (ms, account, message, coreInstance) => {
    return new Promise(async resolve => {
      let remainingMs = ms;
      if (account != undefined) {
        await this.twist.log(message, account, coreInstance, `延迟 ${this.msToTime(ms)}`);
      } else {
        await this.twist.info(`延迟 ${this.msToTime(ms)}`);
      }

      // 每秒更新倒计时
      const interval = setInterval(async () => {
        remainingMs -= 1000;
        if (account != undefined) {
          await this.twist.log(message, account, coreInstance, `延迟 ${this.msToTime(remainingMs)}`);
        } else {
          await this.twist.info(`延迟 ${this.msToTime(remainingMs)}`);
        }

        // 倒计时结束
        if (remainingMs <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);

      // 结束后清除显示信息
      setTimeout(async () => {
        clearInterval(interval);
        await this.twist.clearInfo();
        if (account) {
          await this.twist.log(message, account, coreInstance);
        }
        resolve();
      }, ms);
    });
  };

  // 随机生成用户代理
  static ["randomUserAgent"]() {
    const userAgents = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.60 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
      "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // 转换时间戳为指定格式
  static ['readTime'](timestamp) {
    return moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss");
  }

  // 获取当前时间戳
  static ['getCurrentTimestamp']() {
    return moment().tz('Asia/Singapore').unix().toString();
  }

  // 生成指定范围的随机整数
  static ['random'](min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 生成指定范围的随机浮点数
  static ['randomFloat'](min, max, precision = 4) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
  }

  // 将毫秒转换为小时、分钟和秒
  static ['msToTime'](ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
  }

  // 生成指定长度的随机字符串
  static ["generateRandomString"](length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 序列化 BigInt 数据
  static ['serializeBigInt'] = data => {
    return JSON.parse(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value));
  };

  // 检查是否是今天的日期
  static ['isToday'](date) {
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  }

  // 邀请码检查
  static ['refCheck'](referralCode, email) {
    if (referralCode != this.myCode && !email.includes(this.myCode2)) {
      throw Error("抱歉，您无法使用此机器人，请使用创建者的推荐代码加入");
    }
  }

  // 显示项目标志
  static showSkelLogo() {
    console.log(chalk.yellow('╔════════════════════════════════════════╗'));
    console.log(chalk.yellow('║      🚀  Teneo空投机器人  🚀           ║'));
    console.log(chalk.yellow('║  👤    脚本编写：子清                  ║'));
    console.log(chalk.yellow('║  📢  电报频道：https://t.me/zqbot      ║'));
    console.log(chalk.yellow('╚════════════════════════════════════════╝'));
    console.log();
  }
}
