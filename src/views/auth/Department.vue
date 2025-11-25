<template>
  <el-card shadow="never">

    <el-form :inline="true" :model="searchForm">
      <el-form-item label="部门名称:">
        <el-input v-model="searchForm.name" placeholder="请输入部门名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="fetchTree">搜索</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" :icon="Plus" @click="openDialog">新增一级部门</el-button>

    <el-divider></el-divider>

    <el-table 
      :data="tableData" 
      style="width: 100%" 
      row-key="department_id" 
      border 
      default-expand-all
      v-loading="loading"
    >
      <el-table-column prop="department_name" label="部门名称" min-width="200" />
      
      <el-table-column prop="sort_order" label="排序" width="80" align="center" />
      
      <el-table-column label="类型" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="isTrue(scope.row.is_administrative_division)" type="warning" size="small">行政区划</el-tag>
          <el-tag v-else type="info" size="small">普通部门</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="is_enabled" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="isTrue(scope.row.is_enabled) ? 'success' : 'danger'">
            {{ isTrue(scope.row.is_enabled) ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="unified_social_credit_code" label="社会信用代码" min-width="180" show-overflow-tooltip />
      
      <el-table-column prop="contact_person" label="联系人" width="120" />
      <el-table-column prop="contact_phone" label="联系电话" width="130" />
      
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button link type="primary" :icon="Plus" @click="handleAdd(scope.row)">新增下级</el-button>
          <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
    >
      <el-form :model="formData" label-width="140px">
        
        <el-form-item label="上级部门ID" v-if="formData.parent_department_id">
           <el-input v-model="formData.parent_department_id" disabled placeholder="根节点无父ID" />
        </el-form-item>

        <el-form-item label="部门名称" required>
          <el-input v-model="formData.department_name" placeholder="例如：市场部" />
        </el-form-item>

        <el-form-item label="是否行政区划">
          <el-switch 
            v-model="switchAdmin" 
            active-text="是" 
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="行政区划编码" v-if="switchAdmin">
          <el-input v-model="formData.administrative_division_code" placeholder="例如：511700" />
        </el-form-item>

        <el-form-item label="统一社会信用代码">
          <el-input v-model="formData.unified_social_credit_code" placeholder="请输入统一社会信用代码" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" controls-position="right" />
          <span class="tip-text">数字越小越靠前</span>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch 
            v-model="switchEnabled" 
            active-text="启用" 
            inactive-text="停用"
          />
        </el-form-item>

        <el-form-item label="联系人">
          <el-input v-model="formData.contact_person" placeholder="请输入负责人姓名" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="formData.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>

      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDepartmentTree, addDepartment, updateDepartment, deleteDepartment } from '../../types/api'
import type { Department } from '../../types/api'

// 1. 状态定义
const searchForm = ref({ name: '' })
const tableData = ref<Department[]>([])
const loading = ref(false)
const dialogVisible = ref(false)

// 2. 表单相关状态
// 辅助变量：用于绑定 switch 开关 (因为 boolean 比字符串 'true'/'false' 好操作)
const switchEnabled = ref(true)
const switchAdmin = ref(false)

const formData = ref<Department>({
  department_name: '',
  is_enabled: 'true',
  is_administrative_division: 'false',
  sort_order: 0,
  contact_person: '',
  contact_phone: '',
  administrative_division_code: '',
  unified_social_credit_code: ''
})

// 计算弹窗标题
const dialogTitle = computed(() => {
  if (formData.value.parent_department_id && !formData.value.department_id) return '新增下级部门'
  if (formData.value.department_id) return '编辑部门'
  return '新增一级部门'
})

// 3. 辅助函数：兼容处理 boolean 和 string ('true')
const isTrue = (val: boolean | string | undefined) => {
  return val === true || val === 'true'
}

// 4. API 交互
const fetchTree = async () => {
  loading.value = true
  try {
    const res: any = await getDepartmentTree()
    // 假设后端返回的数据已经是树形结构
    tableData.value = res || [] 
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTree()
})

const handleReset = () => {
  searchForm.value.name = ''
  fetchTree()
}

// 5. 操作逻辑
// 打开新增一级部门
const openDialog = () => {
  formData.value = {
    department_name: '',
    is_enabled: 'true',
    is_administrative_division: 'false',
    sort_order: 0,
    contact_person: '',
    contact_phone: '',
    administrative_division_code: '',
    unified_social_credit_code: ''
  }
  switchEnabled.value = true
  switchAdmin.value = false
  dialogVisible.value = true
}

// 打开新增下级
const handleAdd = (row: Department) => {
  formData.value = {
    department_name: '',
    parent_department_id: row.department_id, // 关键：自动带入父ID
    is_enabled: 'true',
    is_administrative_division: 'false',
    sort_order: 0,
    contact_person: '',
    contact_phone: '',
    administrative_division_code: '',
    unified_social_credit_code: ''
  }
  switchEnabled.value = true
  switchAdmin.value = false
  dialogVisible.value = true
}

// 打开编辑
const handleEdit = (row: Department) => {
  // 浅拷贝当前行数据
  formData.value = { ...row }
  // 转换 switch 状态
  switchEnabled.value = isTrue(row.is_enabled)
  switchAdmin.value = isTrue(row.is_administrative_division)
  dialogVisible.value = true
}

// 提交保存
const handleSubmit = async () => {
  try {
    // 【重要】提交前将 boolean 转回数据库需要的 'true'/'false' 字符串
    formData.value.is_enabled = switchEnabled.value ? 'true' : 'false'
    formData.value.is_administrative_division = switchAdmin.value ? 'true' : 'false'
    
    // 如果不是行政区划，清空编码
    if (!switchAdmin.value) {
      formData.value.administrative_division_code = ''
    }

    if (formData.value.department_id) {
       await updateDepartment(formData.value)
       ElMessage.success('更新成功')
    } else {
       await addDepartment(formData.value)
       ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchTree()
  } catch(e) {
    // 错误在 request.ts 已统一处理
  }
}

const handleDelete = (row: Department) => {
  ElMessageBox.confirm(`确定要删除“${row.department_name}”吗？这将可能级联删除其子部门。`, '警告', { type: 'warning' }).then(async () => {
    if (row.department_id) {
      await deleteDepartment(row.department_id)
      ElMessage.success('删除成功')
      fetchTree()
    }
  })
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 20px;
}
.el-divider {
  margin: 15px 0;
}
.tip-text {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}
</style>