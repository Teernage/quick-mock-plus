import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

interface ServerResponse<T = any> {
  code: number
  msg: string
  data: T
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 10000
})

const SUCCESS_CODE = 0

/**
 * 异步获取有效的令牌
 *
 */
async function fetchToken(): Promise<string | null> {
  return null
}

// axios实例拦截请求
service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token: string | null = await fetchToken()

    // 如果重试后仍然没有 token，可以选择继续请求或拒绝请求
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    } else {
      console.error('登录已过期，请重新登录')
      return Promise.reject(new Error('No valid authentication token available'))
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// axios实例拦截响应
service.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (response.status === 200) {
      return response
    }
    return response
  },
  // 请求失败
  async (error: any) => {
    const { response } = error
    if (response) {
      return Promise.reject(response)
    }
  }
)

// 因为使用了interceptors，这里纯粹是为了使得typescript能够识别最终的返回结果
// 如果在interceptors里处理，会使得typescript无法识别
export function handleResponse<T>(promise: Promise<AxiosResponse<ServerResponse<T>>>): Promise<T> {
  return promise
    .then(function (res: AxiosResponse<ServerResponse<T>>) {
      if (res.data.code === SUCCESS_CODE) {
        return res.data.data
      }
      return Promise.reject(res)
    })
    .catch((error: AxiosError) => {
      return Promise.reject(error)
    })
}

export default service
