<template>
  <a-modal
    v-model:open="visible"
    title="申请退款"
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
      
      <a-form-item label="已付金额" name="actualAmount">
        <a-input v-model:value="form.actualAmount" disabled />
      </a-form-item>
      
      
      <a-form-item label="退款金额" name="refundAmount" required>
        <a-input-number
          v-model:value="form.refundAmount"
          :min="0"
          :max="form.maxRefundAmount"
          :precision="2"
          placeholder="请输入退款金额"
          style="width: 100%"
        />
        <div class="refund-tip">
          最大可退款金额：¥{{ form.maxRefundAmount }}
        </div>
      </a-form-item>
      
      <a-form-item label="退款原因" name="refundReason" required>
        <a-textarea
          v-model:value="form.refundReason"
          placeholder="请详细说明退款原因"
          :rows="3"
        />
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
  maxRefundAmount: 0,
  refundAmount: undefined,
  refundReason: '',
  remark: ''
});

const rules = {
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        if (value > form.maxRefundAmount) {
          return Promise.reject('退款金额不能超过已付金额');
        }
        if (value <= 0) {
          return Promise.reject('退款金额必须大于0');
        }
        return Promise.resolve();
      }, 
      trigger: 'blur' 
    }
  ],
  refundReason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' }
  ]
};


// 显示模态框
const show = async (record) => {
  visible.value = true;
  form.orderId = record.orderId;
  form.orderNo = record.orderNo;
  form.paperName = record.paperName;
  form.expectedAmount = `¥${record.expectedAmount}`;
  
  // 计算实付金额：如果尾款已补，实付金额 = 定金 + 尾款 = 总金额；否则实付金额 = 定金
  const paidAmount = record.paymentStatus === 1 
    ? (Number(record.actualAmount) + Number(record.unpaidAmount)) 
    : Number(record.actualAmount);
  form.actualAmount = `¥${paidAmount.toFixed(2)}`;
  
  // 调用后端接口获取最大退款金额
  try {
    const response = await paperOrderApi.getMaxRefundAmount(record.orderId);
    form.maxRefundAmount = response.data || 0;
  } catch (error) {
    console.error('获取最大退款金额失败:', error);
    form.maxRefundAmount = record.actualAmount || 0; // 降级处理
  }
  
  form.refundAmount = undefined;
  form.refundReason = '';
  form.remark = '';
};

// 确定
const handleOk = async () => {
  try {
    await formRef.value.validate();
    
    const params = {
      orderId: form.orderId,
      refundAmount: form.refundAmount,
      refundReason: form.refundReason,
      remark: form.remark
    };
    
    await paperOrderApi.confirmRefund(params);
    message.success('退款成功');
    emit('success');
    handleCancel();
  } catch (error) {
    console.error('退款失败:', error);
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

<style scoped>
.refund-tip {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>
