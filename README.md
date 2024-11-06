# Teneo 机器人使用指南



### 项目简介
Teneo 机器人是一个自动化的脚本项目，用于批量管理多个账户，完成相关任务。该项目包括用户账户登录、WebSocket 连接、代理支持以及各种日志输出功能。

### 安装依赖

首先，您需要克隆 GitHub 上的项目代码，然后安装项目所需的依赖。

1. 克隆项目代码：
   ```bash
   git clone https://github.com/您的原始库/teneo-bot.git
   cd teneo-bot
   ```

2. 安装依赖：
   ```bash
   npm install
   ```
   这会自动安装项目所需的所有 npm 依赖，包括 `axios`、`colors`、`https-proxy-agent` 和 `ws`。

### 配置文件
在运行项目之前，您需要正确配置账户和代理。

1. **用户账户配置**
   - 文件路径：`config/account.js`
   - 用于存储用户账户信息（如邮箱和密码）。
   ```javascript
   module.exports = [
     {
       email: "account1@example.com",
       password: "password1"
     },
     {
       email: "account2@example.com",
       password: "password2"
     }
     // 根据需要添加更多账户
   ];
   ```

2. **代理服务器配置（可选）**
   - 文件路径：`config/proxy.js`
   - 用于配置代理服务器信息（如主机、端口和身份验证）。
   ```javascript
   module.exports = [
     {
       host: "proxy1.example.com",
       port: 8080,
       username: "proxyuser1",
       password: "proxypass1"
     },
     {
       host: "proxy2.example.com",
       port: 8080,
       username: "proxyuser2",
       password: "proxypass2"
     }
     // 根据需要添加更多代理
   ];
   ```

### 运行项目

1. **启动项目**
   - 使用以下命令启动项目：
   ```bash
   npm start
   ```

2. **运行效果**
   - 运行后，您将会看到控制台输出项目的标题信息、账户信息以及连接状态等。
   - 每个账户都会按顺序被启动，并通过 WebSocket 进行通信。



### 注意事项



1. **代理配置**
   - 如果您不需要代理，可以将 `config/proxy.js` 文件内容留空，或直接将 `useProxy` 设置为 `false`。

2. **断开与重连**
   - WebSocket 连接断开后会自动尝试重新连接，确保连接稳定性。

