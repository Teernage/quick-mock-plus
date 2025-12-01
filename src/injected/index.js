function init() {
  //  保存原始方法
  const originalFetch = window.fetch
  const originalXHROpen = XMLHttpRequest.prototype.open
  const originalXHRSend = XMLHttpRequest.prototype.send
  const pendingRequests = new Map() // 存储等待响应的请求（key: id, value: resolve 函数）
  let requestId = 0 // 每个请求ID

  /**
   * 监听来自 content-script 的 mock 响应。
   * 若消息类型为 MOCK_RESPONSE，根据请求ID匹配并调用对应的 resolve 函数。
   */
  window.addEventListener('message', (event) => {
    if (event.data.type !== 'MOCK_RESPONSE') return

    const { id, shouldMock, mockData, status, headers } = event.data
    const resolve = pendingRequests.get(id)

    if (resolve) {
      resolve({ shouldMock, mockData, status, headers })
      pendingRequests.delete(id)
    }
  })

  /**
   * 规范化 URL。
   * 若输入为字符串，直接返回；
   * 若输入为对象且包含 url 属性，返回该属性值；否则转换为字符串。
   * @param {*} input  - 请求的 URL 或包含 URL 的对象。
   * @returns {string}  - 规范化后的 URL。
   */
  function normalizeUrl(input) {
    try {
      if (typeof input === 'string') return input
      if (input && typeof input === 'object' && 'url' in input) {
        return input.url
      }
    } catch (_) {
      console.error('normalizeUrl error:', _)
    }

    return String(input)
  }

  /**
   * 获取请求方法
   * @param {*} url  - 请求的 URL 或包含 URL 的对象。
   * @param {*} options  - 请求的选项。
   * @returns
   */
  function getMethod(url, options) {
    if (url && typeof url === 'object' && 'method' in url) {
      return url.method.toUpperCase()
    }
    return (options?.method || 'GET').toUpperCase()
  }

  /**
   *  发送 Mock 请求到 content-script。
   * @param {*} url - 请求的 URL 或包含 URL 的对象。
   * @param {*} method - 请求的方法。
   * @returns
   */
  function sendMockRequest(url, method) {
    return new Promise((resolve) => {
      const id = requestId++
      pendingRequests.set(id, resolve)

      const safeUrl = normalizeUrl(url)

      try {
        window.postMessage(
          {
            type: 'MOCK_REQUEST',
            url: safeUrl,
            method,
            id
          },
          '*'
        )
      } catch (e) {
        if (pendingRequests.has(id)) {
          resolve({ shouldMock: false })
          pendingRequests.delete(id)
        }
        return
      }
      // 超时保护：30s 内没收到响应，自动放行（发送真实请求）
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          resolve({ shouldMock: false })
          pendingRequests.delete(id)
        }
      }, 30000)
    })
  }

  // ========== Fetch 拦截 ==========
  window.fetch = async function (url, options = {}) {
    const method = getMethod(url, options)
    const response = await sendMockRequest(url, method)

    if (response.shouldMock) {
      const noBody = isNoBodyStatus(response.status)
      const body = noBody ? null : JSON.stringify(response.mockData)
      const resp = new Response(body, {
        status: response.status,
        headers: response.headers
      })
      if (noBody) {
        return new Proxy(resp, {
          get(target, prop, receiver) {
            if (prop === 'json') return async () => null
            if (prop === 'text') return async () => ''
            return Reflect.get(target, prop, receiver)
          }
        })
      }
      return resp
    }

    return originalFetch.apply(this, arguments)
  }

  function statusTextFrom(code) {
    const map = {
      101: 'Switching Protocols',
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      205: 'Reset Content',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    }
    return map[code] || 'OK'
  }

  function isNoBodyStatus(code) {
    return code === 101 || code === 204 || code === 205 || code === 304
  }
  // ========== XMLHttpRequest 拦截 ==========
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._mockMethod = method.toUpperCase()
    this._mockUrl = url
    return originalXHROpen.apply(this, [method, url, ...rest])
  }

  XMLHttpRequest.prototype.send = async function () {
    const method = this._mockMethod || 'GET'
    const url = this._mockUrl

    if (!url) {
      return originalXHRSend.apply(this, arguments)
    }

    const response = await sendMockRequest(url, method)

    if (response.shouldMock) {
      Object.defineProperty(this, 'readyState', { writable: true, value: 4 })
      Object.defineProperty(this, 'status', { writable: true, value: response.status })
      Object.defineProperty(this, 'statusText', {
        writable: true,
        value: statusTextFrom(response.status)
      })

      const noBody = isNoBodyStatus(response.status)
      const bodyStr = noBody
        ? ''
        : typeof response.mockData === 'string'
          ? response.mockData
          : JSON.stringify(response.mockData)

      Object.defineProperty(this, 'responseText', { writable: true, value: bodyStr })
      Object.defineProperty(this, 'response', {
        writable: true,
        value:
          this.responseType === 'json'
            ? noBody
              ? null
              : typeof response.mockData === 'string'
                ? JSON.parse(response.mockData)
                : response.mockData
            : bodyStr
      })

      Object.defineProperty(this, 'responseURL', { writable: true, value: url })

      setTimeout(() => {
        if (typeof this.onreadystatechange === 'function') this.onreadystatechange()
        if (typeof this.onload === 'function') this.onload()
        if (typeof this.onloadend === 'function') this.onloadend()
      }, 0)

      return
    }

    return originalXHRSend.apply(this, arguments)
  }
}

init()
