<template>
  <el-card shadow="never">

    <el-form :inline="true" :model="searchForm">
      <el-form-item label="部门名称:">
        <el-input v-model="searchForm.name" placeholder="请输入部门名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search">搜索</el-button>
        <el-button :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" :icon="Plus" @click="openDialog">新增</el-button>

    <el-divider></el-divider>

<el-table 
      :data="tableData" 
      style="width: 100%" 
      row-key="id" 
      border 
      default-expand-all
    >
      <el-table-column prop="name" label="部门名称" />
      <el-table-column prop="enabled" label="是否启用">
        <template #default="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
            {{ scope.row.enabled ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系人" />
      <el-table-column prop="phone" label="联系电话" />
      
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button link type="primary" :icon="Plus" @click="handleAdd(scope.row)">新增下级</el-button>
          <el-button link type="primary" :icon="Edit">编辑</el-button>
          <el-button link type="danger" :icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
<el-dialog v-model="dialogVisible" :title="formData.parentId ? '新增下级部门' : '新增一级部门'" width="500px">
<el-form :model="formData" label-width="100px">
        <el-form-item label="上级部门" v-if="parentName">
           <el-input v-model="parentName" disabled />
        </el-form-item>

        <el-form-item label="部门名称" required>
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>

        <el-form-item label="联系人">
          <el-input v-model="formData.contact" placeholder="请输入负责人姓名" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
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
import { ref } from 'vue'
// 导入图标
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { Department } from '../../types/api'


// 搜索表单的数据 (我们先预留好)
const searchForm = ref({
  name: ''
})


// 父级和子需要树结构

const tableData = ref<Department[]>([
  { 
    id: '1', 
    name: '达州电信公司', 
    enabled: true, 
    contact: '', 
    phone: '',
    children: [
      { id: '11', parentId: '1', name: '市场部', enabled: true, contact: '张三', phone: '11111111111' },
      { id: '12', parentId: '1', name: '办公室 (安全保卫部、法律合规部)', enabled: true, contact: '李四', phone: '11111111111' ,
        children: [{ id: '13', parentId: '1', name: '市场部', enabled: true, contact: '黄善明', phone: '19960660188'}]},
      // { id: '13', parentId: '1', name: '市场部', enabled: true, contact: '黄善明', phone: '19960660188' },
      // { id: '14', parentId: '1', name: '政企客户部', enabled: true, contact: '姚整', phone: '19908189616' },
      // { id: '15', parentId: '1', name: '销售及渠道拓展中心', enabled: true, contact: '', phone: '' },
      // { id: '16', parentId: '1', name: '商业客户中心', enabled: true, contact: '', phone: '' },
    ]
  }
])


const parentName = ref('') 

// 控制弹窗显示/隐藏
const dialogVisible = ref(false)

// 表单数据 (使用 Department 类型)
const formData = ref<Department>({
  name: '',
  enabled: true,
  contact: '',
  phone: ''
})

const openDialog = () => {
  // 每次打开前，重置表单数据
  formData.value = {
    name: '',
    enabled: true,
    contact: '',
    phone: ''
  }
  dialogVisible.value = true
}

// 打开弹窗
// row 参数：如果是点击"新增下级"，row 就是父节点数据；如果是顶部"新增"，row 就是 undefined
const handleAdd = (row?: Department) => {
  // 重置表单
  formData.value = {
    name: '',
    enabled: true,
    contact: '',
    phone: '',
    parentId: row?.id // 如果有 row, 就把它的 id 记为 parentId
  }
  
  // 记录父级名字 (仅展示用)
  parentName.value = row ? row.name : ''
  
  dialogVisible.value = true
}


// 提交表单
const handleSubmit = () => {
  console.log('提交的数据：', formData.value)
  
  const newDept: Department = {
    id: Date.now().toString(), // 模拟生成唯一ID
    ...formData.value,
    children: [] // 新部门默认没有子部门
  }
// 【前端模拟插入逻辑】
  // 真实开发中：你只需要把 formData 发给后端，后端存好后，你刷新表格即可。
  // 这里为了演示效果，我们需要手动把数据塞到正确的位置。
  
  if (!formData.value.parentId) {
    // 1. 如果没有 parentId，说明是根节点，直接 push 到最外层
    tableData.value.push(newDept)
  } else {
    // 2. 如果有 parentId，我们需要去树里找到这个爸爸，把数据塞给他
    // 这里写一个简单的递归查找函数
    const parent = findDepartment(tableData.value, formData.value.parentId)
    if (parent) {
      if (!parent.children) parent.children = [] // 如果爸爸还没孩子，给个空数组
      parent.children.push(newDept)
    }
  }
  
  dialogVisible.value = false
}

// 辅助函数：在树里根据 ID 找部门 (递归查找)
const findDepartment = (list: Department[], targetId: string): Department | null => {
  for (const item of list) {
    if (item.id === targetId) return item
    if (item.children) {
      const found = findDepartment(item.children, targetId)
      if (found) return found
    }
  }
  return null
}



// 新增按钮的点击事件 (预留)
const handleCreate = () => {
  console.log('点击了新增按钮')
  // 将来这里会弹出一个对话框
}
</script>

<style scoped>
/* 保持组件样式独立 */
.el-form-item {
  margin-bottom: 20px; /* 搜索行和下面内容的间距 */
}
.el-divider {
  margin: 15px 0;
}
</style>