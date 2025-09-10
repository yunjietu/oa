// time-status-util.js
/*
 * 基于时间的状态工具函数
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01 00:00:00
 * @Wechat:    zhuoda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

/**
 * 根据预计结束时间计算订单状态颜色
 * @param {string} expectedEndTime - 预计结束时间
 * @param {number} taskStatus - 当前任务状态
 * @returns {string} 状态颜色
 */
export function getTimeBasedStatusColor(expectedEndTime, taskStatus) {
  // 如果订单已完成或已取消，使用原有状态颜色
  if (taskStatus === 3 || taskStatus === 4) {
    return null; // 返回null表示使用原有状态颜色
  }
  
  // 如果没有预计结束时间，使用原有状态颜色
  if (!expectedEndTime) {
    return null;
  }
  
  const now = new Date();
  const endTime = new Date(expectedEndTime);
  
  // 计算时间差（毫秒）
  const timeDiff = endTime.getTime() - now.getTime();
  
  // 转换为小时
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // 小于12小时：大红色（紧急）
  if (hoursDiff < 12) {
    return 'red';
  }
  
  // 小于24小时：微红色（即将到期）
  if (hoursDiff < 24) {
    return '#ff6b6b'; // 微红色
  }
  
  // 小于48小时：黄色（提醒）
  if (hoursDiff < 48) {
    return 'orange';
  }
  
  // 大于等于48小时：使用原有状态颜色
  return null;
}

/**
 * 获取时间状态描述
 * @param {string} expectedEndTime - 预计结束时间
 * @returns {string} 时间状态描述
 */
export function getTimeStatusDescription(expectedEndTime) {
  if (!expectedEndTime) {
    return '';
  }
  
  const now = new Date();
  const endTime = new Date(expectedEndTime);
  
  // 计算时间差（毫秒）
  const timeDiff = endTime.getTime() - now.getTime();
  
  // 转换为小时
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (hoursDiff < 0) {
    return '已超时';
  } else if (hoursDiff < 12) {
    return '紧急';
  } else if (hoursDiff < 24) {
    return '即将到期';
  } else if (hoursDiff < 48) {
    return '提醒';
  }
  
  return '';
}
