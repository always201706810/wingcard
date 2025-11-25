<template>
  <el-card shadow="never">
    
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
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="action-buttons">
      <el-button type="primary" :icon="Plus" @click="openDialog">新增</el-button>
      <el-button type="success" :icon="Download" @click="handleImport">导入</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%" border>
      <el-table-column prop="card_name" label="姓名" width="100" />
      <el-table-column prop="card_wechat" label="微信手机号" width="130" />
      <el-table-column prop="card_phone" label="名片显示号码" width="130" />
      <el-table-column prop="card_email" label="邮箱" width="180" show-overflow-tooltip />
      
      <el-table-column label="部门和职位" min-width="200">
        <template #default="scope">
          <div v-if="scope.row.organizations && scope.row.organizations.length > 0">
            <div v-for="(org, idx) in scope.row.organizations" :key="idx" class="table-org-item">
              <el-tag size="small" effect="plain">{{ org.department_name }}</el-tag>
              <span class="table-org-pos">{{ org.position }}</span>
            </div>
          </div>
          <div v-else>
            <el-tag size="small" effect="plain">{{ scope.row.department_name || '未知部门' }}</el-tag>
            <span class="table-org-pos">{{ scope.row.card_position || '未知职位' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="card_address" label="办公地址" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改名片' : '新增名片'" width="650px" top="5vh">
      <el-form :model="formData" label-width="110px" ref="formRef">
        
        <el-divider content-position="left">基础信息</el-divider>
        <el-form-item label="姓名" required>
          <el-input v-model="formData.card_name" placeholder="请输入姓名" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信手机号" required>
              <el-input v-model="formData.card_wechat" placeholder="用于登录验证" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示号码">
              <el-input v-model="formData.card_phone" placeholder="对外展示号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="formData.card_email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编">
              <el-input v-model="formData.card_postcode" placeholder="请输入邮编" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="办公地址">
          <el-input v-model="formData.card_address" type="textarea" :rows="2" />
        </el-form-item>

        <el-divider content-position="left">部门与职位</el-divider>
        
        <div class="org-list-container">
          <div class="org-header">
            <span class="org-tips">请添加该名片所属的部门及对应职位（支持多部门）</span>
            <el-button type="primary" size="small" :icon="Plus" @click="openOrgDialog()">添加组织</el-button>
          </div>

          <div v-if="formData.organizations && formData.organizations.length > 0" class="org-items">
            <div v-for="(item, index) in formData.organizations" :key="index" class="org-row">
              <div class="org-info">
                <span class="org-dept-name">{{ item.department_name }}</span>
                <span class="org-divider">|</span>
                <span class="org-pos-name">{{ item.position }}</span>
              </div>
              <div class="org-actions">
                <el-button link type="primary" :icon="Edit" @click="openOrgDialog(item, index)" />
                <el-button link type="danger" :icon="Delete" @click="removeOrg(index)" />
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无组织信息，请点击上方按钮添加" :image-size="60" style="padding: 10px 0" />
        </div>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存名片</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="orgDialogVisible" 
      :title="editingOrgIndex === -1 ? '添加组织' : '编辑组织'" 
      width="400px"
      append-to-body
    >
      <el-form :model="orgForm" label-width="80px">
        <el-form-item label="所属部门" required>
          <el-tree-select
            v-model="orgForm.department_id"
            :data="departmentOptions"
            :props="{ label: 'department_name', value: 'department_id', children: 'children' }"
            placeholder="请选择部门"
            check-strictly
            style="width: 100%"
            @current-change="handleDeptChange"
          />
        </el-form-item>
        <el-form-item label="担任职位" required>
          <el-input v-model="orgForm.position" placeholder="例如：客户经理" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="orgDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOrg">确认</el-button>
        </span>
      </template>
    </el-dialog>

  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCardList, addCard, updateCard, deleteCard, getDepartmentTree } from '../../types/api'
import type { BusinessCard, OrganizationRelation, Department } from '../../types/api'

// --- 基础数据 ---
const searchForm = reactive({ name: '', phone: '', email: '' })
const tableData = ref<BusinessCard[]>([])
const loading = ref(false)
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// --- 部门树数据 (用于选择器) ---
const departmentOptions = ref<Department[]>([])

// 获取部门树
const fetchDepartments = async () => {
  try {
    const res: any = await getDepartmentTree()
    departmentOptions.value = res || []
  } catch (e) {
    console.error('获取部门树失败', e)
  }
}

// 获取名片列表
const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await getCardList({
      page: pagination.currentPage,
      size: pagination.pageSize,
      name: searchForm.name,
      phone: searchForm.phone,
      email: searchForm.email
    })
    
    // 兼容数组或对象返回
    if (Array.isArray(res)) {
      tableData.value = res
      pagination.total = res.length
    } else if (res && res.list) {
      tableData.value = res.list
      pagination.total = res.total
    } else {
      tableData.value = []
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchDepartments() // 初始化时加载部门树
})

// --- 主表单逻辑 ---
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref<BusinessCard>({
  card_name: '',
  card_wechat: '',
  card_phone: '',
  card_email: '',
  card_address: '',
  organizations: [] // 初始化为空数组
})

const openDialog = () => {
  isEdit.value = false
  formData.value = {
    card_name: '',
    card_wechat: '',
    card_phone: '',
    card_email: '',
    card_address: '',
    organizations: []
  }
  dialogVisible.value = true
}

const handleEdit = (row: BusinessCard) => {
  isEdit.value = true
  // 深拷贝，防止修改影响列表
  formData.value = JSON.parse(JSON.stringify(row))
  
  // 兼容旧数据：如果 row 没有 organizations 但有 department_id，构造一个默认的
  if ((!formData.value.organizations || formData.value.organizations.length === 0) && row.department_id) {
    formData.value.organizations = [{
      department_id: row.department_id,
      department_name: row.department_name || '未知部门',
      position: row.card_position || ''
    }]
  }
  
  dialogVisible.value = true
}

// --- 子弹窗逻辑 (组织管理) ---
const orgDialogVisible = ref(false)
const editingOrgIndex = ref(-1) // -1 表示新增，>=0 表示编辑的索引
const orgForm = ref<OrganizationRelation>({
  department_id: '',
  department_name: '',
  position: ''
})

// 打开组织弹窗
const openOrgDialog = (item?: OrganizationRelation, index: number = -1) => {
  editingOrgIndex.value = index
  if (item) {
    // 编辑现有
    orgForm.value = { ...item }
  } else {
    // 新增
    orgForm.value = { department_id: '', department_name: '', position: '' }
  }
  orgDialogVisible.value = true
}

// 树形选择器选中事件：自动填充部门名称
const handleDeptChange = (data: any) => {
  // data 是选中的节点对象（element-plus tree-select 的 current-change 事件）
  // 注意：如果 data 是 id (value)，则需要 find 查找。但 tree-select 的 current-change 通常返回节点数据
  // 如果 v-model 绑定的是 id，我们需要从 options 里找 name，或者利用 tree-select 的 label 自动显示
  // 这里简化处理：我们假设 current-change 返回了节点对象
  if (data && data.department_name) {
    orgForm.value.department_name = data.department_name
  }
}

// 保存组织信息到临时列表
const saveOrg = () => {
  if (!orgForm.value.department_id) {
    ElMessage.warning('请选择部门')
    return
  }
  if (!orgForm.value.position) {
    ElMessage.warning('请填写职位')
    return
  }

  // 再次确保 department_name 存在 (如果是从 v-model id 只有 id 的情况)
  if (!orgForm.value.department_name) {
    const findName = (nodes: Department[], id: string | number): string => {
      for (const node of nodes) {
        if (node.department_id === id) return node.department_name
        if (node.children) {
          const res = findName(node.children, id)
          if (res) return res
        }
      }
      return ''
    }
    orgForm.value.department_name = findName(departmentOptions.value, orgForm.value.department_id) || '未知部门'
  }

  if (formData.value.organizations === undefined) {
    formData.value.organizations = []
  }

  if (editingOrgIndex.value === -1) {
    // 新增
    formData.value.organizations.push({ ...orgForm.value })
  } else {
    // 修改
    formData.value.organizations[editingOrgIndex.value] = { ...orgForm.value }
  }
  
  orgDialogVisible.value = false
}

const removeOrg = (index: number) => {
  formData.value.organizations?.splice(index, 1)
}

// --- 提交保存名片 ---
const handleSubmit = async () => {
  if (!formData.value.card_name || !formData.value.card_wechat) {
    ElMessage.warning('请填写姓名和微信手机号')
    return
  }
  
  try {
    // 构造提交数据
    // 为了兼容旧的单字段后端，我们把 organizations 的第一条数据同步到 department_id 和 card_position
    const submitData = { ...formData.value }
    
    if (submitData.organizations && submitData.organizations.length > 0) {
      const primaryOrg = submitData.organizations[0]!
      submitData.department_id = primaryOrg.department_id
      submitData.department_name = primaryOrg.department_name
      submitData.card_position = primaryOrg.position

    }

    if (isEdit.value) {
      await updateCard(submitData)
      ElMessage.success('修改成功')
    } else {
      await addCard(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    // request.ts 已处理
  }
}

// 其他操作
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}
const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.email = ''
  handleSearch()
}
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchData()
}
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchData()
}
const handleDelete = (row: BusinessCard) => {
  ElMessageBox.confirm('确认删除该名片吗?', '提示', { type: 'warning' }).then(async () => {
    if (row.card_id) {
      await deleteCard(row.card_id)
      ElMessage.success('删除成功')
      fetchData()
    }
  })
}
const handleImport = () => {
  ElMessage.info('导入功能待开发')
}
</script>

<style scoped>
.search-form .el-form-item { margin-bottom: 20px; }
.action-buttons { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.table-org-item { margin-bottom: 4px; }
.table-org-item:last-child { margin-bottom: 0; }
.table-org-pos { margin-left: 8px; font-size: 12px; color: #666; }

/* 组织列表样式 */
.org-list-container {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid #e4e7ed;
}
.org-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.org-tips {
  font-size: 12px;
  color: #909399;
}
.org-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.org-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
.org-info {
  font-size: 14px;
  color: #333;
}
.org-divider {
  margin: 0 8px;
  color: #dcdfe6;
}
.org-pos-name {
  color: #606266;
  font-weight: 500;
}
</style>