console.log('content script is running')

/**
 * 在页面中注入扩展的 injected.js 脚本。
 * 使用 chrome.runtime.getURL 获取扩展内资源的绝对 URL。
 */
function init() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/injected/index.js')
  script.onload = function () {
    console.log('注入脚本已成功加载')
  }
  ;(document.head || document.documentElement).appendChild(script)
}

init()

/**
 * 安全读取本地存储中的 mock 规则。
 * 若扩展未加载或 API 不可用、或读取失败，返回空数组。
 * @returns {Array}  - mock 规则数组。
 */
async function getMockRulesSafely() {
  try {
    if (!chrome?.runtime?.id || !chrome?.storage?.local) return []
    const result = await chrome.storage.local.get('mockRules')
    if (chrome.runtime.lastError) {
      console.warn('[Mock] 读取存储失败:', chrome.runtime.lastError)
      return []
    }
    const raw = result.mockRules
    if (!raw) return []
    // 如果是对象，转换为数组
    if (Array.isArray(raw)) {
      return raw
    } else if (typeof raw === 'object') {
      // 将 {"0": {...}, "1": {...}} 转换为 [{...}, {...}]
      return Object.values(raw)
    }

    return []
  } catch (err) {
    console.warn('[Mock] 读取存储异常:', err)
    return []
  }
}

/**
 * 根据匹配模式对 URL 进行匹配。
 * @param {*} url  - 请求的 URL。
 * @param {*} pattern  - 匹配规则。若模式为 'regex'，支持 '/pattern/flags' 或普通正则字符串。
 * @param {*} mode  - 匹配模式：'exact' | 'contains' | 'regex'
 * @returns {boolean}  - 匹配结果。
 */
function matchUrl(url, pattern, mode) {
  try {
    switch (mode) {
      case 'exact':
        return url === pattern
      case 'regex': {
        if (typeof pattern !== 'string') return false
        const m = pattern.match(/^\/(.+)\/([a-z]*)$/)
        if (m) {
          return new RegExp(m[1], m[2]).test(url)
        }
        return new RegExp(pattern).test(url)
      }
      case 'contains':
      default:
        return url.includes(pattern)
    }
  } catch (e) {
    console.warn('[Mock] URL 匹配失败:', e)
    return false
  }
}

/**
 * 监听来自 content-script 的消息。
 * 若消息类型为 MOCK_REQUEST，则根据 URL 和 method 匹配规则，返回对应的 mock 数据。
 */
window.addEventListener('message', async (event) => {
  if (event.data.type !== 'MOCK_REQUEST') return

  const { url, method, id } = event.data
  const rules = await getMockRulesSafely()

  for (const rule of rules) {
    try {
      // 添加启用状态检查
      if (rule.enabled === false) continue

      const matchMode = rule.matchMode || 'contains'
      const urlMatch = matchUrl(url, rule.url, matchMode)
      const methodMatch = rule.method === 'ALL' || rule.method === method

      if (urlMatch && methodMatch) {
        let mockData = rule.data
        try {
          mockData = JSON.parse(rule.data)
        } catch (e) {
          console.warn('[Mock] JSON 解析失败，使用原始字符串')
        }

        const status = Number(rule.status) || 200
        const delay = Number(rule.delayMs) || 0
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay))
        }

        window.postMessage(
          {
            type: 'MOCK_RESPONSE',
            id,
            shouldMock: true,
            mockData,
            status,
            headers:
              status === 101 || status === 204 || status === 205 || status === 304
                ? {}
                : { 'Content-Type': 'application/json' }
          },
          '*'
        )
        return
      }
    } catch (e) {
      console.warn('[Mock] 规则处理失败:', e)
      continue
    }
  }

  window.postMessage({ type: 'MOCK_RESPONSE', id, shouldMock: false }, '*')
})
