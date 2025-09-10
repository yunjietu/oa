<!-- 数据统计仪表盘 -->
<template>
  <div class="paper-order-dashboard">
    <!-- 统计卡片 -->
    <a-row :gutter="16" class="mb-4">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日订单数"
            :value="statistics.todayOrderCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                昨日: {{ statistics.yesterdayOrderCount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日完成订单数"
            :value="statistics.todayCompletedCount"
            :value-style="{ color: '#52c41a' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                昨日: {{ statistics.yesterdayCompletedCount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日收款金额"
            :value="statistics.todayPaymentAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                昨日: ¥{{ statistics.yesterdayPaymentAmount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="当月收款金额"
            :value="statistics.monthPaymentAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#722ed1' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                上月: ¥{{ statistics.lastMonthPaymentAmount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 退款统计卡片 -->
    <a-row :gutter="16" class="mb-4">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日退款金额"
            :value="statistics.todayRefundAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                昨日: ¥{{ statistics.yesterdayRefundAmount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="当月退款金额"
            :value="statistics.monthRefundAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#ff7875' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                上月: ¥{{ statistics.lastMonthRefundAmount }}
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日净收款"
            :value="netTodayAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: netTodayAmount >= 0 ? '#52c41a' : '#ff4d4f' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                收款-退款
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="当月净收款"
            :value="netMonthAmount"
            :precision="2"
            prefix="¥"
            :value-style="{ color: netMonthAmount >= 0 ? '#52c41a' : '#ff4d4f' }"
          >
            <template #suffix>
              <span class="text-sm text-gray-500">
                收款-退款
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 图表区域 -->
    <a-row :gutter="16">
      <!-- 订单数量对比图表 -->
      <a-col :span="12">
        <a-card title="订单数量对比" :bordered="false">
          <div ref="orderCountChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
      
      <!-- 完成订单数对比图表 -->
      <a-col :span="12">
        <a-card title="完成订单数对比" :bordered="false">
          <div ref="completedCountChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="16" class="mt-4">
      <!-- 收款金额对比图表 -->
      <a-col :span="12">
        <a-card title="收款金额对比" :bordered="false">
          <div ref="paymentAmountChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
      
      <!-- 订单状态分布饼图 -->
      <a-col :span="12">
        <a-card title="订单状态分布" :bordered="false">
          <div ref="statusDistributionChart" style="height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 订单概览 -->
    <a-card title="订单概览" class="mt-4">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic
            title="订单总数"
            :value="statistics.totalOrderCount"
            :value-style="{ color: '#1890ff' }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="进行中订单"
            :value="statistics.processingOrderCount"
            :value-style="{ color: '#fa8c16' }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已完成订单"
            :value="statistics.completedOrderCount"
            :value-style="{ color: '#52c41a' }"
          />
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="待处理订单"
            :value="statistics.pendingOrderCount"
            :value-style="{ color: '#722ed1' }"
          />
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import * as echarts from 'echarts';

// 统计数据
const statistics = reactive({
  todayOrderCount: 0,
  yesterdayOrderCount: 0,
  todayCompletedCount: 0,
  yesterdayCompletedCount: 0,
  todayPaymentAmount: 0,
  yesterdayPaymentAmount: 0,
  monthPaymentAmount: 0,
  lastMonthPaymentAmount: 0,
  todayRefundAmount: 0,
  yesterdayRefundAmount: 0,
  monthRefundAmount: 0,
  lastMonthRefundAmount: 0,
  totalOrderCount: 0,
  processingOrderCount: 0,
  completedOrderCount: 0,
  pendingOrderCount: 0
});

// 计算净收款金额
const netTodayAmount = computed(() => {
  return (statistics.todayPaymentAmount || 0) - (statistics.todayRefundAmount || 0);
});

const netMonthAmount = computed(() => {
  return (statistics.monthPaymentAmount || 0) - (statistics.monthRefundAmount || 0);
});

// 图表引用
const orderCountChart = ref();
const completedCountChart = ref();
const paymentAmountChart = ref();
const statusDistributionChart = ref();

// 图表实例
let orderCountChartInstance = null;
let completedCountChartInstance = null;
let paymentAmountChartInstance = null;
let statusDistributionChartInstance = null;

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await paperOrderApi.getStatistics();
    if (res.data) {
      Object.assign(statistics, res.data);
    }
  } catch (error) {
    message.error('加载统计数据失败');
  }
};

// 初始化订单数量对比图表
const initOrderCountChart = () => {
  orderCountChartInstance = echarts.init(orderCountChart.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['今日', '昨日']
    },
    xAxis: {
      type: 'category',
      data: ['订单数']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '今日',
        type: 'bar',
        data: [statistics.todayOrderCount],
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '昨日',
        type: 'bar',
        data: [statistics.yesterdayOrderCount],
        itemStyle: {
          color: '#d9d9d9'
        }
      }
    ]
  };
  orderCountChartInstance.setOption(option);
};

// 初始化完成订单数对比图表
const initCompletedCountChart = () => {
  completedCountChartInstance = echarts.init(completedCountChart.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['今日', '昨日']
    },
    xAxis: {
      type: 'category',
      data: ['完成订单数']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '今日',
        type: 'bar',
        data: [statistics.todayCompletedCount],
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '昨日',
        type: 'bar',
        data: [statistics.yesterdayCompletedCount],
        itemStyle: {
          color: '#d9d9d9'
        }
      }
    ]
  };
  completedCountChartInstance.setOption(option);
};

// 初始化收款金额对比图表
const initPaymentAmountChart = () => {
  paymentAmountChartInstance = echarts.init(paymentAmountChart.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          result += param.seriesName + ': ¥' + param.value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['今日收款', '今日退款', '昨日收款', '昨日退款']
    },
    xAxis: {
      type: 'category',
      data: ['今日', '昨日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '今日收款',
        type: 'bar',
        data: [statistics.todayPaymentAmount, 0],
        itemStyle: {
          color: '#fa8c16'
        }
      },
      {
        name: '今日退款',
        type: 'bar',
        data: [statistics.todayRefundAmount, 0],
        itemStyle: {
          color: '#ff4d4f'
        }
      },
      {
        name: '昨日收款',
        type: 'bar',
        data: [0, statistics.yesterdayPaymentAmount],
        itemStyle: {
          color: '#d9d9d9'
        }
      },
      {
        name: '昨日退款',
        type: 'bar',
        data: [0, statistics.yesterdayRefundAmount],
        itemStyle: {
          color: '#ff7875'
        }
      }
    ]
  };
  paymentAmountChartInstance.setOption(option);
};

// 初始化订单状态分布饼图
const initStatusDistributionChart = () => {
  statusDistributionChartInstance = echarts.init(statusDistributionChart.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.pendingOrderCount, name: '待处理' },
          { value: statistics.processingOrderCount, name: '进行中' },
          { value: statistics.completedOrderCount, name: '已完成' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  statusDistributionChartInstance.setOption(option);
};

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    initOrderCountChart();
    initCompletedCountChart();
    initPaymentAmountChart();
    initStatusDistributionChart();
  });
};

// 刷新图表数据
const refreshCharts = () => {
  if (orderCountChartInstance) {
    orderCountChartInstance.setOption({
      series: [
        { data: [statistics.todayOrderCount] },
        { data: [statistics.yesterdayOrderCount] }
      ]
    });
  }
  
  if (completedCountChartInstance) {
    completedCountChartInstance.setOption({
      series: [
        { data: [statistics.todayCompletedCount] },
        { data: [statistics.yesterdayCompletedCount] }
      ]
    });
  }
  
  if (paymentAmountChartInstance) {
    paymentAmountChartInstance.setOption({
      series: [
        { data: [statistics.todayPaymentAmount] },
        { data: [statistics.yesterdayPaymentAmount] }
      ]
    });
  }
  
  if (statusDistributionChartInstance) {
    statusDistributionChartInstance.setOption({
      series: [{
        data: [
          { value: statistics.pendingOrderCount, name: '待处理' },
          { value: statistics.processingOrderCount, name: '进行中' },
          { value: statistics.completedOrderCount, name: '已完成' }
        ]
      }]
    });
  }
};

// 窗口大小变化时重新调整图表
const handleResize = () => {
  if (orderCountChartInstance) orderCountChartInstance.resize();
  if (completedCountChartInstance) completedCountChartInstance.resize();
  if (paymentAmountChartInstance) paymentAmountChartInstance.resize();
  if (statusDistributionChartInstance) statusDistributionChartInstance.resize();
};

onMounted(async () => {
  await loadStatistics();
  initCharts();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  // 定时刷新数据
  setInterval(async () => {
    await loadStatistics();
    refreshCharts();
  }, 30000); // 30秒刷新一次
});
</script>

<style scoped>
.paper-order-dashboard {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.text-sm {
  font-size: 12px;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
