import blessed from 'blessed';
import logger from './logger.js';
import Core from '../core/core.js';
import { Helper } from './helper.js';
import { accountLists } from '../../accounts/accounts.js';

export class Bless {
  constructor() {
    // 创建屏幕界面
    this.screen = blessed.screen({
      smartCSR: true
    });
    this.screen.title = "空投助手";

    // 创建标题框
    this.titleBox = blessed.box({
      top: 0,
      left: 'center',
      width: 'shrink',
      height: 2,
      tags: true,
      content: "{center}TENEO 节点机器人{/center}\n    By: qklxsqf",
      style: {
        fg: 'white',
        bold: true
      }
    });
    this.screen.append(this.titleBox);

    // 创建副标题框
    this.subTitle = blessed.box({
      top: 1,
      left: 'center',
      width: 'shrink',
      height: 2,
      tags: true,
      content: "By: qklxsqf (https://t.me/ksqxszq)",
      style: {
        fg: 'white',
        bold: true
      }
    });
    this.screen.append(this.subTitle);

    // 标签栏，用于显示账户切换提示
    this.tabList = blessed.box({
      top: 5,
      left: 'center',
      width: '100%',
      height: 3,
      tags: true,
      style: {
        fg: 'white'
      }
    });
    this.screen.append(this.tabList);

    // 底部提示框，显示键盘操作提示
    this.hintBox = blessed.box({
      bottom: 0,
      left: 'center',
      width: '100%',
      height: 3,
      tags: true,
      content: "{center}使用 '->'(右箭头) 和 '<-'(左箭头) 切换选项卡{/center}",
      style: {
        fg: 'white'
      }
    });
    this.screen.append(this.hintBox);

    // 信息框，显示额外信息
    this.infoBox = blessed.box({
      bottom: 3,
      left: 'center',
      width: '100%',
      height: 3,
      tags: true,
      content: '',
      style: {
        fg: 'white'
      }
    });
    this.screen.append(this.infoBox);

    // 创建账户选项卡
    this.tabs = [];
    this.currentTabIndex = 0;
    accountLists.forEach((account, index) => {
      const tab = this.createAccountTab("账户 " + (index + 1));
      this.tabs.push(tab);
      this.screen.append(tab);
      tab.hide();
    });
    if (this.tabs.length > 0) {
      this.tabs[0].show();
    }

    // 渲染选项卡列表
    this.renderTabList();

    // 键盘事件
    this.screen.key(['q', 'C-c'], () => process.exit(0));
    this.screen.key(['left', 'right'], (ch, key) => {
      if (key.name === 'right') {
        this.switchTab((this.currentTabIndex + 1) % this.tabs.length);
      } else if (key.name === 'left') {
        this.switchTab((this.currentTabIndex - 1 + this.tabs.length) % this.tabs.length);
      }
    });

    this.screen.render();
  }

  // 创建账户选项卡
  createAccountTab(label) {
    return blessed.box({
      label: label,
      top: 6,
      left: 0,
      width: "100%",
      height: 'shrink',
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: '#f0f0f0' }
      },
      tags: true
    });
  }

  // 渲染标签栏
  renderTabList() {
    let tabContent = '';
    accountLists.forEach((account, index) => {
      if (index === this.currentTabIndex) {
        tabContent += "{blue-fg}{bold} 账户 " + (index + 1) + " {/bold}{/blue-fg} ";
      } else {
        tabContent += " 账户 " + (index + 1) + " ";
      }
    });
    this.tabList.setContent('{center}' + tabContent + '{/center}');
    this.screen.render();
  }

  // 切换选项卡
  switchTab(newTabIndex) {
    this.tabs[this.currentTabIndex].hide();
    this.currentTabIndex = newTabIndex;
    this.tabs[this.currentTabIndex].show();
    this.renderTabList();
    this.screen.render();
  }

  // 记录日志
  async log(msg = '', account = '', coreInstance = new Core(), delay) {
    const foundAccount = accountLists.find(acc => acc === account);
    const accountIndex = accountLists.indexOf(foundAccount);
    if (delay === undefined) {
      logger.info("账户 " + (accountIndex + 1) + " - " + msg);
      delay = '-';
    }
    const email = account.email ?? '-';
    const userId = coreInstance.user?.id ?? '-';
    const pointsToday = coreInstance.point?.pointsToday ?? '-';
    const pointsTotal = coreInstance.point?.pointsTotal ?? '-';
    const inviter = coreInstance.user?.user_metadata?.invited_by ?? '-';
    const logData = { msg, delay, email, id: userId, pointsToday, pointsTotal, inviter };
    this.tabs[accountIndex].setContent(Helper.spinnerContent(logData));
    this.screen.render();
  }

  // 显示信息
  info(message = '') {
    this.infoBox.setContent("\n{center}信息: " + message + "{/center}\n");
    this.screen.render();
  }

  // 清除信息
  clearInfo() {
    this.infoBox.setContent('');
    this.screen.render();
  }
}
