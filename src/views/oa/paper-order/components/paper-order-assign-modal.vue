<template>
  <a-modal
    v-model:open="visible"
    title="分配订单"
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
      
      <a-form-item label="分配人员" name="assigneeId" required>
        <a-select
          v-model:value="form.assigneeId"
          placeholder="请选择分配人员"
          :options="userOptions"
          show-search
          :filter-option="filterOption"
        />
      </a-form-item>
      
      <a-form-item label="分配备注" name="assignRemark">
        <a-textarea
          v-model:value="form.assignRemark"
          placeholder="请输入分配备注"
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import { paperOrderApi } from '/@/api/oa/paper-order-api';
import { employeeApi } from '/@/api/system/employee-api';

const emit = defineEmits(['success']);

const visible = ref(false);
const formRef = ref();
const userOptions = ref([]);

const form = reactive({
  orderId: null,
  orderIds: [], // 批量分配时的订单ID列表
  orderNo: '',
  paperName: '',
  assigneeId: undefined,
  assignRemark: ''
});

const rules = {
  assigneeId: [
    { required: true, message: '请选择分配人员', trigger: 'change' }
  ]
};

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await employeeApi.queryAll();
    userOptions.value = res.data.map(user => ({
      label: user.loginName + ' (' + user.actualName + ')',
      value: user.employeeId
    }));
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
};

// 搜索过滤
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 显示模态框
const show = async (record) => {
  visible.value = true;
  form.orderId = record.orderId;
  form.orderIds = []; // 清空批量分配列表
  form.orderNo = record.orderNo;
  form.paperName = record.paperName;
  form.assigneeId = undefined;
  form.assignRemark = '';
  
  // 先获取用户列表
  await getUserList();
  
  // 获取订单详情，设置当前负责人
  try {
    const detailRes = await paperOrderApi.getDetail(record.orderId);
    if (detailRes.data && detailRes.data.assigneeId) {
      form.assigneeId = detailRes.data.assigneeId;
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
  }
};

// 批量分配
const openBatch = (orderIds) => {
  visible.value = true;
  form.orderId = null; // 清空单个订单ID
  
  // 过滤掉null值和无效的订单ID
  form.orderIds = orderIds.filter(id => id != null && id > 0);
  form.orderNo = `批量分配 (${form.orderIds.length}个订单)`;
  form.paperName = '';
  form.assigneeId = undefined;
  form.assignRemark = '';
  
  getUserList();
};

// 确定
const handleOk = async () => {
  try {
    await formRef.value.validate();
    
    const params = {
      assigneeId: form.assigneeId,
      assignRemark: form.assignRemark
    };
    
    // 判断是单个分配还是批量分配
    if (form.orderId) {
      // 单个分配
      params.orderId = form.orderId;
      await paperOrderApi.assignOrder(params);
      message.success('分配成功');
    } else if (form.orderIds && form.orderIds.length > 0) {
      // 批量分配
      params.orderIds = form.orderIds;
      await paperOrderApi.batchAssignOrder(params);
      message.success(`批量分配成功，共分配 ${form.orderIds.length} 个订单`);
    } else {
      message.error('没有有效的订单ID');
      return;
    }
    
    emit('success');
    handleCancel();
  } catch (error) {
    console.error('分配失败:', error);
  }
};

// 取消
const handleCancel = () => {
  visible.value = false;
  formRef.value?.resetFields();
};

// 暴露方法
defineExpose({
  show,
  openBatch
});
</script>
