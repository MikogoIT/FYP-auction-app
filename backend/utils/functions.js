// utils/functions.js

// 将数据库版本号从完整字符串中提取出来
export function formatDbVersion(raw) {
  return raw.trim().split(" ")[1]; // e.g. "PostgreSQL 15.2" -> "15.2"
}

// 计算两个数的平均数
export function average(a, b) {
  return (a + b) / 2;
}

// 简单地检查一个字符串是否为有效的邮箱格式
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
