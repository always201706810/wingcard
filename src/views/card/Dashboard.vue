<template>
  <div class="dashboard-container">
    
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="统计时间:">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchDashboardData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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

    <el-card shadow="never" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>数据趋势</span>
        </div>
      </template>
      <v-chart class="chart" :option="lineChartOptions" autoresize />
    </el-card>

    <el-row :gutter="20" class="ranking-section">
      <el-col :span="12">
        <el-card shadow="never" class="ranking-card blue-theme">
          <template #header>
            <div class="ranking-header">
              <span class="ranking-title">个人名片分享排行榜</span>
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
                <span class="rank-main-text">{{ item.department_name }}</span>
                <span class="rank-sub-text">{{ item.user_name }}</span>
              </div>
              <div class="rank-value">
                分享次数: <span class="num">{{ item.share_count }}</span> 次
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="ranking-card orange-theme">
          <template #header>
            <div class="ranking-header">
              <span class="ranking-title">行业产品查看排行榜</span>
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
                <span class="rank-main-text">{{ item.category_name }}</span>
                <span class="rank-sub-text">{{ item.product_name }}</span>
              </div>
              <div class="rank-value">
                查看次数: <span class="num">{{ item.view_count }}</span> 次
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { User, View, Pointer, Promotion, Files, Reading } from '@element-plus/icons-vue'
import { getDashboardStats, getDashboardTrend, getRankPerson, getRankProduct } from '../../types/api'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const dateRange = ref([new Date(), new Date()])

// 统计卡片数据 (初始值为0)
const summaryData = ref([
  { title: '累计加入名片人数', value: 0, icon: User, key: 'total_users' },
  { title: '登录人数', value: 0, icon: User, key: 'login_users' },
  { title: '登录次数', value: 0, icon: Pointer, key: 'login_count' },
  { title: '分享名片人数', value: 0, icon: Promotion, key: 'share_users' },
  { title: '分享名片次数', value: 0, icon: Promotion, key: 'share_count' },
  { title: '名片被访问次数', value: 0, icon: View, key: 'view_count' },
  { title: '产品被查看次数', value: 0, icon: Reading, key: 'product_view_count' },
])

const personRankData = ref<any[]>([])
const productRankData = ref<any[]>([])

const lineChartOptions = ref({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] }, // 动态填充
  yAxis: { type: 'value' },
  series: [{ name: '访问量', type: 'line', smooth: true, data: [], itemStyle: { color: '#5470C6' } }]
})

const fetchDashboardData = async () => {
  try {
    // 1. 获取统计卡片
    const stats: any = await getDashboardStats()
    if (stats) {
      summaryData.value.forEach(item => {
        // 根据 key 动态赋值
        if (stats[item.key] !== undefined) {
          item.value = stats[item.key]
        }
      })
    }

    // 2. 获取趋势图
    const trend: any = await getDashboardTrend()
if (trend) {
      // 这里的 xAxis 和 series[0] 可能会报 undefined，加 as any 强行赋值
      (lineChartOptions.value.xAxis as any).data = trend.dates || [];
      (lineChartOptions.value.series as any)[0].data = trend.values || [];
    }

    // 3. 获取排行榜
    const pRank: any = await getRankPerson()
    personRankData.value = pRank || []

    const prodRank: any = await getRankProduct()
    productRankData.value = prodRank || []

  } catch (error) {
    console.error('获取看板数据失败', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* 复用原有的样式 */
.dashboard-container { display: flex; flex-direction: column; gap: 20px; }
.filter-card { padding-bottom: 0; }
:deep(.filter-card .el-card__body) { padding-bottom: 0; }
:deep(.el-form-item) { margin-bottom: 18px; }
.summary-card { position: relative; height: 120px; }
.card-title { font-size: 14px; color: #666; }
.card-value { font-size: 28px; font-weight: bold; color: #333; margin-top: 10px; }
.card-icon { position: absolute; right: 20px; bottom: 20px; font-size: 50px; color: #f0f2f5; }
.chart-card { height: 450px; }
.chart { height: 380px; width: 100%; }

/* 排行榜样式 */
.ranking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.ranking-title { font-size: 16px; font-weight: bold; }
.ranking-list { display: flex; flex-direction: column; gap: 10px; min-height: 380px; }
.ranking-item { display: flex; align-items: center; padding: 12px 15px; border-radius: 4px; }
.blue-theme .ranking-list .ranking-item:nth-child(odd) { background-color: #f0f9ff; }
.orange-theme .ranking-list .ranking-item:nth-child(odd) { background-color: #fffbf0; }
.rank-badge { font-style: italic; font-weight: bold; margin-right: 20px; color: #666; font-size: 14px; }
.rank-1 { color: #fff; background: #ff9a2e; padding: 2px 8px; border-radius: 4px 0 4px 0; }
.rank-2 { color: #fff; background: #aeb5c2; padding: 2px 8px; border-radius: 4px 0 4px 0; }
.rank-3 { color: #fff; background: #d68f63; padding: 2px 8px; border-radius: 4px 0 4px 0; }
.rank-info { flex-grow: 1; display: flex; gap: 20px; }
.rank-main-text { font-size: 14px; color: #333; width: 120px; }
.rank-sub-text { font-size: 14px; color: #333; font-weight: bold; }
.rank-value { color: #666; font-size: 13px; }
.rank-value .num { color: #409eff; font-weight: bold; font-size: 16px; margin: 0 4px; }
</style>