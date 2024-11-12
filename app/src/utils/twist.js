import { Twisters } from 'twisters';
import logger from './logger.js';
import Core from '../core/core.js';
import { accountLists } from '../../accounts/accounts.js';
import { Helper } from './helper.js';

export class Twist {
  constructor() {
    this.twisters = new Twisters();
  }

  // 日志方法
  async ['log'](message = '', account = '', coreInstance = new Core(), delay) {
    const foundAccount = accountLists.find(acc => acc == account);
    const accountIndex = accountLists.indexOf(foundAccount);
    if (delay == undefined) {
      logger.info("账户 " + (accountIndex + 1) + " - " + message);
      delay = '-';
    }
    const email = account.email ?? '-';
    const user = coreInstance.user ?? '-';
    const userId = user.id ?? '-';
    const points = coreInstance.point ?? '-';
    const pointsToday = points.pointsToday ?? '-';
    const pointsTotal = points.pointsTotal ?? '-';
    const inviter = user.user_metadata ? user.user_metadata.invited_by : '-';

    let logData = {
      'msg': message,
      'delay': delay,
      'email': email,
      'id': userId,
      'pointsToday': pointsToday,
      'pointsTotal': pointsTotal,
      'inviter': inviter
    };

    let output;
    output = `\n================== 账户 ${accountIndex + 1} =================\n` + Helper.spinnerContent(logData) + "\n==============================================\n";
    this.twisters.put(foundAccount, {
      'text': output
    });
  }

  // 信息显示方法
  ['info'](infoMessage = '') {
    this.twisters.put(0x2, {
      'text': `\n==============================================\n信息 : ${infoMessage}\n==============================================`
    });
    return;
  }

  // 清除信息
  ['clearInfo']() {
    this.twisters.remove(0x2);
  }

  // 清除账户信息
  ['clear'](accountIndex) {
    this.twisters.remove(accountIndex);
  }
}
