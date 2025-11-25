<template>
  <el-container class="layout-container">

    <el-header class="header">
      <div class="header-logo">
        <span class="logo-title">翼享名片管理系统</span>
      </div>
      <div class="header-right">
        <el-icon title="帮助"><QuestionFilled /></el-icon>
        
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            {{ userName }} ({{ userOrg }}) 
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="220px" class="sidebar">
        <el-menu
          active-text-color="#409eff"
          background-color="#ffffff"
          text-color="#303133"
          :default-active="activeMenu"
          :router="true"
          class="el-menu-vertical"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Tickets /></el-icon>
              <span>名片管理</span>
            </template>
            <el-menu-item index="/system/info">名片信息</el-menu-item>
            <el-menu-item index="/system/company">公司简介</el-menu-item>
            <el-menu-item index="/system/dashboard">数据看板</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>权限管理</span>
            </template>
            <el-menu-item index="/system/department">部门管理</el-menu-item>
          </el-sub-menu>

        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
             <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' 
import { useRoute, useRouter } from 'vue-router' 
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Search, 
  QuestionFilled, 
  ArrowDown, 
  Tickets, 
  Setting 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 1. 动态获取当前激活菜单
const activeMenu = computed(() => route.path)

// 2. 用户信息数据
const userName = ref('管理员')
const userOrg = ref('未知部门')

// 3. 页面加载时，从 localStorage 读取登录时存入的信息
onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      // 兼容后端返回的字段 user_name 或 userName
      userName.value = userInfo.user_name || userInfo.userName || '管理员'
      userOrg.value = userInfo.organization || userInfo.department_name || 'ctdz'
    } catch (e) {
      console.error('用户信息解析失败', e)
    }
  }
})

// 4. 下拉菜单指令处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能开发中')
  }
}

// 退出登录逻辑
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出系统吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 1. 清除 token 和用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    // 2. 跳转回登录页
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

/* 顶部 Header */
.header {
  background-color: #2b2f3a; /* 改深色，显得更专业一点 */
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
.logo-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.header-right .el-icon {
  font-size: 18px;
  cursor: pointer;
  color: #fff;
}
.user-info {
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}
.user-info:hover {
  opacity: 0.8;
}

/* 侧边栏 */
.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 8px 0 rgba(29,35,41,.05);
  z-index: 10;
}
.el-menu-vertical {
  border-right: none;
  padding-top: 10px;
}

/* 主内容区 */
.main-content {
  background-color: #f0f2f5; 
  padding: 20px;
}

/* 简单的过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>