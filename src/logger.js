require('colors');

// 图标定义
const INFO_ICON = 'ℹ️';
const SUCCESS_ICON = '✅';
const WARNING_ICON = '⚠️';
const ERROR_ICON = '❌';

// 延迟函数
const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 显示标题
function displayHeader() {
    process.stdout.write('\x1Bc'); // 清屏
    console.log('╔════════════════════════════════════════╗'.yellow);
    console.log('║      🚀  Teneo 节点 bot  🚀           ║'.yellow);
    console.log('║  👤    脚本编写：@qklxsqf              ║'.yellow);
    console.log('║  📢  电报频道：https://t.me/ksqxszq    ║'.yellow);
    console.log('╚════════════════════════════════════════╝'.yellow);
    console.log(); // 空行
}

// 信息显示函数
function log_info(message) {
    console.log(`${INFO_ICON} ${message}`.blue);
}

function log_success(message) {
    console.log(`${SUCCESS_ICON} ${message}`.green);
}

function log_warning(message) {
    console.log(`${WARNING_ICON} ${message}`.yellow);
}

function log_error(message) {
    console.log(`${ERROR_ICON} ${message}`.red);
}

module.exports = { delay, displayHeader, log_info, log_success, log_warning, log_error };

