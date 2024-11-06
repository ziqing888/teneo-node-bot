module.exports = [
  {
    主机: "proxy1.example.com",
    端口: 8080,
    用户名: "proxyuser1",  // 如果代理需要身份验证，请包含这些信息；如果不需要验证，可以删除
    密码: "proxypass1"
  },
  {
    主机: "proxy2.example.com",
    端口: 8080,
    用户名: "proxyuser2",
    密码: "proxypass2"
  },
  // 根据需要添加更多代理
];
