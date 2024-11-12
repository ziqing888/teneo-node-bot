import fs from "fs";
import path from "path";

// 检查文件是否存在
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath); // 尝试访问文件
    return true;
  } catch {
    return false; // 如果文件不存在则返回 false
  }
}

// 复制文件函数
async function copyFile(src, dest) {
  try {
    if (await fileExists(dest)) {
      console.log(`文件已存在于 ${dest}，跳过复制。`);
    } else {
      await fs.promises.copyFile(src, dest); // 执行复制操作
      console.log(`已复制 ${src} 到 ${dest}`);
    }
  } catch (err) {
    console.error(`从 ${src} 复制到 ${dest} 时出错:`, err);
  }
}

// 定义要复制的文件操作
const copyOperations = [
  {
    src: path.join("config", "config_tmp.js"),
    dest: path.join("config", "config.js"),
  },
  {
    src: path.join("config", "proxy_list_tmp.js"),
    dest: path.join("config", "proxy_list.js"),
  },
  {
    src: path.join("accounts", "accounts_tmp.js"),
    dest: path.join("accounts", "accounts.js"),
  },
];

(async () => {
  console.log(`正在复制模板文件`);
  for (let { src, dest } of copyOperations) {
    await copyFile(src, dest); // 执行每一个复制操作
  }
  console.log(`\n设置完成`);
  console.log(
    `请打开并配置\n- accounts/accounts.js\n- config/config.js\n- config/proxy_list.js`
  );
})();
