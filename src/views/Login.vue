<template>
  <div class="login-container">
    <div class="login-right">
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <h2 class="login-title">系统登录</h2>

        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入登录账号" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入登录密码" 
            show-password
            :prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin" 
          />
        </el-form-item>

        <el-form-item prop="verifyCode">
          <div class="verify-code-row">
            <el-input 
              v-model="loginForm.verifyCode" 
              placeholder="请输入验证码"
              :prefix-icon="Picture"
              size="large"
              class="verify-code-input"
            />
            <div class="verify-code-img" @click="refreshCode">m0DG</div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button" 
            size="large" 
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
// 引入 API
import { login } from '../types/api'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  verifyCode: '',
  rememberMe: false
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 刷新验证码 (预留)
const refreshCode = () => {
  ElMessage.info('后端验证码接口开发中')
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 1. 调用登录接口 (注意字段映射：前端 username -> 后端 user_account)
        const res: any = await login({
          user_account: loginForm.username,
          user_password: loginForm.password
        })

        // 2. 登录成功处理
        // 假设 res 结构是 { token: '...', user_info: { user_name: '...', ... } }
        if (res.token) {
          localStorage.setItem('token', res.token)
          
          // 存储用户信息，供 layout 显示名字用
          if (res.user_info) {
            localStorage.setItem('userInfo', JSON.stringify(res.user_info))
          }

          ElMessage.success('登录成功')
          router.push('/system/info') // 跳转到名片管理页
        }
      } catch (error) {
        // request.ts 会处理错误弹窗
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg'); /* 加个简单的背景纹理 */
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
}

.login-right {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  width: 380px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.05), 0 12px 48px 16px rgba(0,0,0,0.03);
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

.login-button {
  width: 100%;
  font-size: 16px;
  padding: 20px 0;
}

.verify-code-row {
  display: flex;
  width: 100%;
  align-items: center;
}
.verify-code-input {
  flex: 1;
  margin-right: 12px;
}
.verify-code-img {
  width: 100px;
  height: 40px;
  background-color: #f2f6fc;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #409eff;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
</style>