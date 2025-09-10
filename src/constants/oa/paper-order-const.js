// paper-order-const.js
/*
 * 论文订单管理常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01 00:00:00
 * @Wechat:    zhuoda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

// 任务类型
export const TASK_TYPE = {
  1: '论文写作',
  2: '论文修改', 
  3: '论文润色',
  4: '论文翻译'
};

// 任务状态
export const TASK_STATUS = {
  1: '待处理',
  2: '进行中',
  3: '已完成',
  4: '已取消'
};

// 退款状态
export const REFUND_STATUS = {
  0: '无退款',
  1: '申请退款',
  2: '已退款'
};

// 学科
export const SUBJECT = {
  1: '文科',
  2: '理科'
};

// 收款方式
export const PAYMENT_METHOD = {
  1: '支付宝',
  2: '微信',
  3: '银行转账',
  4: '现金'
};

// 任务类型选项
export const TASK_TYPE_OPTIONS = [
  { label: '论文写作', value: 1 },
  { label: '论文修改', value: 2 },
  { label: '论文润色', value: 3 },
  { label: '论文翻译', value: 4 }
];

// 任务状态选项
export const TASK_STATUS_OPTIONS = [
  { label: '待处理', value: 1 },
  { label: '进行中', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

// 学科选项
export const SUBJECT_OPTIONS = [
  { label: '文科', value: 1 },
  { label: '理科', value: 2 }
];

// 收款方式选项
export const PAYMENT_METHOD_OPTIONS = [
  { label: '支付宝', value: 1 },
  { label: '微信', value: 2 },
  { label: '银行转账', value: 3 },
  { label: '现金', value: 4 }
];

// 状态颜色映射
export const STATUS_COLOR_MAP = {
  1: 'orange',  // 待处理
  2: 'blue',    // 进行中
  3: 'green',   // 已完成
  4: 'red'      // 已取消
};

// 退款状态颜色映射
export const REFUND_STATUS_COLOR_MAP = {
  0: 'default',  // 无退款
  1: 'orange',   // 申请退款
  2: 'red'       // 已退款
};

// 学科颜色映射
export const SUBJECT_COLOR_MAP = {
  1: 'blue',     // 文科
  2: 'green'     // 理科
};
