<template>
  <el-card shadow="never">
    <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="选择名片:">
        <el-select
          v-model="searchForm.cardIds"
          placeholder="请选择名片(可多选/搜索)"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in cardOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="访问时间:">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="shortcuts"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" :icon="Download" @click="handleExport">导出记录</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" style="width: 100%" border stripe>
      <el-table-column prop="create_time" label="访问时间" width="170" sortable />
      
    <el-table-column label="被访名片" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <el-tag effect="plain">{{ scope.row.card_name }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="访客身份" min-width="180">
        <template #default="scope">
          <div style="display: flex; align-items: center;">
            <el-avatar :size="28" :src="scope.row.visitor_avatar" style="margin-right: 8px;">
              {{ scope.row.visitor_name.charAt(0) }}
            </el-avatar>
            <span>{{ scope.row.visitor_name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="location" label="地区" width="120" />
      
      <el-table-column prop="visit_type" label="行为类型" width="120" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.visit_type === 'CALL'" type="danger" effect="dark">拨打电话</el-tag>
          <el-tag v-else-if="scope.row.visit_type === 'SAVE'" type="warning" effect="dark">存入手机</el-tag>
          <el-tag v-else-if="scope.row.visit_type === 'SHARE'" type="success">分享</el-tag>
          <el-tag v-else type="info">浏览</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="content" label="详情内容" min-width="200" show-overflow-tooltip />
    </el-table>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// import { getVisitLogList } from '../../types/api'
import type { VisitLogItem } from '../../types/api'
import { getVisitLogList, getCardList } from '../../types/api'
import request from '../../utils/request'
// --- 数据定义 ---
const loading = ref(false)
const tableData = ref<VisitLogItem[]>([])
const pagination = reactive({ page: 1, size: 20, total: 0 })

// 搜索条件
// const searchForm = reactive({
//   cardId: ''
// })
// 日期范围 [start, end]
const dateRange = ref<[string, string] | null>(null)

// 日期快捷选项
const shortcuts = [
  { text: '最近24小时', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24); return [start, end] } },
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); return [start, end] } },
]

// 搜索表单数据
const searchForm = reactive({
  cardIds: [] as number[] // 改为数组
})

// 名片下拉选项列表
const cardOptions = ref<any[]>([])

// 加载名片选项（初始化时调用）
const loadCardOptions = async () => {
  try {
    // 获取所有名片(这里先取前100个作为选项，实际业务可能需要远程搜索)
    const res: any = await getCardList({ page: 1, size: 100 })
    const list = res.list || res || []
    cardOptions.value = list.map((item: any) => ({
      label: item.card_name, // 显示名字
      value: item.card_id    // 存ID
    }))
  } catch (e) {
    console.error(e)
  }
}



// --- 核心逻辑 ---
const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getVisitLogList({
      page: pagination.page,
      size: pagination.size,
      // 传递数组
      card_ids: searchForm.cardIds, 
      start_time: dateRange.value ? dateRange.value[0] : undefined,
      end_time: dateRange.value ? dateRange.value[1] : undefined
    })

    if (res && res.list) {
      tableData.value = res.list
      pagination.total = res.total
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
    loadCardOptions() // 🔥 先加载下拉选项
    fetchData()
})

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.cardIds = []
  dateRange.value = null
  handleSearch()
}

const handleExport = async () => {
  ElMessage.success('正在准备导出...')
  
  try {
    // 🔥 关键配置：responseType: 'blob'
    const res = await request.get('/visit/export', {
      params: {
        card_ids: searchForm.cardIds,
        start_time: dateRange.value ? dateRange.value[0] : undefined,
        end_time: dateRange.value ? dateRange.value[1] : undefined
      },
      responseType: 'blob' // 告诉 axios 返回的是二进制流
    })

    // ⬇️ 以下是通用的“浏览器触发下载”代码
    const blob = new Blob([res as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `访客记录_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(link.href)
    
  } catch (error) {
    console.error('导出失败', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.search-form .el-form-item { margin-bottom: 20px; }
</style>