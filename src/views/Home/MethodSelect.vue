<template>
  <el-select
    v-model="selectedValue"
    class="method-select"
    :placeholder="placeholder"
    size="default"
    style="width: 100%"
    @change="(val) => emit('change', val)"
  >
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElSelect } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'ALL',
  },
  placeholder: {
    type: String,
    default: '请选择请求方法',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const options = [
  { value: 'ALL', label: 'ALL' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<style scoped>
.method-select {
  width: 100%;
}

/* 保持圆角与项目风格一致 */
:deep(.el-input__wrapper) {
  border-radius: 7px;
}
</style>
