#!/bin/bash

# 显示标题
echo "====================================="
echo "🚀 Teneo 节点机器人自动化安装脚本 🚀"
echo "====================================="

# 菜单函数
show_menu() {
  echo "请选择操作:"
  echo "1) 安装依赖"
  echo "2) 编辑账户配置"
  echo "3) 编辑代理配置"
  echo "4) 配置是否使用代理"
  echo "5) 启动 Teneo 节点机器人"
  echo "6) 退出"
  echo ""
}

# 克隆仓库并安装依赖
clone_and_install_dependencies() {
  if [ -d "teneo-node-bot" ]; then
    echo "teneo-node-bot 目录已存在，跳过克隆。"
  else
    echo "正在克隆仓库..."
    git clone https://github.com/ziqing888/teneo-node-bot.git || { echo "克隆仓库失败"; exit 1; }
  fi

  echo "进入 teneo-node-bot 目录并安装依赖..."
  cd teneo-node-bot || { echo "无法进入 teneo-node-bot 目录"; exit 1; }
  npm install
  cd ..
  echo "依赖安装完成！"
}

# 编辑账户配置
edit_accounts() {
  echo "打开账户配置文件 (account.js) 进行编辑..."
  nano teneo-node-bot/account.js
}

# 编辑代理配置
edit_proxies() {
  echo "打开代理配置文件 (proxy.js) 进行编辑..."
  nano teneo-node-bot/proxy.js
}

# 配置是否使用代理
edit_use_proxy() {
  echo "打开代理配置文件 (config.js) 进行编辑..."
  nano teneo-node-bot/config.js
}

# 启动项目
start_project() {
  echo "进入 teneo-node-bot 目录并启动 Teneo 节点机器人..."
  cd teneo-node-bot || { echo "无法进入 teneo-node-bot 目录"; exit 1; }
  npm start
  cd ..
}

# 主逻辑
while true; do
  show_menu
  read -p "请选择一个选项 (1-6): " choice
  case $choice in
    1)
      clone_and_install_dependencies
      ;;
    2)
      edit_accounts
      ;;
    3)
      edit_proxies
      ;;
    4)
      edit_use_proxy
      ;;
    5)
      start_project
      ;;
    6)
      echo "退出脚本。"
      exit 0
      ;;
    *)
      echo "无效选项，请重新选择。"
      ;;
  esac
done
