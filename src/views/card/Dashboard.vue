<!-- src/views/card/Dashboard.vue -->
    <template>
      <div class="dashboard-container">
        
        <!-- 1. 顶部日期筛选 -->
        <el-card shadow="never" class="filter-card">
          <el-form :inline="true">
            <el-form-item label="统计时间:">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-value="[new Date('2025-11-09'), new Date('2025-11-16')]"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 2. 数据概览卡片 -->
        <!-- 
          我们用 el-row 和 el-col 来创建一个 7 列的栅格布局
          :span="Math.floor(24 / 7)" 是一个小技巧, 让 7 个卡片均分
        -->
        <el-row :gutter="20" class="summary-cards">
          <el-col v-for="item in summaryData" :key="item.title" :span="Math.floor(24 / 7)">
            <el-card shadow="hover" class="summary-card">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">{{ item.value }}</div>
              <div class="card-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 3. 数据趋势图 -->
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>数据趋势</span>
            </div>
          </template>
          <!-- 
            ECharts 图表组件
            :option="lineChartOptions" 绑定了我们的图表配置
            autoresize 会让图表在窗口变化时自动重设大小
          -->
          <v-chart class="chart" :option="lineChartOptions" autoresize />
        </el-card>
<el-row :gutter="20" class="ranking-section">
      
      <el-col :span="12">
        <el-card shadow="never" class="ranking-card blue-theme">
          <template #header>
            <div class="ranking-header">
              <span class="ranking-title">个人名片分享排行榜</span>
              <div class="ranking-tabs">
                <span 
                  v-for="tab in ['分享次数', '被访问次数', '登录次数']" 
                  :key="tab"
                  :class="{ active: activeRankTab === tab }"
                  @click="activeRankTab = tab"
                >
                  {{ tab }}
                </span>
              </div>
            </div>
            <div class="ranking-filter">
              <el-input 
                v-model="rankSearchLeft" 
                placeholder="请搜索部门..." 
                
                class="rank-input"
              />
              <el-date-picker
                v-model="rankDateLeft"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                class="rank-date"
              />
              <el-button link type="primary">导出全部</el-button>
            </div>
          </template>

          <div class="ranking-list">
            <div 
              v-for="(item, index) in personRankData" 
              :key="index" 
              class="ranking-item"
            >
              <div class="rank-badge" :class="'rank-' + (index + 1)">
                No.{{ index + 1 }}
              </div>
              
              <div class="rank-info">
                <span class="rank-main-text">{{ item.department }}</span>
                <span class="rank-sub-text">{{ item.name }}</span>
              </div>
              
              <div class="rank-value">
                分享次数: <span class="num">{{ item.count }}</span> 次
              </div>
            </div>
          </div>

          <el-pagination 
            layout="prev, pager, next, sizes" 
            :total="140" 
            small 
            class="rank-pagination"
          />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="ranking-card orange-theme">
          <template #header>
            <div class="ranking-header">
              <span class="ranking-title">行业产品查看排行榜</span>
            </div>
            <div class="ranking-filter">
              <el-input 
                v-model="rankSearchRight" 
                placeholder="请搜索产品..."
                class="rank-input"
              />
              <el-date-picker
                v-model="rankDateRight"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                class="rank-date"
              />
              <el-button link type="primary">导出全部</el-button>
            </div>
          </template>

          <div class="ranking-list">
             <div 
              v-for="(item, index) in productRankData" 
              :key="index" 
              class="ranking-item"
            >
              <div class="rank-badge" :class="'rank-' + (index + 1)">
                No.{{ index + 1 }}
              </div>
              <div class="rank-info">
                <span class="rank-main-text">{{ item.category }}</span>
                <span class="rank-sub-text">{{ item.productName }}</span>
              </div>
              <div class="rank-value">
                查看次数: <span class="num">{{ item.count }}</span> 次
              </div>
            </div>
          </div>

          <el-pagination 
            layout="prev, pager, next" 
            :total="60" 
            small 
            class="rank-pagination"
          />
        </el-card>
      </el-col>

    </el-row>
      </div>
    </template>

    <script setup lang="ts">
    import { ref } from 'vue'
    // 1. 导入 vue-echarts 组件
    import VChart from 'vue-echarts'
    
    // 2. 导入 ECharts 核心模块和所需组件
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { LineChart } from 'echarts/charts'
    import {
      GridComponent,
      TooltipComponent,
      LegendComponent,
      TitleComponent,
    } from 'echarts/components'
    
    // 3. 导入 Element Plus 图标
    import { User, View, Pointer, Promotion, Files, Reading, DataLine } from '@element-plus/icons-vue'

    // 4. 注册 ECharts 组件
    use([
      CanvasRenderer,
      LineChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
      TitleComponent,
    ])

    // 5. 【对接预留】顶部日期范围的数据
  
    const dateRange = ref([new Date('2025-11-09'), new Date('2025-11-16')])

    // 6. 【对接预留】7 个卡片的数据
    const summaryData = ref([
      { title: '累计加入名片人数', value: 199, icon: User },
      { title: '登录人数', value: 14, icon: User },
      { title: '登录次数', value: 52, icon: Pointer },
      { title: '分享名片人数', value: 12, icon: Promotion },
      { title: '分享名片次数', value: 51, icon: Promotion },
      { title: '名片被访问次数', value: 95, icon: View },
      { title: '产品被查看次数', value: 75, icon: Reading },
    ])

    // 7. 【对接预留】ECharts 图表配置
    // 这就是那张趋势图的“图纸”
    const lineChartOptions = ref({
      tooltip: {
        trigger: 'axis', // 鼠标悬浮时显示提示
      },
      legend: {
        data: ['累计加入名片人数', '登录人数', '登录次数', '分享名片人数', '分享名片次数', '名片被访问次数', '产品被查看次数'],
        bottom: 0, // 图例显示在底部
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%', // 调整网格底部, 给 legend 留空间
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2025-11-09', '2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13', '2025-11-14', '2025-11-15', '2025-11-16'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '累计加入名片人数', // 这个 name 必须和 legend 里的 data 对应
          type: 'line',
          smooth: true, // 平滑曲线
          // areaStyle: {}, // 填充区域样式
          data: [130, 132, 131, 134, 150, 180, 210, 208], // 模拟数据
          // 设置线条和区域的颜色
          itemStyle: { color: '#5470C6' },
          areaStyle: { color: 'rgba(84, 112, 198, 0.2)' }
        },
      ],
    })
    // --- 【新增】排行榜相关数据 ---
const activeRankTab = ref('分享次数')
const rankSearchLeft = ref('')
const rankDateLeft = ref([new Date('2025-01-01'), new Date('2025-11-21')])

const rankSearchRight = ref('')
const rankDateRight = ref([new Date('2025-01-01'), new Date('2025-11-21')])
// 左侧列表模拟数据
const personRankData = ref([
  { department: '公司领导', name: '张春', count: 69 },
  { department: '政企客户部', name: '王蓝鹰', count: 47 },
  { department: '校园客户中心', name: '邹竞波', count: 40 },
  { department: '公司领导', name: '黄春明', count: 36 },
  { department: '云中台 (天翼云四...)', name: '王筱宏', count: 16 },
  { department: '政企客户部', name: '张谦', count: 16 },
  { department: '云中台 (天翼云四...)', name: '郭进宣', count: 13 },
])

// 右侧列表模拟数据
const productRankData = ref([
  { category: '软研开发中心', productName: '达州软研中心', count: 77 },
  { category: '大数据', productName: '交通大数据', count: 52 },
  { category: '量子通信', productName: '量子安全云...', count: 30 },
  { category: '大数据', productName: '旅游大数据', count: 22 },
  { category: '软研开发中心', productName: '低空经济', count: 18 },
  { category: '天翼云', productName: '云电脑', count: 16 },
  { category: '大数据', productName: '翼点触达', count: 16 },
])

    </script>

    <style scoped>
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 20px; /* 模块之间的间距 */
    }

    .filter-card {
      padding-bottom: 0;
    }
    :deep(.filter-card .el-card__body) {
      padding-bottom: 0;
    }
    :deep(.el-form-item) {
      margin-bottom: 18px; /* 修复 el-form-item 默认的下边距 */
    }

    .summary-cards {
      /* 这里用 CSS Grid 也可以实现, 但 el-row 更直观
        如果 7 列在小屏幕上不好看, 我们可以用媒体查询调整
      */
    }
    .summary-card {
      position: relative;
      height: 120px;
    }
    .card-title {
      font-size: 14px;
      color: #666;
    }
    .card-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin-top: 10px;
    }
    .card-icon {
      position: absolute;
      right: 20px;
      bottom: 20px;
      font-size: 50px;
      color: #f0f2f5;
    }

    .chart-card {
      height: 450px;
    }
    .chart {
      height: 380px; /* 给卡片 header 留出一些空间 */
      width: 100%;
    }


    /* --- 【新增】排行榜样式 --- */

/* 头部 Header */
.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.ranking-title {
  font-size: 16px;
  font-weight: bold;
}
/* 简单的 Tab 切换 */
.ranking-tabs span {
  font-size: 13px;
  color: #666;
  margin-left: 15px;
  cursor: pointer;
}
.ranking-tabs span.active {
  color: #409eff;
  font-weight: bold;
}

/* 筛选栏 */
.ranking-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.rank-input { width: 150px; }
.rank-date { width: 240px; }

/* 列表容器 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 380px; /* 保证高度一致 */
}

/* 每一行 */
.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 4px;
}

/* 蓝色主题背景 (左侧) */
.blue-theme .ranking-list .ranking-item:nth-child(odd) {
  background-color: #f0f9ff; /* 浅蓝条纹 */
}
.blue-theme .ranking-list .ranking-item:nth-child(even) {
  background-color: #ffffff;
}

/* 橙色主题背景 (右侧) */
.orange-theme .ranking-list .ranking-item:nth-child(odd) {
  background-color: #fffbf0; /* 浅米色条纹 */
}
.orange-theme .ranking-list .ranking-item:nth-child(even) {
  background-color: #ffffff;
}

/* 排名 Badge No.1/2/3 */
.rank-badge {
  font-style: italic;
  font-weight: bold;
  margin-right: 20px;
  color: #666;
  font-size: 14px;
}
.rank-1 { color: #fff; background: #ff9a2e; padding: 2px 8px; border-radius: 4px 0 4px 0; }
.rank-2 { color: #fff; background: #aeb5c2; padding: 2px 8px; border-radius: 4px 0 4px 0; }
.rank-3 { color: #fff; background: #d68f63; padding: 2px 8px; border-radius: 4px 0 4px 0; }

/* 内容信息 */
.rank-info {
  flex-grow: 1; /* 撑开中间 */
  display: flex;
  gap: 20px;
}
.rank-main-text { font-size: 14px; color: #333; width: 120px; }
.rank-sub-text { font-size: 14px; color: #333; font-weight: bold; }

/* 数值 */
.rank-value {
  color: #666;
  font-size: 13px;
}
.rank-value .num {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
  margin: 0 4px;
}

/* 分页居中 */
.rank-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
    </style>