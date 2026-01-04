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
      <el-button type="success" :icon="Download" @click="openImportDialog">批量导入</el-button>    </div>

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
          <div style="display: flex; width: 100%;">
            <el-input 
              v-model="formData.card_address" 
              placeholder="请输入或点击右侧按钮选择地址" 
              type="textarea" 
              :rows="2"
              style="flex-grow: 1;"
            />
            <el-button 
              type="primary" 
              plain
              :icon="Location" 
              style="margin-left: 10px; height: 52px;"
              @click="openMapDialog"
            >
              地图选点
            </el-button>
          </div>
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

    <el-dialog v-model="orgDialogVisible" :title="editingOrgIndex === -1 ? '添加组织' : '编辑组织'" width="400px" append-to-body>
      <el-form :model="orgForm" label-width="80px">
        <el-form-item label="所属部门" required>
          <el-tree-select
            v-model="orgForm.department_id"
            :data="departmentOptions"
            :props="{ label: 'department_name', value: 'department_id', children: 'children_department' }"
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

    <el-dialog 
      v-model="mapDialogVisible" 
      title="选择地址" 
      width="800px" 
      append-to-body
      destroy-on-close
    >
      <div class="map-container">
        <iframe
          id="mapPage"
          width="100%"
          height="100%"
          frameborder="0"
          allow="geolocation"
          src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=XVZBZ-SQE6Z-E6MXN-7Z776-YKON3-5QB5Y&referer=wingcard"
        ></iframe>
      </div>
    </el-dialog>
    <el-dialog v-model="importDialogVisible" title="批量导入名片" width="500px">
      <div class="import-container">
        <div class="step-box">
          <div class="step-title">第一步：下载导入模版</div>
          <div class="step-desc">请下载模版文件，按照格式填写名片信息后上传。</div>
          <el-button type="primary" link @click="downloadTemplate">
            <el-icon><Download /></el-icon> 下载模版 (.xlsx)
          </el-button>
        </div>

        <div class="step-box">
          <div class="step-title">第二步：上传填写好的文件</div>
          <el-upload
            class="upload-demo"
            drag
            :action="uploadActionUrl"
            :headers="uploadHeaders"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            :before-upload="beforeImportUpload"
            :show-file-list="false"
            accept=".xlsx, .xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 xlsx/xls 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue' // 引入 onUnmounted
import { Search, Refresh, Plus, Download, Edit, Delete, Location, View, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCardList, addCard, updateCard, deleteCard, getDepartmentTree } from '../../types/api'
import type { BusinessCard, OrganizationRelation, Department } from '../../types/api'

// --- 基础数据 ---
const searchForm = reactive({ name: '', phone: '', email: '' })
const tableData = ref<BusinessCard[]>([])
const loading = ref(false)
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const departmentOptions = ref<Department[]>([])




// --- API 交互 (fetchDepartments, fetchData) 保持不变 ---
const fetchDepartments = async () => {
  try {
    const res: any = await getDepartmentTree()
    if (res && Array.isArray(res.data)) {
      departmentOptions.value = res.data
    } else if (res && Array.isArray(res.list)) {
      departmentOptions.value = res.list
    } else if (Array.isArray(res)) {
      departmentOptions.value = res
    } else {
      departmentOptions.value = []
    }
  } catch (e) {
    console.error('获取部门树失败', e)
  }
}

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

// --- 地图选点逻辑 (新增) ---
const mapDialogVisible = ref(false)

const openMapDialog = () => {
  mapDialogVisible.value = true
}

// 监听 iframe 返回的消息
const handleMapMessage = (event: any) => {
  // 接收位置信息，为了安全最好检查 event.origin，这里简化处理
  const loc = event.data
  if (loc && loc.module === 'locationPicker') {
    console.log('地图选点结果:', loc)
    // loc 包含: lat, lng, poiaddress, poiname, cityname 等
    // 我们主要用 poiaddress 填充地址栏
    // 如果想要更精确的（例如包含店名），可以用 loc.poiname
    if (formData.value) {
      formData.value.card_address = loc.poiaddress
    }
    // 选好后自动关闭弹窗
    mapDialogVisible.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchDepartments()
  // 注册地图消息监听
  window.addEventListener('message', handleMapMessage, false)
})

onUnmounted(() => {
  // 销毁组件时移除监听
  window.removeEventListener('message', handleMapMessage)
})

// --- 弹窗与表单逻辑 (openDialog, handleEdit, handleSubmit 等) 保持不变 ---
// (为了节省篇幅，这里复用你之前的逻辑，只展示变量定义，请确保不要覆盖掉你原有的 handleEdit 等逻辑)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref<BusinessCard>({
  card_name: '',
  card_wechat: '',
  card_phone: '',
  card_email: '',
  card_address: '',
  organizations: [] 
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
  formData.value = JSON.parse(JSON.stringify(row))
  if ((!formData.value.organizations || formData.value.organizations.length === 0) && row.department_id) {
    formData.value.organizations = [{
      department_id: row.department_id,
      department_name: row.department_name || '未知部门',
      position: row.card_position || ''
    }]
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.value.card_name || !formData.value.card_wechat) {
    ElMessage.warning('请填写姓名和微信手机号')
    return
  }
  try {
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
  } catch (error) {}
}

// --- 组织弹窗逻辑 (openOrgDialog, saveOrg, removeOrg) 保持不变 ---
const orgDialogVisible = ref(false)
const editingOrgIndex = ref(-1)
const orgForm = ref<OrganizationRelation>({ department_id: '', department_name: '', position: '' })

const openOrgDialog = (item?: OrganizationRelation, index: number = -1) => {
  editingOrgIndex.value = index
  if (item) {
    orgForm.value = { ...item }
  } else {
    orgForm.value = { department_id: '', department_name: '', position: '' }
  }
  orgDialogVisible.value = true
}

const handleDeptChange = (data: any) => {
  if (data && data.department_name) {
    orgForm.value.department_name = data.department_name
  }
}

const saveOrg = () => {
  if (!orgForm.value.department_id) { ElMessage.warning('请选择部门'); return }
  if (!orgForm.value.position) { ElMessage.warning('请填写职位'); return }
  
  if (!orgForm.value.department_name) {
    const findName = (nodes: Department[], id: string | number): string => {
      for (const node of nodes) {
        if (node.department_id === id) return node.department_name
        if (node.children_department) {
          const res = findName(node.children_department, id)
          if (res) return res
        }
      }
      return ''
    }
    orgForm.value.department_name = findName(departmentOptions.value, orgForm.value.department_id) || '未知部门'
  }

  if (formData.value.organizations === undefined) formData.value.organizations = []
  if (editingOrgIndex.value === -1) {
    formData.value.organizations.push({ ...orgForm.value })
  } else {
    formData.value.organizations[editingOrgIndex.value] = { ...orgForm.value }
  }
  orgDialogVisible.value = false
}

const removeOrg = (index: number) => {
  formData.value.organizations?.splice(index, 1)
}

// --- 其他操作 (Search, Reset, Pagination, Delete) 保持不变 ---
const handleSearch = () => { pagination.currentPage = 1; fetchData() }
const handleReset = () => { searchForm.name = ''; searchForm.phone = ''; searchForm.email = ''; handleSearch() }
const handleSizeChange = (val: number) => { pagination.pageSize = val; fetchData() }
const handleCurrentChange = (val: number) => { pagination.currentPage = val; fetchData() }
const handleDelete = (row: BusinessCard) => {
  ElMessageBox.confirm('确认删除该名片吗?', '提示', { type: 'warning' }).then(async () => {
    if (row.card_id) {
      await deleteCard(row.card_id)
      ElMessage.success('删除成功')
      fetchData()
    }
  })
}
// const handleImport = () => { ElMessage.info('导入功能待开发') }
//导入功能
// --- 导入相关逻辑 ---
const importDialogVisible = ref(false)
// 你的后端接口地址 (注意：如果是本地开发，这里要写完整的 http://localhost:8888/api/businesscard/import)
// 或者配置了 proxy 的话写 /api/businesscard/import
const uploadActionUrl = 'http://localhost:8888/api/businesscard/import' 

// 上传所需的 Header (主要是 Token)
const uploadHeaders = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const openImportDialog = () => {
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  // 假设你把文件放在了 public/template/ 下
  const link = document.createElement('a')
  link.href = '/template/card_import_template.xlsx'
  link.download = '名片导入模版.xlsx'
  link.click()
}

const beforeImportUpload = (file: any) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isExcel) {
    ElMessage.error('上传文件只能是 xls/xlsx 格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImportSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success('导入成功！')
    importDialogVisible.value = false
    fetchData() // 刷新列表
  } else {
    ElMessage.error('导入失败: ' + response.msg)
  }
}

const handleImportError = (err: any) => {
  console.error(err)
  ElMessage.error('上传失败，请检查网络或后端服务')
}




</script>

<style scoped>
/* 保持原有样式 */
.search-form .el-form-item { margin-bottom: 20px; }
.action-buttons { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.table-org-item { margin-bottom: 4px; }
.table-org-item:last-child { margin-bottom: 0; }
.table-org-pos { margin-left: 8px; font-size: 12px; color: #666; }
.org-list-container { background-color: #f8f9fa; border-radius: 4px; padding: 15px; border: 1px solid #e4e7ed; }
.org-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.org-tips { font-size: 12px; color: #909399; }
.org-items { display: flex; flex-direction: column; gap: 8px; }
.org-row { display: flex; justify-content: space-between; align-items: center; background-color: #fff; padding: 8px 12px; border-radius: 4px; border: 1px solid #ebeef5; }
.org-info { font-size: 14px; color: #333; }
.org-divider { margin: 0 8px; color: #dcdfe6; }
.org-pos-name { color: #606266; font-weight: 500; }

/* 地图容器样式 */
.map-container {
  height: 500px;
  width: 100%;
}


.import-container { padding: 10px; }
.step-box { margin-bottom: 25px; }
.step-title { font-weight: bold; margin-bottom: 10px; color: #333; }
.step-desc { font-size: 13px; color: #666; margin-bottom: 10px; }
</style>