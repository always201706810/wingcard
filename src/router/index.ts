// src/router/index.ts
    import { createRouter, createWebHistory } from 'vue-router'

    // 1. 导入我们创建的组件
    import Login from '../views/Login.vue'
    import Layout from '../layout/index.vue'
    import Department from '../views/auth/Department.vue'
    import Company from '../views/card/Company.vue'
    import Dashboard from '../views/card/Dashboard.vue'
    import Info from '../views/card/Info.vue'
    // 2. 定义路由规则
    const routes = [
      {
        path: '/login', // 路径设为 /login
        name: 'Login',
        component: Login
      },
      {
        path: '/', 
        redirect: '/login' 
      },
      {
        path: '/system',
        name: 'Layout',
        component: Layout,
        redirect: '/system/dashboard', 
        children: [
          {
            path: '/system/department',
            name: 'Department',
            component: Department
          },
          {
            path: '/system/company',
            name: 'Company',
            component: Company
          },
          {
            path: '/system/dashboard',
            name: 'Dashboard',
            component: Dashboard
          },
                    {
            path: '/system/info',
            name: 'Info',
            component: Info
          }
          // TODO: 在这里为其他页面 (名片信息、公司简介等) 添加路由
        ]
      }
    ]

    // 3. 创建路由实例
    const router = createRouter({
      history: createWebHistory(), 
      routes: routes 
    })

    // 4. 导出路由
    export default router