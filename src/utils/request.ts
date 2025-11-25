// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const service = axios.create({
  // 从 对接.docx 看来，你需要填入后端提供的 IP
  // baseURL: 'http://192.168.x.x:8080/api', // TODO: 请替换为实际后端地址
  
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
})

// 2. 请求拦截器 (自动带 Token)
service.interceptors.request.use(
  (config) => {
    // 假设登录后 token 存在 localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 3. 响应拦截器 (统一处理 code)
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 对接文档约定: code 200 表示成功
    if (res.code !== 200) {
      ElMessage.error(res.msg || '系统错误')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res.data // 直接返回 data 部分
  },
  (error) => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service