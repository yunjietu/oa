<template>
  <a-modal
    v-model:open="visible"
    title="确认已补尾款"
    :width="500"
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
      
      <a-form-item label="订单总额" name="expectedAmount">
        <a-input v-model:value="form.expectedAmount" disabled />
      </a-form-item>
      
      <a-form-item label="已付定金" name="actualAmount">
        <a-input v-model:value="form.actualAmount" disabled />
      </a-form-item>
      
      <a-form-item label="待付尾款" name="unpaidAmount">
        <a-input v-model:value="form.unpaidAmount" disabled />
      </a-form-item>
      
      
      <a-form-item label="备注" name="remark">
        <a-textarea
          v-model:value="form.remark"
          placeholder="请输入备注信息"
          :rows="2"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';

const emit = defineEmits(['success']);

const visible = ref(false);
const formRef = ref();

const form = reactive({
  orderId: null,
  orderNo: '',
  paperName: '',
  expectedAmount: '',
  actualAmount: '',
  unpaidAmount: '',
  remark: ''
});

const rules = {};

// 显示模态框
const show = (record) => {
  visible.value = true;
  form.orderId = record.orderId;
  form.orderNo = record.orderNo;
  form.paperName = record.paperName;
  form.expectedAmount = `¥${record.expectedAmount}`;
  form.actualAmount = `¥${record.actualAmount}`;
  form.unpaidAmount = `¥${record.unpaidAmount}`;
  form.remark = '';
};

// 确定
const handleOk = async () => {
  try {
    await formRef.value.validate();
    
    const params = {
      orderId: form.orderId,
      remark: form.remark
    };
    
    await paperOrderApi.confirmPayment(params);
    message.success('尾款确认成功');
    emit('success');
    handleCancel();
  } catch (error) {
    console.error('尾款确认失败:', error);
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
