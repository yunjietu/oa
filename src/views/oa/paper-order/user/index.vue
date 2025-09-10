<!-- 用户订单处理页面 -->
<template>
  <div class="paper-order-user">
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
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button @click="handleReset" style="margin-left: 8px;">重置</a-button>
        </a-form-item>
      </a-form>
      
      <!-- 数据表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :row-key="record => record.orderId"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'subject'">
            {{ SUBJECT[record.subject] || '-' }}
          </template>
          <template v-if="column.key === 'wordCount'">
            {{ record.wordCount ? record.wordCount + '字' : '-' }}
          </template>
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
          <template v-if="column.key === 'expectedAmount'">
            ¥{{ record.expectedAmount }}
          </template>
          <template v-if="column.key === 'expectedStartTime'">
            {{ record.expectedStartTime ? formatDateTime(record.expectedStartTime) : '-' }}
          </template>
          <template v-if="column.key === 'expectedEndTime'">
            {{ record.expectedEndTime ? formatDateTime(record.expectedEndTime) : '-' }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleViewDetail(record)">详情</a>
              <a @click="handleUpdateStatus(record)" v-if="record.taskStatus !== 3">
                更新状态
              </a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 订单详情弹窗 -->
    <PaperOrderDetailModal ref="detailModal" />
    
    <!-- 状态更新弹窗 -->
    <PaperOrderStatusModal ref="statusModal" @success="handleQuery" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import { 
  TASK_TYPE, 
  TASK_STATUS, 
  REFUND_STATUS,
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  STATUS_COLOR_MAP,
  REFUND_STATUS_COLOR_MAP,
  SUBJECT
} from '/@/constants/oa/paper-order-const';
import { getTimeBasedStatusColor, getTimeStatusDescription } from '/@/utils/time-status-util';
import PaperOrderDetailModal from '../components/paper-order-detail-modal.vue';
import PaperOrderStatusModal from '../components/paper-order-status-modal.vue';
import { formatDateTime } from '/@/utils/date-util';

// 查询表单
const queryForm = reactive({
  orderNo: '',
  paperName: '',
  taskType: undefined,
  taskStatus: undefined,
  pageNum: 1,
  pageSize: 10
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);

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
  { title: '学科', dataIndex: 'subject', key: 'subject', width: 120 },
  { title: '论文字数', dataIndex: 'wordCount', key: 'wordCount', width: 100 },
  { title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 100 },
  { title: '任务状态', dataIndex: 'taskStatus', key: 'taskStatus', width: 100 },
  { title: '预计结束时间', dataIndex: 'expectedEndTime', key: 'expectedEndTime', width: 150 },
  { title: '总额', dataIndex: 'expectedAmount', key: 'expectedAmount', width: 100 },
  { title: '接单时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
];

// 查询数据
const handleQuery = async () => {
  loading.value = true;
  try {
    const res = await paperOrderApi.userQuery(queryForm);
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
    pageNum: 1,
    pageSize: 10
  });
  handleQuery();
};

// 查看详情
const detailModal = ref();
const handleViewDetail = (record) => {
  detailModal.value.show(record.orderId);
};

// 更新状态
const statusModal = ref();
const handleUpdateStatus = (record) => {
  if (record.refundStatus === 2) {
    message.warning('订单已退款，无法操作');
    return;
  }
  statusModal.value.show(record);
};

// 表格变化
const handleTableChange = (pag) => {
  queryForm.pageNum = pag.current;
  queryForm.pageSize = pag.pageSize;
  handleQuery();
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

// 轮询检查新订单
let pollTimer = null;
const lastOrderCount = ref(0);

const startPolling = () => {
  // 每30秒检查一次新订单
  pollTimer = setInterval(async () => {
    try {
      const res = await paperOrderApi.userQuery({
        ...queryForm,
        pageNum: 1,
        pageSize: 1 // 只获取总数
      });
      
      if (res.ok && res.data) {
        const currentCount = res.data.total || 0;
        
        // 如果订单数量增加，说明有新订单分配
        if (currentCount > lastOrderCount.value && lastOrderCount.value > 0) {
          const newOrderCount = currentCount - lastOrderCount.value;
          
          // 刷新页面数据
          handleQuery();
        }
        
        lastOrderCount.value = currentCount;
      }
    } catch (error) {
      console.error('轮询检查新订单失败:', error);
    }
  }, 30000); // 30秒轮询一次
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};


onMounted(() => {
  handleQuery();
  // 初始化订单数量
  setTimeout(() => {
    lastOrderCount.value = pagination.total;
    startPolling();
  }, 1000);
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.paper-order-user {
  padding: 20px;
}
</style>
