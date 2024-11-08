# Teneo 节点机器人 使用指南



### 项目简介
Teneo 机器人是一个自动化的脚本项目，用于批量管理多个账户，完成相关任务。该项目包括用户账户登录、WebSocket 连接、代理支持以及各种日志输出功能。

### 一键脚本命令
 ```bash
[ -f "Teneo-bot.sh" ] && rm Teneo-bot.sh; wget -q -O Teneo-bot.sh https://raw.githubusercontent.com/ziqing888/-bot-collection/refs/heads/main/Teneo-bot.sh && chmod +x Teneo-bot.sh && ./Teneo-bot.sh


 ```
### 配置文件
在运行项目之前，您需要正确配置账户和代理（多号情况下使用代理，但是不建议使用多号，最好是一机一号。

用户账户配置

文件路径：account.js
用于存储用户账户信息（如邮箱和密码）

 ```bash
module.exports = [
  {
    邮箱: "account1@example.com",
    密码: "password1"
  },
  {
    邮箱: "account2@example.com",
    密码: "password2"
  }
  // 根据需要添加更多账户
];


   ```
代理服务器配置（可选）

文件路径：proxy.js
用于配置代理服务器信息（如主机、端口和身份验证）。
  ```bash
module.exports = [
  {
    主机: "proxy1.example.com", // 代理服务器的主机名或 IP 地址
    端口: 8080,  // 代理服务器的端口号，用于代理连接
    用户名: "proxyuser1", // 代理服务器的用户名，如果代理需要身份验证，请填写
    密码: "proxypass1" // 代理服务器的密码，如果代理需要身份验证，请填写
  },
  {
    主机: "proxy2.example.com",
    端口: 8080,
    用户名: "proxyuser2",
    密码: "proxypass2"
  }
  // 根据需要添加更多代理
];
 ```

### 运行效果

运行后，您将会看到控制台输出项目的标题信息、账户信息以及连接状态等。
每个账户都会按顺序被启动，并通过 WebSocket 进行通信。
## 注意事项
代理配置

如果您不需要代理，可以将 proxy.js 文件内容留空，或直接在 config.js 中将 使用代理 设置为 false。

