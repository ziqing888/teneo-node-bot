import { accountLists } from './accounts/accounts.js';
import { proxyList } from './config/proxy_list.js';
import a0_0x40d5ac from './src/core/core.js';
import { Helper } from './src/utils/helper.js';
import a0_0x31cef9 from './src/utils/logger.js';

async function operation(_0x4ba641, _0x34b9e8) {
  const _0x2bc985 = new a0_0x40d5ac(_0x4ba641, _0x34b9e8);
  try {
    await _0x2bc985.login();
    await _0x2bc985.getUser();
    //await Helper.refCheck(_0x2bc985.user.user_metadata.invited_by, _0x2bc985.user.email);
    await _0x2bc985.connectWebSocket();
  } catch (_0xd646) {
    if (_0xd646.message) {
      await Helper.delay(0x2710, _0x4ba641, "错误 : " + _0xd646.message + "，10秒后重试", _0x2bc985);
    } else {
      await Helper.delay(0x2710, _0x4ba641, "错误 : " + JSON.stringify(_0xd646) + "，10秒后重试", _0x2bc985);
    }
    await operation(_0x4ba641, _0x34b9e8);
  }
}

async function startBot() {
  return new Promise(async (_0x29f1d0, _0x29ba85) => {
    try {
      a0_0x31cef9.info("机器人已启动");
      if (accountLists.length == 0x0) {
        throw Error("请先在 accounts.js 文件中输入您的账户信息");
      }
      if (proxyList.length != accountLists.length && proxyList.length != 0x0) {
        throw Error("您有 " + accountLists.length + " 个账户，但提供了 " + proxyList.length + " 个代理");
      }
      const _0x125816 = [];
      for (const _0x2bc5e4 of accountLists) {
        const _0x30b550 = accountLists.indexOf(_0x2bc5e4);
        const _0x211683 = proxyList[_0x30b550];
        _0x125816.push(operation(_0x2bc5e4, _0x211683));
      }
      await Promise.all(_0x125816);
      _0x29f1d0();
    } catch (_0x286bc8) {
      a0_0x31cef9.info("机器人已停止");
      a0_0x31cef9.error(JSON.stringify(_0x286bc8));
      _0x29ba85(_0x286bc8);
    }
  });
}

(async () => {
  try {
    a0_0x31cef9.clear();
    a0_0x31cef9.info('');
    a0_0x31cef9.info("应用程序已启动");
    console.log("TENEO 节点机器人");
    console.log();
    console.log("加入频道 : https://t.me/ksqxszq");
    console.log("请勿忘记运行 git pull 以保持更新");
    console.log();
    console.log();
    Helper.showSkelLogo();
    await startBot();
  } catch (_0x8553e0) {
    console.log("执行机器人时出错", _0x8553e0);
    await startBot();
  }
})();
