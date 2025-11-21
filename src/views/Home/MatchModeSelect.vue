<template>
  <el-select
    v-model="selectedValue"
    class="match-mode-select"
    size="default"
    :placeholder="placeholder"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElSelect } from 'element-plus'

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: String,
    default: 'contains'
  },
  placeholder: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 下拉选项
const options = [
  { value: 'contains', label: '包含' },
  { value: 'exact', label: '完整匹配' }
]

// 创建计算属性用于v-model绑定
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.match-mode-select {
  width: 100px;
  flex-shrink: 0;
}

:deep(.el-input__wrapper) {
  border-radius: 7px;
}

:deep(.el-select .el-input__inner) {
  font-size: 12px;
}
</style>
