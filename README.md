# Teneo 节点机器人 使用指南



### 项目简介
Teneo 机器人是一个自动化的脚本项目，用于批量管理多个账户，完成相关任务。该项目包括用户账户登录、WebSocket 连接、代理支持以及各种日志输出功能。


机器人功能

多账户支持

简易账户注册

代理支持 (HTTP / SOCKS5)

自动运行 Teneo 节点

TENEO 扩展节点空投

TENEO 节点空投

➡️ 下载扩展程序: https://chromewebstore.google.com/detail/teneo-community-node/emcclcoaglgcpoognfiggmhnhgabppkm
安装扩展程序

登录或创建账户

输入推荐码 : XnE27 (使用推荐码获得2500积分)

验证电子邮件

运行节点扩展

出发吧！

## 设置并配置机器人

### Linux
克隆项目仓库
```bash
git clone https://github.com/ziqing888/teneo-node-bot.git && cd teneo-node-bot
```
运行
```bash
npm install && npm run setup
```
配置您的账户
```bash
nano accounts/accounts.js
```
配置机器人设置
```bash
nano config/config.js
```
配置代理
```bash
nano config/proxy_list.js
```
运行机器人
```bash
npm run start
```
## Windows
打开 命令提示符 或 Power Shell。
克隆项目仓库
```bash
git clone https://github.com/ziqing888/teneo-node-bot.git && cd teneo-node-bot
```
运行
```bash
npm install && npm run setup
```
进入 teneo-node-bot目录。

进入 accounts 文件夹并将 accounts_tmp.js 重命名为 accounts.js。

打开 accounts.js 配置您的账户。

进入 config 文件夹并根据需要调整 config.js。

如果需要使用代理，打开 proxy_list.js 配置代理（如果有5个账户，建议使用代理）。

返回 Teneo-Bot 目录。

启动应用，打开 命令提示符 或 Power Shell。

运行机器人
```bash
npm run start
```
## 批量注册机器人
克隆项目仓库
```bash
git clone https://github.com/ziqing888/teneo-node-bot && cd teneo-node-bot
```
运行
```bash
npm install
```
进入 accounts 文件夹并将 accounts_tmp.yaml 重命名为 accounts.yaml。
配置您的账户
运行机器人
```bash
npm run regist
```
## 更新机器人
按以下步骤更新机器人：

运行
```bash
git pull
```
```bash
git pull --rebase
```

如果出错，运行
```bash
git stash && git pull
```
运行
```bash

npm update
```
启动机器人
## 重要说明（请务必阅读）
DYOR - 自行研究

如何获得 Teneo 积分？
奖励分配根据您的贡献而定。您可以通过连接节点或邀请新人加入我们的网络来收集 Teneo 积分。积分分配如下：

邀请好友

每个推荐：5,000 积分
每个被邀请者：2,500 积分
节点连接

每次心跳：25 积分
每天最多积分：2,400 积分
当被邀请者达到10次成功心跳后，积分会被计入。 每小时包含4次心跳，评估您的节点是否已连接并成功运行。请注意积分模式可能随时更改。

Teneo 使用 Web Socket，因此请确保每个账户仅开启一个会话。例如，如果使用账户 A 运行机器人，请不要在浏览器扩展中再次运行该账户。

如果运行多个账户，请使用代理

