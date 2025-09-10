// paper-order-api.js
/*
 * 论文订单管理API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01 00:00:00
 * @Wechat:    zhuoda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

import { getRequest, postRequest } from '/@/lib/axios';

export const paperOrderApi = {
  // ==================== 管理员接口 ====================
  
  /**
   * 管理员分页查询订单
   */
  adminQuery: (params) => {
    return postRequest('/paper-order/admin/query', params);
  },
  
  /**
   * 新增订单
   */
  add: (params) => {
    return postRequest('/paper-order/add', params);
  },
  
  /**
   * 更新订单
   */
  update: (params) => {
    return postRequest('/paper-order/update', params);
  },
  
  /**
   * 删除订单
   */
  delete: (orderId) => {
    return getRequest(`/paper-order/delete/${orderId}`);
  },
  
  /**
   * 分配订单
   */
  assignOrder: (params) => {
    return postRequest('/paper-order/assign', params);
  },
  
  /**
   * 批量分配订单
   */
  batchAssignOrder: (params) => {
    return postRequest('/paper-order/batch-assign', params);
  },
  
  /**
   * 获取订单详情
   */
  getDetail: (orderId) => {
    return getRequest(`/paper-order/detail/${orderId}`);
  },
  
  /**
   * 获取所有已分配订单的负责人列表
   */
  getDistinctAssignees: () => {
    return getRequest('/paper-order/assignees');
  },
  
  // ==================== 用户接口 ====================
  
  /**
   * 用户分页查询订单
   */
  userQuery: (params) => {
    return postRequest('/paper-order/user/query', params);
  },
  
  /**
   * 更新订单状态
   */
  updateStatus: (params) => {
    return postRequest('/paper-order/status/update', params);
  },
  
  /**
   * 用户获取订单详情
   */
  getUserDetail: (orderId) => {
    return getRequest(`/paper-order/user/detail/${orderId}`);
  },
  
  // ==================== 支付相关接口 ====================
  
  /**
   * 确认已补尾款
   */
  confirmPayment: (params) => {
    return postRequest('/paper-order/payment/confirm', params);
  },
  
  /**
   * 获取最大退款金额
   */
  getMaxRefundAmount: (orderId) => {
    return getRequest(`/paper-order/refund/max-amount/${orderId}`);
  },
  
  /**
   * 申请退款
   */
  applyRefund: (params) => {
    return postRequest('/paper-order/refund/apply', params);
  },
  
  /**
   * 确认退款
   */
  confirmRefund: (params) => {
    return postRequest('/paper-order/refund/confirm', params);
  },
  
  // ==================== 统计接口 ====================
  
  /**
   * 获取订单统计信息
   */
  getStatistics: () => {
    return getRequest('/paper-order/statistics');
  },
  
  /**
   * 获取员工接单统计列表
   */
  getEmployeeOrderStatistics: () => {
    return getRequest('/paper-order/employee-statistics');
  },
  
  /**
   * 根据员工ID获取员工接单统计
   */
  getEmployeeOrderStatisticsById: (employeeId) => {
    return getRequest(`/paper-order/employee-statistics/${employeeId}`);
  },
  
  /**
   * 获取论文订单处理员统计
   */
  getPaperOrderProcessorStatistics: (params = {}) => {
    return getRequest('/paper-order/processor-statistics', params);
  }
};
