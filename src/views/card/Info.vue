<!-- src/views/card/Info.vue -->
    <template>
      <el-card shadow="never">
        
        <!-- 1. 顶部搜索表单 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="姓名:">
            <el-input v-model="searchForm.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="微信手机号:">
            <el-input v-model="searchForm.phone" placeholder="请输入微信手机号" />
          </el-form-item>
          <el-form-item label="邮箱:">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search">搜索</el-button>
            <el-button :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 2. 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" :icon="Plus" @click="openDialog">新增</el-button>
          <el-button type="success" :icon="Download" @click="handleImport">导入</el-button>
        </div>

        <!-- 3. 数据表格 -->
        <el-table :data="tableData" style="width: 100%" border>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="wechatPhone" label="微信手机号" width="150" />
          <el-table-column prop="displayPhone" label="名片显示号码" width="150" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="zipCode" label="邮编" width="100" />
          <el-table-column prop="department" label="部门和职位" min-width="200" />
          <el-table-column prop="address" label="办公地址" min-width="200" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default>
              <el-button link type="primary" :icon="Edit">修改</el-button>
              <el-button link type="danger" :icon="Delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 4. 分页组件 -->
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination-container"
        />
<el-dialog v-model="dialogVisible" title="新增名片信息" width="600px">
      <el-form :model="formData" label-width="110px">
        
        <el-form-item label="姓名" required>
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信手机号" required>
              <el-input v-model="formData.wechatPhone" placeholder="用于登录验证" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示号码">
              <el-input v-model="formData.displayPhone" placeholder="对外展示号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="电子邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="所属部门" required>
           <el-input v-model="formData.department" placeholder="请选择部门 (暂时手填)" />
        </el-form-item>
        
        <el-form-item label="办公地址">
          <el-input v-model="formData.address" type="textarea" />
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存名片</el-button>
        </span>
      </template>
    </el-dialog>
      </el-card>
    </template>

    <script setup lang="ts">
    import { ref } from 'vue'
    // 导入图标
    import { Search, Refresh, Plus, Download, Edit, Delete } from '@element-plus/icons-vue'
    import type {CardInfo} from '../../types/api'
    // 1. 【对接预留】搜索表单的数据
    const searchForm = ref({
      name: '',
      phone: '',
      email: ''
    })
    //改进
    // const searchForm = ref<CardInfo[]>()


    // 2. 【对接预留】表格的模拟数据
    const tableData = ref<CardInfo[]>([
      { id: '1', name: '张三', wechatPhone: '11111111111', displayPhone: '11111111111', email: '11111111111@...', zipCode: '635000', department: '总经理', address: '达州市通川区' },
      { id: '2', name: '邓代孤', wechatPhone: '11111111111', displayPhone: '11111111111', email: '11111111111@...', zipCode: '635000', department: '副总经理', address: '达州市通川区' },
    ])

    // 3. 【对接预留】分页数据

    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 199 
    })

    // 4. 【对接预留】分页事件处理
    // 切换每页显示条数
    const handleSizeChange = (newSize: number) => {
      console.log(`每页 ${newSize} 条`)
      pagination.value.pageSize = newSize
      // TODO: 在这里重新请求 API 获取数据
    }
    // 切换当前页
    const handleCurrentChange = (newPage: number) => {
      console.log(`当前页: ${newPage}`)
      pagination.value.currentPage = newPage
      // TODO: 在这里重新请求 API 获取数据
    }
    const dialogVisible = ref(false)

    const formData = ref<CardInfo>({
      id: '',
      name: '',
      wechatPhone: '',
      displayPhone: '',
      email: '',
      zipCode: '',
      department: '',
      address: ''
    })

    const openDialog =() =>{
      // 重置表单
  formData.value = {
    id: '',
    name: '',
    wechatPhone: '',
    displayPhone: '',
    email: '',
    zipCode: '',
    department: '',
    address: ''
  }
    dialogVisible.value = true
    }
    const handleSubmit = () => {
  console.log('保存名片：', formData.value)
  
  // 模拟保存
  tableData.value.unshift({
    ...formData.value,
    id: Date.now().toString()
  })
  
  dialogVisible.value = false
}
    // 5. 【对接预留】按钮点击事件
    const handleCreate = () => {
      console.log('点击了新增')
    }
    const handleImport = () => {
      console.log('点击了导入')
    }
    </script>

    <style scoped>
    .search-form .el-form-item {
      margin-bottom: 20px;
    }
    .action-buttons {
      margin-bottom: 20px;
    }
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end; 
    }
    </style>