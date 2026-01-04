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
            <div class="verify-code-img" @click="refreshCode">
              <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" title="点击刷新" />
              <span v-else>加载中...</span>
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login, getCaptcha } from '../types/api'


import { encryptPassword } from '../utils/encrypt'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 验证码图片 Base64
const captchaUrl = ref('')

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  verifyCode: '', // 用户输入的验证码
  captchaId: '',  // 后端返回的验证码ID (隐藏字段)
  rememberMe: false
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
})

// 1. 获取/刷新验证码
const refreshCode = async () => {
  try {
    const res: any = await getCaptcha()
    
    // 【核心修改】拦截器已经剥壳，res 直接就是 data 对象
    if (res && res.captcha_image) {
      captchaUrl.value = res.captcha_image
      loginForm.captchaId = res.captcha_id
    }
  } catch (error) {
    console.error('验证码获取失败', error)
    // ElMessage.error('验证码获取失败') // request.ts 通常已处理错误提示
  }
}

// 页面加载时，先获取一次验证码
onMounted(() => {
  refreshCode()
})

// 2. 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 🔥【关键修改】对密码进行加密
        // 后端解密逻辑：Base64解码 -> 提取前16位IV -> 解密剩余部分
        const encryptedPwd = encryptPassword(loginForm.password)
        
        // 调试：可以在控制台看看加密后的样子，应该是一串很长的乱码
        console.log('加密后的密码:', encryptedPwd)

        const res: any = await login({
          user_account: loginForm.username,
          user_password: encryptedPwd, // 传加密后的密码
          captcha_id: loginForm.captchaId,
          captcha_code: loginForm.verifyCode, 
          remember_me: loginForm.rememberMe   
        })

        if (res && res.jwt_token) {
          localStorage.setItem('token', res.jwt_token)
          if (res.user_info) {
            localStorage.setItem('userInfo', JSON.stringify(res.user_info))
          }
          ElMessage.success('登录成功')
          router.push('/system/info')
        }
      } catch (error) {
        refreshCode()
        loginForm.verifyCode = ''
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
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
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
  cursor: pointer;
  overflow: hidden;
}
.verify-code-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>