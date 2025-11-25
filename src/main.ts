// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'

// createApp(App).mount('#app')


import { createApp } from 'vue'

// 1. 导入 Element Plus
import ElementPlus from 'element-plus'
// 2. 导入 Element Plus 的 CSS 样式文件
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// 3. 创建 Vue 应用实例
const app = createApp(App)

// 4. 全局注册 Element Plus
app.use(ElementPlus)
// 2. 告诉 Vue "使用" 我们的路由
app.use(router) 

// 5. 挂载应用
app.mount('#app')

