import fs from "fs";
import path from "path";


async function copyFolder(src, dest) {
  try {
    await fs.promises.mkdir(dest, { recursive: true }); 
    const entries = await fs.promises.readdir(src, { withFileTypes: true }); 

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name); 
      const destPath = path.join(dest, entry.name); 

      if (entry.isDirectory()) {
        await copyFolder(srcPath, destPath); 
      } else {
        await fs.promises.copyFile(srcPath, destPath); 
      }
    }

    console.log(`已复制 ${src} 到 ${dest}`);
  } catch (err) {
    console.error(`从 ${src} 复制到 ${dest} 时出错:`, err);
  }
}

// 设置源和目标文件夹路径
const accountsSrc = path.join(process.cwd(), "accounts");
const configSrc = path.join(process.cwd(), "config");
const accountsDest = path.join(process.cwd(), "app", "accounts");
const configDest = path.join(process.cwd(), "app", "config");

(async () => {
  // 复制 "accounts" 和 "config" 文件夹到 "app" 文件夹下的对应位置
  await copyFolder(accountsSrc, accountsDest);
  await copyFolder(configSrc, configDest);

  console.log("正在启动应用...");
  await import("./app/index.js");
})();
