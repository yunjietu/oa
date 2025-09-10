<template>
  <a-modal
    v-model:open="visible"
    title="订单详情"
    :width="800"
    :footer="null"
  >
    <div class="order-detail">
      <!-- 调试信息 -->
      <div v-if="!orderDetail" style="color: red; padding: 20px;">
        订单详情数据为空，请检查控制台错误信息
      </div>
      <a-descriptions v-if="orderDetail" :column="3" bordered>
        <a-descriptions-item label="订单编号">
          {{ orderDetail.orderNo }}
        </a-descriptions-item>
        <a-descriptions-item label="论文名称">
          {{ orderDetail.paperName }}
        </a-descriptions-item>
        <a-descriptions-item label="任务类型">
          <a-tag :color="getTaskTypeColor(orderDetail.taskType)">
            {{ getTaskTypeText(orderDetail.taskType) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="任务状态">
          <a-tag :color="getStatusColor(orderDetail.taskStatus)">
            {{ getStatusText(orderDetail.taskStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="预计结束时间">
          {{ formatDateTime(orderDetail.expectedEndTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ orderDetail.assigneeName || '未分配' }}
        </a-descriptions-item>
        <a-descriptions-item label="总额">
          ¥{{ orderDetail.expectedAmount || '0.00' }}
        </a-descriptions-item>
        <a-descriptions-item label="定金">
          ¥{{ orderDetail.actualAmount || '0.00' }}
        </a-descriptions-item>
        <a-descriptions-item label="尾款">
          <span :class="{ 'text-red': orderDetail.unpaidAmount > 0 && orderDetail.paymentStatus !== 1 }">
            <template v-if="orderDetail.paymentStatus === 1">
              ¥{{ orderDetail.unpaidAmount || '0.00' }}（已补）
            </template>
            <template v-else>
              ¥{{ orderDetail.unpaidAmount || '0.00' }}
            </template>
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="退款金额">
          <span v-if="orderDetail.refundAmount && orderDetail.refundAmount > 0" class="text-red">
            ¥{{ orderDetail.refundAmount }}
          </span>
          <span v-else>¥0.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="剩余金额">
          <span v-if="orderDetail.remainingAmount && orderDetail.remainingAmount > 0" class="text-green">
            ¥{{ orderDetail.remainingAmount }}
          </span>
          <span v-else-if="orderDetail.remainingAmount && orderDetail.remainingAmount < 0" class="text-red">
            ¥{{ orderDetail.remainingAmount }}
          </span>
          <span v-else>¥0.00</span>
        </a-descriptions-item>
        <a-descriptions-item label="接单时间">
          {{ formatDateTime(orderDetail.createTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ formatDateTime(orderDetail.updateTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="任务描述" :span="3">
          {{ orderDetail.taskDescription || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="3">
          {{ orderDetail.remark || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="附件" :span="3">
          <div v-if="orderDetail.attachmentUrl && orderDetail.attachmentName" class="attachment-section">
            <div class="attachment-item">
              <a-icon type="file" class="file-icon" />
              <span class="file-name">{{ orderDetail.attachmentName }}</span>
              <a-button 
                type="link" 
                size="small" 
                @click="viewFile(orderDetail)"
                class="view-btn"
              >
                查看
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                @click="downloadFile(orderDetail)"
                class="download-btn"
              >
                下载
              </a-button>
            </div>
          </div>
          <span v-else class="no-attachment">无附件</span>
        </a-descriptions-item>
      </a-descriptions>
      
       <!-- 进度记录 -->
       <div v-if="orderDetail && orderDetail.progressRecords && orderDetail.progressRecords.length > 0" class="progress-section">
         <h4>进度记录</h4>
         <a-timeline>
           <a-timeline-item
             v-for="record in orderDetail.progressRecords"
             :key="record.id"
             :color="getStatusColor(record.status)"
           >
             <div class="progress-item">
               <div class="progress-header">
                 <span class="status">{{ getStatusText(record.status) }}</span>
                 <span class="time">{{ formatDateTime(record.createTime) }}</span>
               </div>
               <div class="progress-content">
                 <p><strong>操作人：</strong>{{ record.operatorName }}</p>
                 <p v-if="record.remark"><strong>备注：</strong>{{ record.remark }}</p>
               </div>
             </div>
           </a-timeline-item>
         </a-timeline>
       </div>
    </div>
    
    <!-- 文件预览模态框 -->
    <FilePreviewModal ref="filePreviewModalRef" />
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import { fileApi } from '/@/api/support/file-api';
import { formatDateTime } from '/@/utils/date-util';
import { message } from 'ant-design-vue';
import { 
  TASK_TYPE, 
  TASK_STATUS, 
  TASK_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  STATUS_COLOR_MAP
} from '/@/constants/oa/paper-order-const';
import FilePreviewModal from '/@/components/support/file-preview-modal/index.vue';

const visible = ref(false);
const orderDetail = ref(null);
const filePreviewModalRef = ref();

// 获取任务类型文本
const getTaskTypeText = (type) => {
  const option = TASK_TYPE_OPTIONS.find(item => item.value === type);
  return option ? option.label : '未知';
};

// 获取状态文本
const getStatusText = (status) => {
  const option = TASK_STATUS_OPTIONS.find(item => item.value === status);
  return option ? option.label : '未知';
};

// 获取任务类型颜色
const getTaskTypeColor = (type) => {
  const colorMap = {
    1: 'blue',    // 论文写作
    2: 'orange',  // 论文修改
    3: 'green',   // 论文润色
    4: 'purple'   // 论文翻译
  };
  return colorMap[type] || 'default';
};

// 获取状态颜色
const getStatusColor = (status) => {
  return STATUS_COLOR_MAP[status] || 'default';
};

// 查看文件
const viewFile = (orderDetail) => {
  const fileItem = {
    fileKey: orderDetail.attachmentUrl,
    fileName: orderDetail.attachmentName,
    fileUrl: orderDetail.attachmentUrl,
    fileType: getFileExtension(orderDetail.attachmentName)
  };
  filePreviewModalRef.value.showPreview(fileItem);
};

// 下载文件
const downloadFile = async (orderDetail) => {
  try {
    // 优先使用attachmentFileKey，如果没有则从URL中提取
    let fileKey = orderDetail.attachmentFileKey;
    if (!fileKey && orderDetail.attachmentUrl) {
      // 从文件URL中提取fileKey（兼容旧数据）
      fileKey = orderDetail.attachmentUrl.split('/').pop();
    }
    
    if (!fileKey) {
      message.error('文件信息错误，无法下载');
      return;
    }
    
    console.log('开始下载文件:', { fileKey, fileName: orderDetail.attachmentName });
    
    // 调用文件管理模块的下载API
    await fileApi.downLoadFile(fileKey);
    
    message.success('文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error);
    message.error('文件下载失败：' + (error.message || '未知错误'));
  }
};

// 获取文件扩展名
const getFileExtension = (fileName) => {
  if (!fileName) return '';
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';
};

// 显示模态框
const show = async (orderId) => {
  visible.value = true;
  try {
    console.log('正在获取订单详情，订单ID:', orderId);
    const res = await paperOrderApi.getDetail(orderId);
    console.log('订单详情API响应:', res);
    orderDetail.value = res.data;
    console.log('订单详情数据:', orderDetail.value);
  } catch (error) {
    console.error('获取订单详情失败:', error);
  }
};

// 暴露方法
defineExpose({
  show
});
</script>

<style scoped>
.order-detail {
  padding: 16px 0;
}

.progress-section {
  margin-top: 24px;
}

.progress-section h4 {
  margin-bottom: 16px;
  color: #1890ff;
}

.progress-item {
  padding: 8px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status {
  font-weight: bold;
}

.time {
  color: #666;
  font-size: 12px;
}

.progress-content p {
  margin: 4px 0;
  color: #666;
}

/* 附件样式 */
.attachment-section {
  margin-top: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.3s;
}

.attachment-item:hover {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.file-icon {
  margin-right: 8px;
  color: #1890ff;
  font-size: 16px;
}

.file-name {
  flex: 1;
  margin-right: 8px;
  color: #333;
  font-size: 14px;
  word-break: break-all;
}

.view-btn,
.download-btn {
  padding: 0;
  height: auto;
  color: #1890ff;
  margin-left: 8px;
}

.view-btn:hover,
.download-btn:hover {
  color: #40a9ff;
}

.no-attachment {
  color: #999;
  font-style: italic;
}

.text-red {
  color: #ff4d4f;
}

.text-green {
  color: #52c41a;
}
</style>
