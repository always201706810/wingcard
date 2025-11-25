<template>
  <el-container class="layout-container">

    <el-header class="header">
      <div class="header-logo">
        <!-- <img src="/logo.svg" alt="logo" class="logo-img" /> -->
        <span class="logo-title">翼享名片</span>
      </div>
      <div class="header-right">
        <el-icon><Search /></el-icon>
        <el-icon><QuestionFilled /></el-icon>
        <el-dropdown>
          <span class="user-info">
            中国电信股份有限公司达州... (ctdz) <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          active-text-color="#409eff"
          background-color="#ffffff"
          text-color="#303133"
          :default-active="activeMenu1"
          :router="true" 
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
        <router-view></router-view>
      </el-main>
    </el-container>

  </el-container>
</template>

<script setup lang="ts">
// 导入所有需要的图标
import { 
  Search, 
  QuestionFilled, 
  ArrowDown, 
  Tickets, 
  Setting 
} from '@element-plus/icons-vue'
import { computed } from 'vue' 
import { useRoute } from 'vue-router' 

const route = useRoute()


const activeMenu1 = computed(() => route.path)

</script>

<style scoped>
.layout-container {
  height: 100vh; /* 占满整个屏幕高度 */
}

/* 顶部样式 */
.header {
  background-color: #409eff; 
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.header-logo {
  display: flex;
  align-items: center;
}
.logo-img {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}
.logo-title {
  font-size: 20px;
  font-weight: bold;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px; /* 图标和文字的间距 */
}
.user-info {
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
}
.el-menu {
  border-right: none; /* 移除 el-menu 默认的右边框 */
}

/* 内容区样式 */
.main-content {
  background-color: #f4f7f9; /* 一个浅灰色背景 */
  padding: 20px;
}
</style>