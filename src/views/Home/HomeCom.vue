<template>
  <div class="body">
    <div class="header">
      <div>
        <h1>API Mock</h1>
        <p>轻量级接口模拟工具</p>
      </div>
      <button class="btn-open-tab" @click="openInNewTab">
        在新标签页中打开
      </button>
    </div>

    <div class="container">
      <div class="card">
        <div class="input-group">
          <label>URL 匹配规则</label>
          <div class="url-row">
            <MatchModeSelect v-model="matchMode" />
            <el-input
              v-model="url"
              placeholder="输入 URL 或关键词"
              clearable
              style="width: 100%"
              @input="saveDraft"
            />
          </div>
        </div>

        <div class="input-group">
          <label>请求方法</label>
          <MethodSelect v-model="method" @change="saveDraft" />
        </div>

        <div class="input-group">
          <label>Mock 数据 (JSON)</label>
          <textarea
            v-model="data"
            placeholder='{"code": 0, "data": {}}'
            @input="saveDraft"
          ></textarea>
        </div>

        <div class="btn-group">
          <button class="btn-primary" @click="addRule">添加规则</button>
          <button class="btn-secondary" @click="clearAllRules">清空全部</button>
        </div>
      </div>

      <div class="rules-header">
        <h2>已添加规则</h2>
        <span class="rules-count">{{ rules.length }} 条</span>
      </div>

      <div id="rules">
        <div v-if="rules.length === 0" class="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 15h6" />
          </svg>
          <p>暂无 Mock 规则</p>
        </div>

        <div
          v-for="(rule, index) in rules"
          :key="index"
          :class="['rule-item', { disabled: !rule.enabled }]"
        >
          <div class="rule-header">
            <div class="rule-url">
              <span
                :class="[
                  'method-badge',
                  `method-${(rule.method || 'ALL').toLowerCase()}`,
                ]"
              >
                {{ rule.method || 'ALL' }}
              </span>
              <span
                :class="[
                  'match-mode-badge',
                  `match-mode-${rule.matchMode || 'contains'}`,
                ]"
              >
                {{ matchModeText[rule.matchMode] || '包含' }}
              </span>
              <span>{{ rule.url }}</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center">
              <el-switch
                v-model="rule.enabled"
                size="small"
                @change="toggleRule(index)"
              ></el-switch>
              <button class="btn-delete" @click="deleteRule(index)">
                删除
              </button>
            </div>
          </div>
          <div class="rule-data-wrapper">
            <div
              :class="['rule-data', { expanded: expandedRules.has(index) }]"
              :data-index="index"
            >
              {{ rule.data }}
            </div>
            <button
              v-if="rule.data.length > 100"
              :class="[
                'btn-toggle-data',
                { expanded: expandedRules.has(index) },
              ]"
              @click="toggleDataExpand(index)"
            >
              <span class="toggle-text">{{
                expandedRules.has(index) ? '收起' : '展开'
              }}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Transition name="fade">
      <div v-if="toastMessage" class="toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import MatchModeSelect from './MatchModeSelect.vue';
import MethodSelect from './MethodSelect.vue';

// 响应式数据
const rules = ref<
  Array<{
    url: string;
    method: string;
    matchMode: string;
    data: string;
    enabled: boolean;
  }>
>([]);

const url = ref('');
const method = ref('ALL');
const matchMode = ref('contains');
const data = ref('');
const toastMessage = ref('');
const expandedRules = reactive(new Set<number>());

const matchModeText = {
  contains: '包含',
  exact: '完整',
};

// 在新标签页中打开
const openInNewTab = () => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: window.location.href });
  }
};

// 保存草稿
const saveDraft = () => {
  const draft = {
    url: url.value.trim(),
    method: method.value,
    matchMode: matchMode.value,
    data: data.value.trim(),
  };
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ draftInput: draft });
  }
};

// 添加规则
const addRule = () => {
  const urlValue = url.value.trim();
  const dataValue = data.value.trim();

  if (!urlValue || !dataValue) {
    showToast('请填写完整信息');
    return;
  }

  try {
    JSON.parse(dataValue);
    rules.value.push({
      url: urlValue,
      method: method.value,
      matchMode: matchMode.value,
      data: dataValue,
      enabled: true,
    });

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ mockRules: rules.value });
    }

    // 清空输入框
    url.value = '';
    data.value = '';
    method.value = 'ALL';
    matchMode.value = 'contains';

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('draftInput');
    }

    showToast('✓ 添加成功');
  } catch (e) {
    showToast('JSON 格式错误');
  }
};

// 清空全部规则
const clearAllRules = () => {
  if (rules.value.length === 0) return;
  if (confirm('确定清空所有规则？')) {
    rules.value = [];
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ mockRules: [] });
    }
    showToast('✓ 已清空');
  }
};

// 切换规则启用状态
const toggleRule = (index: number) => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ mockRules: rules.value });
  }
  const status = rules.value[index].enabled ? '已启用' : '已禁用';
  showToast(`✓ ${status}`);
};

// 删除规则
const deleteRule = (index: number) => {
  rules.value.splice(index, 1);
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ mockRules: rules.value });
  }
  expandedRules.delete(index);
  showToast('✓ 已删除');
};

// 切换数据展开/收起
const toggleDataExpand = (index: number) => {
  if (expandedRules.has(index)) {
    expandedRules.delete(index);
  } else {
    expandedRules.add(index);
  }
};

// 显示提示信息
const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = '';
  }, 1500);
};

// 页面加载时恢复数据
onMounted(() => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mockRules', 'draftInput'], (result) => {
      const mockRules = result.mockRules || [];
      rules.value = mockRules.map((rule: any) => ({
        ...rule,
        matchMode: rule.matchMode || 'contains',
        enabled: rule.enabled !== false,
      }));

      // 恢复草稿
      const draft = result.draftInput || {};
      if (draft.url) url.value = draft.url;
      if (draft.method) method.value = draft.method;
      if (draft.matchMode) matchMode.value = draft.matchMode;
      if (draft.data) data.value = draft.data;
    });
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.body {
  width: 100%;
  background: #fafafa;
  color: #1d1d1f;
  font-size: 13px;
}

.header {
  padding: 20px 18px 18px;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: white;
  background: linear-gradient(135deg, #6b7cff 0%, #8b9aff 100%);
  display: inline-block;
  padding: 2px 11px;
  border-radius: 10px;
  margin-bottom: 6px;
}

.header p {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 400;
  margin-left: 2px;
}

.btn-open-tab {
  padding: 6px 12px;
  background: white;
  color: #6b7cff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-open-tab:hover {
  background: #f5f5f7;
  border-color: #6b7cff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(107, 124, 255, 0.15);
}

.btn-open-tab:active {
  transform: translateY(0);
}

.container {
  padding: 0 14px 14px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid #e8e8e8;
}

.input-group {
  margin-bottom: 10px;
}

.input-group:last-of-type {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #8e8e93;
  margin-bottom: 5px;
}

.url-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 13px;
  background: white;
  color: #1d1d1f;
  transition: all 0.2s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #6b7cff;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

textarea {
  min-height: 80px;
  resize: vertical;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 9px 0;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #6b7cff 0%, #8b9aff 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e8e8ea;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 8px;
}

.rules-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.rules-count {
  font-size: 11px;
  color: #8e8e93;
  background: #f5f5f7;
  padding: 2px 8px;
  border-radius: 10px;
}

#rules {
  max-height: 300px;
  overflow-y: auto;
}

.rule-item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.rule-item.disabled {
  opacity: 0.5;
}

.rule-item:hover {
  border-color: #6b7cff;
  box-shadow: 0 2px 8px rgba(107, 124, 255, 0.1);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rule-url {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1d1d1f;
  flex: 1;
  min-width: 0;
}

.rule-url span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.method-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.method-all {
  background: #e0e7ff;
  color: #4338ca;
}

.method-get {
  background: #d1fae5;
  color: #065f46;
}

.method-post {
  background: #fef3c7;
  color: #92400e;
}

.method-put {
  background: #dbeafe;
  color: #1e40af;
}

.method-delete {
  background: #fee2e2;
  color: #991b1b;
}

.match-mode-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
}

.match-mode-contains {
  background: #f3f4f6;
  color: #6b7280;
}

.match-mode-exact {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-delete {
  padding: 4px 10px;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.btn-delete:active {
  transform: translateY(0);
}

.rule-data {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 11px;
  color: #6b7280;
  background: #f9fafb;
  padding: 6px 8px;
  border-radius: 5px;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 60px;
  transition: max-height 0.3s ease;
  position: relative;
}

.rule-data.expanded {
  max-height: none;
}

.rule-data:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, transparent, #f9fafb);
  pointer-events: none;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8e8e93;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 13px;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 10000;
}

.btn-toggle-data {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 8px;
  background: #f5f5f7;
  color: #6b7280;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-data:hover {
  background: #e8e8ea;
  color: #1d1d1f;
}

.btn-toggle-data svg {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
}

.btn-toggle-data.expanded svg {
  transform: rotate(180deg);
}

.rule-data-wrapper {
  position: relative;
}

/* Toast 动画 */
.fade-enter-active,
.fade-leave-active {
  animation: fadeInOut 1.5s ease-in-out;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
  }

  10%,
  90% {
    opacity: 1;
  }
}
</style>
