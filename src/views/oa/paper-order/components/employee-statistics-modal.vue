<!-- 员工统计弹窗组件 -->
<template>
  <a-modal
    v-model:open="visible"
    title="论文订单处理员统计"
    width="1200px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="employee-statistics">
      <!-- 统计概览 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总员工数"
              :value="totalEmployees"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="有接单员工数"
              :value="activeEmployees"
              :value-style="{ color: '#52c41a' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总接单数"
              :value="totalOrders"
              :value-style="{ color: '#faad14' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="平均接单数"
              :value="averageOrders"
              :precision="1"
              :value-style="{ color: '#722ed1' }"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- 筛选条件 -->
      <a-form :model="queryForm" layout="inline" style="margin-bottom: 16px;">
        <a-form-item label="员工姓名">
          <a-input v-model:value="queryForm.employeeName" placeholder="请输入员工姓名" />
        </a-form-item>
        <a-form-item label="日期筛选">
          <a-select v-model:value="queryForm.dateRange" placeholder="请选择日期范围" allowClear style="width: 150px;">
            <a-select-option value="today">今天</a-select-option>
            <a-select-option value="yesterday">昨天</a-select-option>
            <a-select-option value="thisWeek">本周</a-select-option>
            <a-select-option value="lastWeek">上周</a-select-option>
            <a-select-option value="thisMonth">本月</a-select-option>
            <a-select-option value="lastMonth">上月</a-select-option>
            <a-select-option value="custom">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="queryForm.dateRange === 'custom'" label="开始日期">
          <a-date-picker v-model:value="queryForm.startDate" placeholder="选择开始日期" style="width: 150px;" />
        </a-form-item>
        <a-form-item v-if="queryForm.dateRange === 'custom'" label="结束日期">
          <a-date-picker v-model:value="queryForm.endDate" placeholder="选择结束日期" style="width: 150px;" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button @click="handleReset" style="margin-left: 8px;">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 数据表格 -->
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :row-key="record => record.employeeId"
        @change="handleTableChange"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'employeeName'">
            <a-button type="link" @click="handleViewEmployeeDetail(record)">
              {{ record.employeeName }}
            </a-button>
          </template>
          <template v-if="column.key === 'completionRate'">
            <a-progress 
              :percent="Number(record.completionRate) || 0" 
              :stroke-color="getCompletionRateColor(Number(record.completionRate) || 0)"
              size="small"
            />
          </template>
          <template v-if="column.key === 'totalOrderAmount'">
            <span>¥{{ (Number(record.totalOrderAmount) || 0).toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'netAmount'">
            <span>¥{{ (Number(record.netAmount) || 0).toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewEmployeeDetail(record)">
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';

// 组件属性
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

// 组件事件
const emit = defineEmits(['update:open', 'close']);

// 响应式数据
const visible = ref(false);
const loading = ref(false);
const tableData = ref([]);

// 查询表单
const queryForm = reactive({
  employeeName: '',
  dateRange: 'today', // 默认选择今天
  startDate: null,
  endDate: null
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条记录，第 ${range[0]}-${range[1]} 条`
});

// 表格列配置
const columns = [
  {
    title: '员工姓名',
    dataIndex: 'employeeName',
    key: 'employeeName',
    width: 120,
    fixed: 'left'
  },
  {
    title: '登录名',
    dataIndex: 'loginName',
    key: 'loginName',
    width: 120
  },
  {
    title: '总接单数',
    dataIndex: 'totalOrderCount',
    key: 'totalOrderCount',
    width: 100,
    sorter: true
  },
  {
    title: '待处理',
    dataIndex: 'pendingOrderCount',
    key: 'pendingOrderCount',
    width: 100,
    sorter: true
  },
  {
    title: '进行中',
    dataIndex: 'processingOrderCount',
    key: 'processingOrderCount',
    width: 100,
    sorter: true
  },
  {
    title: '已完成',
    dataIndex: 'completedOrderCount',
    key: 'completedOrderCount',
    width: 100,
    sorter: true
  },
  {
    title: '完成率',
    dataIndex: 'completionRate',
    key: 'completionRate',
    width: 120
  },
  {
    title: '总金额',
    dataIndex: 'totalOrderAmount',
    key: 'totalOrderAmount',
    width: 120,
    sorter: true
  },
  {
    title: '净收款',
    dataIndex: 'netAmount',
    key: 'netAmount',
    width: 120,
    sorter: true
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
];

// 计算属性
const totalEmployees = computed(() => tableData.value.length);
const activeEmployees = computed(() => tableData.value.filter(item => item.totalOrderCount > 0).length);
const totalOrders = computed(() => tableData.value.reduce((sum, item) => sum + (item.totalOrderCount || 0), 0));
const averageOrders = computed(() => {
  const activeCount = activeEmployees.value;
  return activeCount > 0 ? (totalOrders.value / activeCount).toFixed(1) : 0;
});

// 监听props变化
watch(() => props.open, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    loadData();
  }
});

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:open', newVal);
});

// 方法
const loadData = async () => {
  try {
    loading.value = true;
    console.log('开始加载论文订单处理员统计数据...');
    
    // 构建查询参数
    const params = {};
    if (queryForm.dateRange && queryForm.dateRange !== 'custom') {
      params.dateRange = queryForm.dateRange;
    } else if (queryForm.dateRange === 'custom') {
      if (queryForm.startDate) {
        params.startDate = queryForm.startDate.format('YYYY-MM-DD');
      }
      if (queryForm.endDate) {
        params.endDate = queryForm.endDate.format('YYYY-MM-DD');
      }
    }
    
    console.log('查询参数:', params);
    const response = await paperOrderApi.getPaperOrderProcessorStatistics(params);
    console.log('API响应:', response);
    if (response.data) {
      console.log('论文订单处理员统计数据:', response.data);
      // 确保数字字段是数字类型
      const processedData = response.data.map(item => ({
        ...item,
        completionRate: Number(item.completionRate) || 0,
        totalOrderAmount: Number(item.totalOrderAmount) || 0,
        netAmount: Number(item.netAmount) || 0,
        paidAmount: Number(item.paidAmount) || 0,
        unpaidAmount: Number(item.unpaidAmount) || 0,
        refundAmount: Number(item.refundAmount) || 0,
        todayOrderAmount: Number(item.todayOrderAmount) || 0,
        monthOrderAmount: Number(item.monthOrderAmount) || 0,
        averageOrderAmount: Number(item.averageOrderAmount) || 0
      }));
      tableData.value = processedData;
      pagination.total = processedData.length;
    } else {
      console.warn('API返回数据为空');
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('加载论文订单处理员统计数据失败:', error);
    message.error('加载论文订单处理员统计数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};


const handleQuery = () => {
  // 这里可以实现前端筛选逻辑
  // 或者调用后端接口进行筛选
  loadData();
};

const handleReset = () => {
  queryForm.employeeName = '';
  queryForm.dateRange = 'today'; // 重置为今天
  queryForm.startDate = null;
  queryForm.endDate = null;
  loadData();
};

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  // 这里可以实现排序逻辑
};

const handleViewEmployeeDetail = (record) => {
  // 可以打开员工详情弹窗或跳转到员工详情页面
  message.info(`查看员工 ${record.employeeName} 的详细统计信息`);
};

const getCompletionRateColor = (rate) => {
  if (rate >= 80) return '#52c41a';
  if (rate >= 60) return '#faad14';
  return '#ff4d4f';
};

const getProcessingDaysColor = (days) => {
  if (days <= 3) return '#52c41a';
  if (days <= 7) return '#faad14';
  return '#ff4d4f';
};

const handleCancel = () => {
  visible.value = false;
  emit('close');
};
</script>

<style scoped>
.employee-statistics {
  padding: 16px 0;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}
</style>
