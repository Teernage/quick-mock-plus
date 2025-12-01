<template>
  <div
    class="rule-form-overlay"
    @click.self="$emit('close')"
  >
    <div class="rule-form-modal">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑规则' : '添加规则' }}</h2>
        <button
          class="btn-close"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="input-group">
          <label>URL 匹配规则</label>
          <div class="url-row">
            <MatchModeSelect v-model="form.matchMode" />
            <el-input
              v-model="form.url"
              placeholder="输入 URL 或关键词"
              clearable
            />
          </div>
        </div>

        <div class="input-group">
          <label>请求方法</label>
          <MethodSelect v-model="form.method" />
        </div>

        <div class="input-group">
          <label>备注</label>
          <el-input
            v-model="form.remark"
            placeholder="填写接口用途说明，如：日历信息查询"
            clearable
          />
        </div>

        <div class="input-group">
          <div class="ai-header-row">
            <label>AI 生成</label>
            <el-button
              type="primary"
              :loading="isGenerating"
              @click="generateFromDeepseek"
              >生成
            </el-button>
          </div>
          <div class="url-row ai-row">
            <el-input
              v-model="aiTypePrompt"
              type="textarea"
              :rows="2"
              placeholder="输入接口的类型即可自动生成 Mock 数据，或者描述你想要的数据"
              clearable
            />
          </div>
        </div>

        <div class="input-group">
          <div class="label-row">
            <label>Mock 数据 (JSON)</label>
            <button
              class="btn-inline"
              @click="showJsonDialog = true"
            >
              ⛶ 放大
            </button>
          </div>
          <textarea
            ref="jsonTextarea"
            v-model="form.data"
          >
            placeholder='{"code": 0, "data": {}}'
          >
          </textarea>

          <div class="json-actions">
            <button
              class="json-btn"
              @click="formatJson"
            >
              格式化
            </button>
            <button
              class="json-btn"
              @click="validateJson"
            >
              验证
            </button>
            <button
              class="json-btn"
              @click="copyJson"
            >
              复制
            </button>
            <button
              class="json-btn"
              @click="clearJson"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn-secondary"
          @click="$emit('close')"
        >
          取消
        </button>
        <button
          class="btn-primary"
          @click="handleSubmit"
        >
          {{ isEdit ? '保存' : '添加' }}
        </button>
      </div>
    </div>
    <div
      v-if="showJsonDialog"
      class="json-dialog-overlay"
      @click.self="showJsonDialog = false"
    >
      <div class="json-dialog">
        <div class="json-dialog-header">
          <h3>Mock 数据 (JSON)</h3>
          <button
            class="btn-close"
            @click="showJsonDialog = false"
          >
            ✕
          </button>
        </div>
        <div class="json-dialog-body">
          <textarea
            ref="dialogTextarea"
            v-model="form.data"
            class="dialog-textarea"
          ></textarea>
        </div>
        <div class="json-dialog-actions">
          <button
            class="json-btn"
            @click="formatJson"
          >
            格式化
          </button>
          <button
            class="json-btn"
            @click="validateJson"
          >
            验证
          </button>
          <button
            class="json-btn"
            @click="copyJson"
          >
            复制
          </button>
          <button
            class="json-btn"
            @click="clearJson"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import MatchModeSelect from './MatchModeSelect.vue'
import MethodSelect from './MethodSelect.vue'
import { Rule } from '@/types/rule'

const props = defineProps<{
  editRule?: Rule
  isEdit?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [rule: Rule]
}>()

const form = reactive({
  url: props.editRule?.url || '',
  method: props.editRule?.method || 'ALL',
  matchMode: props.editRule?.matchMode || 'contains',
  data: props.editRule?.data || '{\n  "code": 0,\n  "data": {}\n}',
  enabled: props.editRule?.enabled ?? true,
  remark: props.editRule?.remark || ''
})

const jsonError = ref('')
const aiTypePrompt = ref('')
const apiKey = ref(localStorage.getItem('DEEPSEEK_API_KEY') || '')
const isGenerating = ref(false)
const showJsonDialog = ref(false)
const jsonTextarea = ref<HTMLTextAreaElement | null>(null)
const dialogTextarea = ref<HTMLTextAreaElement | null>(null)

/**
 * 设置 api key
 * @param k
 */
function setApiKey(k: string) {
  apiKey.value = k
  localStorage.setItem('DEEPSEEK_API_KEY', k)
}

function extractJson(text: string): string {
  const m1 = text.match(/```json\s*([\s\S]*?)\s*```/i)
  if (m1) return m1[1].trim()
  const m2 = text.match(/```\s*([\s\S]*?)\s*```/)
  if (m2) return m2[1].trim()
  return text.trim()
}

async function generateFromDeepseek() {
  if (!aiTypePrompt.value.trim()) {
    ElMessage.warning('请输入类型或描述')
    return
  }
  if (!apiKey.value) {
    try {
      const r: any = await ElMessageBox.prompt('请输入 DeepSeek API Key', '设置 API Key', {
        inputType: 'password',
        inputPlaceholder: 'sk-...'
      })
      setApiKey(r.value)
    } catch (_) {
      return
    }
  }
  isGenerating.value = true
  try {
    const shape = '返回一个对象（不使用额外包裹层），仅包含你描述的业务数据'
    const userPrompt = `${shape}。只返回合法 JSON，不输出解释或代码块标记。字段尽量简短。类型描述：\n${aiTypePrompt.value}`

    const body = {
      model: 'deepseek-chat',
      temperature: 0.2,
      stream: true,
      messages: [
        {
          role: 'system',
          content: '只返回合法 JSON，不输出思考过程，不输出解释，不输出代码块标记。'
        },
        { role: 'user', content: userPrompt }
      ]
    }
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`
      try {
        const err = await res.json()
        errMsg = err?.error?.message || errMsg
      } catch {}
      if (res.status === 401 || /invalid|unauthor|expired/i.test(errMsg)) {
        try {
          const r: any = await ElMessageBox.prompt(
            'API Key 无效或已过期，请重新输入',
            '设置 API Key',
            {
              inputType: 'password',
              inputPlaceholder: 'sk-...'
            }
          )
          setApiKey(r.value)
          ElMessage.success('API Key 已更新，请重新生成')
        } catch {}
        return
      }
      if (res.status === 429 || res.status === 402 || /quota|insufficient|limit/i.test(errMsg)) {
        ElMessage.error('额度不足或已达限制，请检查账户配额')
        return
      }
      ElMessage.error('生成失败：' + errMsg)
      return
    }
    const reader = res.body?.getReader?.()
    let raw = ''
    if (!reader) {
      const data: any = await res.json()
      const content: string = data?.choices?.[0]?.message?.content || ''
      const rawOnce = extractJson(content)
      try {
        const parsed = JSON.parse(rawOnce)
        form.data = JSON.stringify(parsed, null, 2)
        ElMessage.success('已生成 Mock 数据')
      } catch {
        form.data = rawOnce
        ElMessage.warning('AI 返回内容可能不是纯 JSON')
      }
    } else {
      const d = new TextDecoder('utf-8')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = d.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          const s = line.trim()
          if (!s.startsWith('data:')) continue
          const payload = s.slice(5).trim()
          if (payload === '[DONE]') continue
          try {
            const j = JSON.parse(payload)
            const delta = j?.choices?.[0]?.delta?.content ?? j?.choices?.[0]?.message?.content ?? ''
            raw += delta
            if (delta) form.data = extractJson(raw)
          } catch {}
        }
      }
      const cleaned = extractJson(raw)
      try {
        const parsed = JSON.parse(cleaned)
        form.data = JSON.stringify(parsed, null, 2)
        ElMessage.success('已生成 Mock 数据')
      } catch {
        form.data = cleaned
        ElMessage.warning('AI 返回内容可能不是纯 JSON')
      }
    }
  } catch (e) {
    ElMessage.error('生成失败，请检查 API Key 或网络')
  } finally {
    isGenerating.value = false
  }
}

const handleSubmit = () => {
  if (!form.url.trim()) {
    ElMessage.warning('请输入 URL')
    return
  }
  if (!form.data.trim()) {
    ElMessage.warning('请输入 Mock 数据')
    return
  }
  try {
    JSON.parse(form.data)
    emit('submit', { ...form })
  } catch (e) {
    ElMessage.error('JSON 格式错误')
  }
}

function formatJson() {
  try {
    const obj = JSON.parse(form.data)
    form.data = JSON.stringify(obj, null, 2)
    jsonError.value = ''
    ElMessage.success('已格式化')
  } catch (e) {
    jsonError.value = 'JSON 格式错误'
    ElMessage.error('JSON 格式错误')
  }
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(form.data)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

async function clearJson() {
  try {
    await ElMessageBox.confirm('确定清空当前 Mock 数据？', '清空确认', {
      type: 'warning',
      confirmButtonText: '清空',
      cancelButtonText: '取消'
    })
    form.data = ''
    jsonError.value = ''
  } catch (_) {}
}

function validateJson() {
  try {
    JSON.parse(form.data)
    jsonError.value = ''
    ElMessage.success('校验通过')
  } catch (e) {
    jsonError.value = 'JSON 格式错误'
    ElMessage.error('JSON 格式错误')
  }
}
</script>

<style scoped>
.rule-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rule-form-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f7;
  border-radius: 50%;
  font-size: 16px;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #e8e8ea;
  color: #1d1d1f;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.input-group {
  margin-bottom: 16px;
}
.input-group :deep(.el-input) {
  width: 100%;
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #8e8e93;
  margin-bottom: 6px;
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.btn-inline {
  border: 1px solid #e8e8e8;
  background: #fff;
  color: #1d1d1f;
  border-radius: 8px;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
}
.btn-inline:hover {
  background: #f5f5f7;
}

.url-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-row {
  align-items: flex-start;
}
.ai-header-row {
  display: flex;
  align-items: center;
}

.ai-row :deep(.el-button) {
  margin-top: 2px;
}
.ai-header-row :deep(.el-button) {
  margin-left: 8px;
  height: 24px;
  margin-bottom: 3px;
}

.ai-row :deep(.el-textarea__inner) {
  resize: vertical;
}
.ai-row :deep(.el-textarea) {
  flex: 1;
}

textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  background: white;
  color: #1d1d1f;
  min-height: 120px;
  resize: vertical;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  line-height: 1.5;
  transition: all 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #6b7cff;
  box-shadow: 0 0 0 3px rgba(107, 124, 255, 0.1);
}

.json-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.json-btn {
  background: #fff;
  color: #1d1d1f;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 12px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.json-btn:hover {
  background: #f5f5f7;
}

.json-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.json-dialog {
  background: #fff;
  width: 92%;
  max-width: 800px;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.json-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}
.json-dialog-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}
.json-dialog-body {
  padding: 14px;
}
.dialog-textarea {
  width: 100%;
  min-height: 60vh;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  background: white;
  color: #1d1d1f;
  resize: vertical;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  line-height: 1.6;
}
.json-dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
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

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e8e8ea;
}
</style>
