import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

// 这里创建一个新的 axios 实例
const axiosInstance = axios.create()

// 创建 MockAdapter 实例
const mock = new MockAdapter(axiosInstance)

// 模拟 GET 请求
mock.onGet('/api/users').reply(200, {
  users: [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' }
  ]
})

// 你可以添加更多的模拟请求
// mock.onGet('/api/some-endpoint').reply(200, { ... });

export default axiosInstance
