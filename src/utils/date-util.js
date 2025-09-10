// date-util.js
/*
 * 日期工具函数
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01 00:00:00
 * @Wechat:    zhuoda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param {string|Date|dayjs.Dayjs} date - 日期
 * @param {string} format - 格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '-';
  }
  return dayjs(date).format(format);
}

/**
 * 格式化日期
 * @param {string|Date|dayjs.Dayjs} date - 日期
 * @param {string} format - 格式，默认为 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) {
    return '-';
  }
  return dayjs(date).format(format);
}

/**
 * 格式化时间
 * @param {string|Date|dayjs.Dayjs} date - 日期
 * @param {string} format - 格式，默认为 'HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date, format = 'HH:mm:ss') {
  if (!date) {
    return '-';
  }
  return dayjs(date).format(format);
}

/**
 * 获取相对时间
 * @param {string|Date|dayjs.Dayjs} date - 日期
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date) {
  if (!date) {
    return '-';
  }
  return dayjs(date).fromNow();
}

/**
 * 检查日期是否有效
 * @param {string|Date|dayjs.Dayjs} date - 日期
 * @returns {boolean} 是否有效
 */
export function isValidDate(date) {
  return dayjs(date).isValid();
}

/**
 * 获取当前时间
 * @param {string} format - 格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 当前时间字符串
 */
export function getCurrentTime(format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs().format(format);
}
