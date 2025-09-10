<!-- 管理员订单管理页面 -->
<template>
  <div class="paper-order-admin">
    <a-card :bordered="false">
      <!-- 查询表单 -->
      <a-form :model="queryForm" layout="inline" @submit="handleQuery">
        <a-form-item label="订单编号">
          <a-input v-model:value="queryForm.orderNo" placeholder="请输入订单编号" />
        </a-form-item>
        <a-form-item label="论文名称">
          <a-input v-model:value="queryForm.paperName" placeholder="请输入论文名称" />
        </a-form-item>
        <a-form-item label="任务类型">
          <a-select v-model:value="queryForm.taskType" placeholder="请选择任务类型" allowClear>
            <a-select-option v-for="option in TASK_TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="任务状态">
          <a-select v-model:value="queryForm.taskStatus" placeholder="请选择任务状态" allowClear>
            <a-select-option v-for="option in TASK_STATUS_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人">
          <a-select v-model:value="queryForm.assigneeId" placeholder="请选择负责人" allowClear>
            <a-select-option v-for="user in userList" :key="user.employeeId" :value="user.employeeId">
              {{ user.actualName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button @click="handleReset" style="margin-left: 8px;">重置</a-button>
        </a-form-item>
      </a-form>
      
      <!-- 操作按钮 -->
      <div class="table-operator">
        <a-button type="primary" @click="handleAdd">
          <template #icon><plus-outlined /></template>
          新增订单
        </a-button>
        <a-button @click="handleBatchAssign" :disabled="!selectedRowKeys.length" style="margin-left: 8px;">
          <template #icon><user-outlined /></template>
          批量分配
        </a-button>
        <a-button @click="handleShowEmployeeStatistics" style="margin-left: 8px;">
          <template #icon><bar-chart-outlined /></template>
          员工统计
        </a-button>
      </div>
      
      <!-- 数据表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :row-selection="rowSelection"
        :row-key="record => record.orderId"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'taskType'">
            {{ TASK_TYPE[record.taskType] }}
          </template>
          <template v-if="column.key === 'taskStatus'">
            <a-tag :color="getDisplayStatusColor(record)">
              {{ getDisplayStatusText(record) }}
              <span v-if="getTimeStatusDescription(record.expectedEndTime)" style="margin-left: 4px;">
                ({{ getTimeStatusDescription(record.expectedEndTime) }})
              </span>
            </a-tag>
          </template>
          <template v-if="column.key === 'subject'">
            <a-tag :color="SUBJECT_COLOR_MAP[record.subject]">
              {{ SUBJECT[record.subject] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'expectedAmount'">
            ¥{{ record.expectedAmount }}
          </template>
          <template v-if="column.key === 'actualAmount'">
            ¥{{ record.actualAmount }}
          </template>
          <template v-if="column.key === 'unpaidAmount'">
            <span :class="{ 'text-red': record.unpaidAmount > 0 && record.paymentStatus !== 1 }">
              <template v-if="record.paymentStatus === 1">
                ¥{{ record.unpaidAmount }}（已补）
              </template>
              <template v-else>
                ¥{{ record.unpaidAmount }}
              </template>
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleEdit(record)">编辑</a>
              <a @click="handleAssign(record)">分配</a>
              <a @click="handleViewDetail(record)">详情</a>
              <a @click="handleConfirmPayment(record)" v-if="shouldShowPaymentButton(record)">已补尾款</a>
              <a @click="handleRefund(record)" v-if="shouldShowRefundButton(record)">退款</a>
              <a-popconfirm title="确定删除吗？" @confirm="handleDelete(record.orderId)">
                <a>删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 订单表单弹窗 -->
    <PaperOrderFormModal ref="formModal" @success="handleQuery" />
    
    <!-- 订单分配弹窗 -->
    <PaperOrderAssignModal ref="assignModal" @success="handleQuery" />
    
    <!-- 订单详情弹窗 -->
    <PaperOrderDetailModal ref="detailModal" />
    
    <!-- 尾款支付确认弹窗 -->
    <PaperOrderPaymentModal ref="paymentModal" @success="handleQuery" />
    
    <!-- 退款申请弹窗 -->
    <PaperOrderRefundModal ref="refundModal" @success="handleQuery" />
    
    <!-- 员工统计弹窗 -->
    <EmployeeStatisticsModal v-model:open="employeeStatisticsVisible" @close="handleCloseEmployeeStatistics" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import { 
  TASK_TYPE, 
  TASK_STATUS, 
  REFUND_STATUS,
  SUBJECT, 
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  STATUS_COLOR_MAP,
  REFUND_STATUS_COLOR_MAP,
  SUBJECT_COLOR_MAP
} from '/@/constants/oa/paper-order-const';
import { getTimeBasedStatusColor, getTimeStatusDescription } from '/@/utils/time-status-util';
import PaperOrderFormModal from '../components/paper-order-form-modal.vue';
import PaperOrderAssignModal from '../components/paper-order-assign-modal.vue';
import PaperOrderDetailModal from '../components/paper-order-detail-modal.vue';
import PaperOrderPaymentModal from '../components/paper-order-payment-modal.vue';
import PaperOrderRefundModal from '../components/paper-order-refund-modal.vue';
import EmployeeStatisticsModal from '../components/employee-statistics-modal.vue';

// 查询表单
const queryForm = reactive({
  orderNo: '',
  paperName: '',
  taskType: undefined,
  taskStatus: undefined,
  assigneeId: undefined,
  pageNum: 1,
  pageSize: 10
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);
const userList = ref([]);

// 员工统计弹窗
const employeeStatisticsVisible = ref(false);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
});

// 表格列配置
const columns = [
  { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
  { title: '论文名称', dataIndex: 'paperName', key: 'paperName', width: 200 },
  { title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 100 },
  { title: '任务状态', dataIndex: 'taskStatus', key: 'taskStatus', width: 100 },
  { title: '学科', dataIndex: 'subject', key: 'subject', width: 80 },
  { title: '论文字数', dataIndex: 'wordCount', key: 'wordCount', width: 100 },
  { title: '负责人', dataIndex: 'assigneeName', key: 'assigneeName', width: 100 },
  { title: '总额', dataIndex: 'expectedAmount', key: 'expectedAmount', width: 100 },
  { title: '定金', dataIndex: 'actualAmount', key: 'actualAmount', width: 100 },
  { title: '尾款', dataIndex: 'unpaidAmount', key: 'unpaidAmount', width: 100 },
  { title: '接单时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '预计结束时间', dataIndex: 'expectedEndTime', key: 'expectedEndTime', width: 150 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
];

// 行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
};

// 查询数据
const handleQuery = async () => {
  loading.value = true;
  try {
    const res = await paperOrderApi.adminQuery(queryForm);
    if (res.data) {
      // 对数据进行排序：红色状态（已超时）的订单置顶
      const sortedList = res.data.list.sort((a, b) => {
        const aColor = getTimeBasedStatusColor(a.expectedEndTime, a.taskStatus);
        const bColor = getTimeBasedStatusColor(b.expectedEndTime, b.taskStatus);
        
        // 如果a是红色状态，b不是，则a排在前面
        if (aColor === 'red' && bColor !== 'red') {
          return -1;
        }
        // 如果b是红色状态，a不是，则b排在前面
        if (bColor === 'red' && aColor !== 'red') {
          return 1;
        }
        // 如果都是红色状态或都不是红色状态，按创建时间倒序排列
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      tableData.value = sortedList;
      pagination.total = res.data.total;
    }
  } catch (error) {
    message.error('查询失败');
  } finally {
    loading.value = false;
  }
};

// 重置查询
const handleReset = () => {
  Object.assign(queryForm, {
    orderNo: '',
    paperName: '',
    taskType: undefined,
    taskStatus: undefined,
    assigneeId: undefined,
    pageNum: 1,
    pageSize: 10
  });
  handleQuery();
};

// 新增订单
const formModal = ref();
const handleAdd = () => {
  formModal.value.open();
};

// 编辑订单
const handleEdit = (record) => {
  if (isRefunded(record)) {
    message.warning('订单已退款，无法操作');
    return;
  }
  formModal.value.open(record);
};

// 分配订单
const assignModal = ref();
const handleAssign = (record) => {
  if (isRefunded(record)) {
    message.warning('订单已退款，无法操作');
    return;
  }
  assignModal.value.show(record);
};

// 批量分配
const handleBatchAssign = () => {
  // 检查选中的订单中是否有已退款的
  const refundedOrders = selectedRowKeys.value.filter(orderId => {
    const record = tableData.value.find(item => item.orderId === orderId);
    return record && isRefunded(record);
  });
  
  if (refundedOrders.length > 0) {
    message.warning('选中的订单中包含已退款的订单，无法操作');
    return;
  }
  
  assignModal.value.openBatch(selectedRowKeys.value);
};

// 查看详情
const detailModal = ref();
const handleViewDetail = (record) => {
  detailModal.value.show(record.orderId);
};

// 尾款支付确认
const paymentModal = ref();
const handleConfirmPayment = (record) => {
  if (isRefunded(record)) {
    message.warning('订单已退款，无法操作');
    return;
  }
  paymentModal.value.show(record);
};

// 退款申请
const refundModal = ref();
const handleRefund = (record) => {
  if (isRefunded(record)) {
    message.warning('订单已退款，无法操作');
    return;
  }
  refundModal.value.show(record);
};

// 删除订单
const handleDelete = async (orderId) => {
  // 找到对应的订单记录
  const record = tableData.value.find(item => item.orderId === orderId);
  if (record && isRefunded(record)) {
    message.warning('订单已退款，无法操作');
    return;
  }
  
  try {
    await paperOrderApi.delete(orderId);
    message.success('删除成功');
    handleQuery();
  } catch (error) {
    message.error('删除失败');
  }
};

// 表格变化
const handleTableChange = (pag) => {
  queryForm.pageNum = pag.current;
  queryForm.pageSize = pag.pageSize;
  handleQuery();
};

// 判断是否显示"已补尾款"按钮
const shouldShowPaymentButton = (record) => {
  // 允许在"进行中"(2)和"已完成"(3)状态时确认尾款，且有未付尾款且尾款未补时才显示
  return (record.taskStatus === 2 || record.taskStatus === 3) && 
         record.unpaidAmount > 0 && 
         record.paymentStatus !== 1;
};

// 判断是否显示"退款"按钮
const shouldShowRefundButton = (record) => {
  // 只有已支付定金的订单才显示退款按钮
  return record.actualAmount > 0 && record.taskStatus !== 4;
};

// 判断订单是否已退款
const isRefunded = (record) => {
  return record.refundStatus === 2; // 2表示已退款
};

// 获取显示的状态文本（优先显示退款状态）
const getDisplayStatusText = (record) => {
  // 如果有退款状态且不是"无退款"，优先显示退款状态
  if (record.refundStatus && record.refundStatus !== 0) {
    return REFUND_STATUS[record.refundStatus];
  }
  // 否则显示任务状态
  return TASK_STATUS[record.taskStatus];
};

// 获取显示的状态颜色（优先显示退款状态）
const getDisplayStatusColor = (record) => {
  // 如果有退款状态且不是"无退款"，优先显示退款状态颜色
  if (record.refundStatus && record.refundStatus !== 0) {
    return REFUND_STATUS_COLOR_MAP[record.refundStatus];
  }
  // 否则显示任务状态颜色
  return getTimeBasedStatusColor(record.expectedEndTime, record.taskStatus) || STATUS_COLOR_MAP[record.taskStatus];
};

// 加载用户列表
const loadUserList = async () => {
  try {
    const res = await paperOrderApi.getDistinctAssignees();
    if (res.data) {
      userList.value = res.data.map(item => ({
        employeeId: item.assigneeId,
        actualName: item.assigneeName
      }));
    }
  } catch (error) {
    console.error('加载负责人列表失败', error);
    // 如果获取失败，使用空列表
    userList.value = [];
  }
};

// 员工统计相关方法
const handleShowEmployeeStatistics = () => {
  employeeStatisticsVisible.value = true;
};

const handleCloseEmployeeStatistics = () => {
  employeeStatisticsVisible.value = false;
};

onMounted(() => {
  handleQuery();
  loadUserList();
});
</script>

<style scoped>
.paper-order-admin {
  padding: 20px;
}

.table-operator {
  margin: 16px 0;
}

.text-red {
  color: #ff4d4f;
}
</style>
