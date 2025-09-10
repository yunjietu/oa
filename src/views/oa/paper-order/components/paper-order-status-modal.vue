<template>
  <a-modal
    v-model:open="visible"
    title="更新状态"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="订单编号" name="orderNo">
        <a-input v-model:value="form.orderNo" disabled />
      </a-form-item>
      
      <a-form-item label="论文名称" name="paperName">
        <a-input v-model:value="form.paperName" disabled />
      </a-form-item>
      
      <a-form-item label="当前状态" name="currentStatus">
        <a-tag :color="getStatusColor(form.currentStatus)">
          {{ getStatusText(form.currentStatus) }}
        </a-tag>
      </a-form-item>
      
      <a-form-item label="新状态" name="taskStatus" required>
        <a-select
          v-model:value="form.taskStatus"
          placeholder="请选择新状态"
          :options="statusOptions"
        />
      </a-form-item>
      
      <a-form-item label="状态备注" name="remark">
        <a-textarea
          v-model:value="form.remark"
          placeholder="请输入状态更新备注"
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import { 
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  STATUS_COLOR_MAP
} from '/@/constants/oa/paper-order-const';

const emit = defineEmits(['success']);

const visible = ref(false);
const formRef = ref();

const form = reactive({
  orderId: null,
  orderNo: '',
  paperName: '',
  currentStatus: undefined,
  taskStatus: undefined,
  remark: ''
});

const rules = {
  taskStatus: [
    { required: true, message: '请选择新状态', trigger: 'change' }
  ]
};

// 状态选项（排除当前状态）
const statusOptions = computed(() => {
  return TASK_STATUS_OPTIONS.filter(option => option.value !== form.currentStatus);
});

// 获取状态文本
const getStatusText = (status) => {
  const option = TASK_STATUS_OPTIONS.find(item => item.value === status);
  return option ? option.label : '未知';
};

// 获取状态颜色
const getStatusColor = (status) => {
  return STATUS_COLOR_MAP[status] || 'default';
};

// 显示模态框
const show = (record) => {
  visible.value = true;
  form.orderId = record.orderId;
  form.orderNo = record.orderNo;
  form.paperName = record.paperName;
  form.currentStatus = record.taskStatus;
  form.taskStatus = undefined;
  form.remark = '';
};

// 确定
const handleOk = async () => {
  try {
    await formRef.value.validate();
    
    const params = {
      orderId: form.orderId,
      taskStatus: form.taskStatus,
      remark: form.remark
    };
    
    await paperOrderApi.updateStatus(params);
    message.success('状态更新成功');
    emit('success');
    handleCancel();
  } catch (error) {
    console.error('状态更新失败:', error);
  }
};

// 取消
const handleCancel = () => {
  visible.value = false;
  formRef.value?.resetFields();
};

// 暴露方法
defineExpose({
  show
});
</script>
