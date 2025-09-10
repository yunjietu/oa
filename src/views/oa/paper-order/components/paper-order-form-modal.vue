<!-- 订单表单弹窗组件 -->
<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑订单' : '新增订单'"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
      layout="vertical"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="论文名称" name="paperName">
            <a-input v-model:value="formData.paperName" placeholder="请输入论文名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="任务类型" name="taskType">
            <a-select v-model:value="formData.taskType" placeholder="请选择任务类型">
              <a-select-option v-for="option in TASK_TYPE_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="学科" name="subject">
            <a-select v-model:value="formData.subject" placeholder="请选择学科">
              <a-select-option v-for="option in SUBJECT_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="负责人" name="assigneeId">
            <a-select
              v-model:value="formData.assigneeId"
              placeholder="请选择负责人"
              allowClear
              :options="userOptions"
              show-search
              :filter-option="filterOption"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="论文字数" name="wordCount">
            <a-input-number
              v-model:value="formData.wordCount"
              :min="1"
              placeholder="请输入论文字数"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预计结束时间" name="expectedEndTime">
            <a-date-picker
              v-model:value="formData.expectedEndTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择预计结束时间"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="总额" name="expectedAmount">
            <a-input-number
              v-model:value="formData.expectedAmount"
              :min="0.01"
              :precision="2"
              placeholder="请输入总额"
              style="width: 100%"
              @change="calculateUnpaidAmount"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="定金" name="actualAmount">
            <a-input-number
              v-model:value="formData.actualAmount"
              :min="0"
              :precision="2"
              placeholder="请输入定金"
              style="width: 100%"
              @change="calculateUnpaidAmount"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="尾款">
            <a-input-number
              :value="formData.unpaidAmount"
              :precision="2"
              placeholder="自动计算"
              style="width: 100%"
              :disabled="true"
            />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-form-item label="任务描述" name="taskDescription">
        <a-textarea
          v-model:value="formData.taskDescription"
          :rows="2"
          placeholder="请输入任务描述"
        />
      </a-form-item>
      
      <a-form-item label="备注" name="remark">
        <a-textarea
          v-model:value="formData.remark"
          :rows="2"
          placeholder="请输入备注"
        />
      </a-form-item>
      
      <a-form-item label="附件上传">
        <FileUpload
          ref="fileUploadRef"
          :defaultFileList="fileList"
          :maxUploadSize="1"
          :maxSize="10"
          buttonText="点击上传附件"
          listType="text"
          :folder="FILE_FOLDER_TYPE_ENUM.COMMON.value"
          @change="handleFileChange"
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
import { fileApi } from '/@/api/support/file-api';
import { 
  TASK_TYPE_OPTIONS,
  SUBJECT_OPTIONS
} from '/@/constants/oa/paper-order-const';
import { FILE_FOLDER_TYPE_ENUM } from '/@/constants/support/file-const';
import FileUpload from '/@/components/support/file-upload/index.vue';
import dayjs from 'dayjs';

const emit = defineEmits(['success']);

// 弹窗状态
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const fileUploadRef = ref();

// 编辑时的原始记录
const editRecord = ref(null);

// 表单数据
const formData = reactive({
  orderId: null,
  paperName: '',
  taskType: undefined,
  subject: undefined,
  wordCount: 10000,
  expectedEndTime: null,
  assigneeId: undefined,
  expectedAmount: undefined,
  actualAmount: undefined,
  unpaidAmount: 0,
  taskDescription: '',
  remark: '',
  attachmentUrl: '',
  attachmentName: '',
  attachmentFileKey: ''
});

// 文件列表
const fileList = ref([]);

// 用户选项
const userOptions = ref([]);

// 表单验证规则
const rules = {
  paperName: [
    { required: true, message: '请输入论文名称', trigger: 'blur' },
    { max: 200, message: '论文名称长度不能超过200个字符', trigger: 'blur' }
  ],
  taskType: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ],
  wordCount: [
    { required: true, message: '请输入论文字数', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        if (value === null || value === undefined || value === '') {
          return Promise.reject('请输入论文字数');
        }
        const num = Number(value);
        if (isNaN(num) || num <= 0) {
          return Promise.reject('论文字数必须大于0');
        }
        return Promise.resolve();
      }, 
      trigger: 'blur' 
    }
  ],
  expectedAmount: [
    { required: true, message: '请输入总额', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        if (value === null || value === undefined || value === '') {
          return Promise.reject('请输入总额');
        }
        const num = Number(value);
        if (isNaN(num) || num <= 0) {
          return Promise.reject('总额必须大于0');
        }
        return Promise.resolve();
      }, 
      trigger: 'blur' 
    }
  ],
  expectedEndTime: [
    { required: true, message: '请选择预计结束时间', trigger: 'change' }
  ],
  actualAmount: [
    { 
      validator: (rule, value) => {
        if (value === null || value === undefined || value === '') {
          return Promise.resolve(); // 定金可以为空
        }
        const num = Number(value);
        if (isNaN(num) || num < 0) {
          return Promise.reject('定金不能小于0');
        }
        return Promise.resolve();
      }, 
      trigger: 'blur' 
    }
  ]
};

// 打开弹窗
const open = (record = null) => {
  visible.value = true;
  isEdit.value = !!record;
  
  if (record) {
    // 保存原始记录用于附件删除检测
    editRecord.value = { ...record };
    
    // 编辑模式，填充数据
    Object.assign(formData, {
      ...record,
      expectedEndTime: record.expectedEndTime ? dayjs(record.expectedEndTime) : null
    });
    
    // 计算尾款
    calculateUnpaidAmount();
    
    // 设置文件列表
    if (record.attachmentUrl) {
      fileList.value = [{
        fileId: record.attachmentFileKey || record.attachmentUrl, // 使用fileKey作为fileId
        fileName: record.attachmentName || '附件',
        fileUrl: record.attachmentUrl,
        fileKey: record.attachmentFileKey || record.attachmentUrl // 优先使用fileKey
      }];
    }
  } else {
    // 新增模式，重置数据
    editRecord.value = null;
    resetForm();
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    orderId: null,
    paperName: '',
    taskType: undefined,
    subject: undefined,
    wordCount: 10000,
    expectedEndTime: null,
    assigneeId: undefined,
    expectedAmount: undefined,
    actualAmount: undefined,
    unpaidAmount: 0,
    taskDescription: '',
    remark: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentFileKey: ''
  });
  fileList.value = [];
};

// 计算尾款
const calculateUnpaidAmount = () => {
  const expected = formData.expectedAmount || 0;
  const actual = formData.actualAmount || 0;
  formData.unpaidAmount = expected - actual;
};

// 文件变化处理
const handleFileChange = (files) => {
  if (files && files.length > 0) {
    const file = files[0];
    formData.attachmentUrl = file.fileUrl;
    formData.attachmentName = file.fileName;
    formData.attachmentFileKey = file.fileKey; // 保存fileKey
  } else {
    formData.attachmentUrl = '';
    formData.attachmentName = '';
    formData.attachmentFileKey = '';
  }
};

// 确认提交
const handleOk = async () => {
  try {
    await formRef.value.validate();
    
    confirmLoading.value = true;
    
    // 处理时间格式
    const submitData = {
      ...formData,
      expectedStartTime: formData.expectedStartTime ? formData.expectedStartTime.format('YYYY-MM-DD HH:mm:ss') : null,
      expectedEndTime: formData.expectedEndTime ? formData.expectedEndTime.format('YYYY-MM-DD HH:mm:ss') : null
    };
    
    // 检测附件是否被删除（编辑模式下）
    if (isEdit.value) {
      const originalAttachmentFileKey = editRecord.value?.attachmentFileKey;
      const originalAttachmentUrl = editRecord.value?.attachmentUrl;
      const currentAttachmentFileKey = formData.attachmentFileKey;
      
      // 如果原来有附件（有fileKey或URL），现在没有附件，说明附件被删除
      const hadOriginalAttachment = originalAttachmentFileKey || originalAttachmentUrl;
      const hasCurrentAttachment = currentAttachmentFileKey;
      const attachmentDeleted = hadOriginalAttachment && !hasCurrentAttachment;
      
      submitData.attachmentDeleted = attachmentDeleted;
    }
    
    if (isEdit.value) {
      await paperOrderApi.update(submitData);
      message.success('更新成功');
    } else {
      await paperOrderApi.add(submitData);
      message.success('新增成功');
    }
    
    visible.value = false;
    emit('success');
  } catch (error) {
    console.error('提交失败', error);
  } finally {
    confirmLoading.value = false;
  }
};

// 取消
const handleCancel = () => {
  visible.value = false;
  resetForm();
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

// 监听文件列表变化
watch(fileList, (newList) => {
  if (newList.length > 0) {
    const file = newList[0];
    if (file.response && file.response.fileUrl) {
      // 新上传的文件 - 使用原始文件名而不是生成的文件名
      formData.attachmentName = file.name; // 使用原始文件名
      formData.attachmentUrl = file.response.fileUrl;
      formData.attachmentFileKey = file.response.fileKey;
    } else if (file.url) {
      // 已存在的文件
      formData.attachmentName = file.name;
      formData.attachmentUrl = file.url;
      formData.attachmentFileKey = file.fileKey;
    }
  } else {
    // 没有文件 - 清空所有附件相关字段
    formData.attachmentName = '';
    formData.attachmentUrl = '';
    formData.attachmentFileKey = '';
  }
}, { deep: true });

// 暴露方法
defineExpose({
  open
});

// 初始化
getUserList();
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

.ant-form-item-label {
  text-align: left !important;
  padding-bottom: 4px;
}

.ant-form-item-label > label {
  font-weight: 500;
}

.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
  color: #ff4d4f;
  margin-right: 4px;
}

/* 优化表单项间距 */
.ant-form-item-control {
  margin-bottom: 0;
}

/* 优化输入框样式 */
.ant-input,
.ant-select,
.ant-input-number,
.ant-picker {
  border-radius: 6px;
}

/* 优化文本域样式 */
.ant-input {
  resize: vertical;
}
</style>
