<template>
  <div class="login-container">
    
    <!-- <div class="login-left">
      <div class="welcome-box">
        <img src="/logo.svg" alt="Logo" class="welcome-logo"> <h1 class="welcome-title">欢迎使用翼享名片系统</h1>
        <p class="welcome-desc">（这是左侧的示意图区域）</p>
      </div>
    </div> -->

    <div class="login-right">
      <el-form ref="loginFormRef" :model="loginForm" class="login-form">
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
            <div class="verify-code-img">m0DG</div>
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
// 1. 逻辑层：从 vue 导入 ref，用于创建“响应式数据”
import { ref } from 'vue'
// 2. 导入 Element Plus 的图标
import { User, Lock, Picture } from '@element-plus/icons-vue'
// 3. 导入 Element Plus 的 Form 相关类型 (可选, 但更规范)
import type { ElForm } from 'element-plus'

import { useRouter } from 'vue-router'
// import type { LoginForm } from '../types/api'


const router = useRouter()

// 4. 【对接预留】
// 我们把表单所有的数据都放在一个 ref 对象里
// 这样将来发给后端时, 直接发送 loginForm.value 即可
const loginForm = ref({
  username: '',
  password: '',
  verifyCode: '',
  rememberMe: false
})

// 改进：

// const loginForm = ref();

// 5. 【对接预留】
// 这是点击“登录”按钮时会执行的函数
const handleLogin = () => {
  console.log('用户尝试登录，表单数据：', loginForm.value)
  
  // TODO: 对接后端
  // 将来我们只需要在这里写 API 请求, 比如:
  //
  // try {
  //   const response = await api.login(loginForm.value);
  //   if (response.code === 200) {
  //     // 登录成功, 保存 token, 跳转到首页
  //   } else {
  //     // 登录失败, 弹出错误提示
  //   }
  // } catch (error) {
  //   // 网络错误
  // }
  router.push('/system')
}
</script>

<style scoped>
/* 3. 样式层：scoped 意味着这里的样式只对这个文件生效 */

.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
}

/* 左侧样式 */
.login-left {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff; /* 按照截图, 左侧是白色背景 */
  /* 这里可以加你截图里的那个蓝色插画作为背景图 */
}
.welcome-box {
  text-align: center;
}
.welcome-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}
.welcome-title {
  font-size: 28px;
  color: #333;
}
.welcome-desc {
  font-size: 16px;
  color: #999;
}

/* 右侧样式 */
.login-right {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5; /* 右侧是浅灰背景 */
}

/* 表单样式 */
.login-form {
  width: 350px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
}

.verify-code-row {
  display: flex;
  width: 100%;
}
.verify-code-input {
  flex-grow: 1; /* 输入框占满剩余空间 */
  margin-right: 10px;
}
.verify-code-img {
  width: 80px;
  height: 40px;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  letter-spacing: 2px;
  cursor: pointer;
  border-radius: 4px;
}
</style>