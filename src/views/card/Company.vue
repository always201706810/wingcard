<template>
  <div class="company-profile">
    <el-alert
      title="完善公司档案"
      description="请完整填写下列信息。所有图片将在点击保存时统一上传。"
      type="info"
      :closable="false"
      show-icon
      class="top-banner"
    />

    <el-card shadow="never" class="form-card">
      <el-form :model="form" label-position="top" label-width="120px">
        
        <div class="section-title">基础信息</div>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="公司电话" required>
              <el-input v-model="form.company_phone" placeholder="请输入对外联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="公司邮箱">
              <el-input v-model="form.company_email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="官网链接">
              <el-input v-model="form.company_url" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">品牌形象</div>
        <el-form-item label="公司标语 (文字)">
          <el-input v-model="form.company_slogan" placeholder="请输入标语文字" />
        </el-form-item>
        <el-form-item label="公司标语 (配图)">
           <el-upload
            v-model:file-list="sloganFileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
             <template #tip>
              <div class="el-upload__tip">对应 img_purpose = 3</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="公司 Logo (purpose=2)">
              <el-upload
                v-model:file-list="logoList"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宣传图片 (purpose=1)">
              <el-upload
                v-model:file-list="imageList"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">详细介绍</div>
        <el-form-item label="成立背景 (文字)">
          <el-input type="textarea" :rows="4" v-model="form.company_background" placeholder="请输入成立背景文字介绍" />
        </el-form-item>
        <el-form-item label="成立背景 (配图)">
           <el-upload
            v-model:file-list="backgroundFileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">对应 img_purpose = 4</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="业务范围">
          <el-input type="textarea" :rows="4" v-model="form.company_business" />
        </el-form-item>
        <el-form-item label="二维码介绍">
          <el-input type="textarea" :rows="3" v-model="form.company_qr_code_intro" />
        </el-form-item>

        <div class="section-title">荣誉与资质</div>
        <el-form-item label="企业荣誉">
          <div v-for="(item, index) in form.honors" :key="'h'+index" class="dynamic-row">
            <el-input v-model="item.honor_name" placeholder="输入荣誉名称" />
            <el-button type="danger" :icon="Delete" circle @click="form.honors.splice(index, 1)" />
          </div>
          <el-button type="primary" link :icon="Plus" @click="addHonor">添加荣誉</el-button>
        </el-form-item>

        <el-form-item label="公司资质">
          <div v-for="(item, index) in form.qualifications" :key="'q'+index" class="dynamic-row">
            <el-input v-model="item.qualification_name" placeholder="输入资质名称" />
            <el-button type="danger" :icon="Delete" circle @click="form.qualifications.splice(index, 1)" />
          </div>
          <el-button type="primary" link :icon="Plus" @click="addQualification">添加资质</el-button>
        </el-form-item>

        <div class="section-title">地理位置</div>
        <el-form-item label="公司地址">
          <div style="display: flex; width: 100%;">
            <el-input v-model="form.company_address" style="flex-grow: 1;" />
            <el-button type="primary" plain :icon="Location" style="margin-left: 10px;" @click="openMapDialog">地图选点</el-button>
          </div>
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input v-model="form.company_longtitude" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input v-model="form.company_latitude" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
    </el-card>

    <div class="footer-bar">
      <el-button type="primary" size="large" @click="handleSave" :loading="isSaving">保存全部信息</el-button>
    </div>

    <el-dialog v-model="mapDialogVisible" title="选择公司位置" width="800px" append-to-body destroy-on-close>
      <div class="map-container">
        <iframe id="mapPageCompany" width="100%" height="100%" frameborder="0" allow="geolocation" src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=VFUBZ-JIR3D-Z2M4H-PPAGG-G5KVQ-S3F2S&referer=wingcard"></iframe>
      </div>
    </el-dialog>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus, Delete, Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile, UploadFile } from 'element-plus'
import { getCompanyInformation, editCompanyInformation } from '../../types/api' 
import type { CompanyForm, CompanyResponse } from '../../types/api'

const COMPANY_ID = 1 
const isSaving = ref(false)

const form = ref<CompanyForm>({
  company_id: COMPANY_ID,
  // company_name: '',
  company_phone: '',
  company_email: '',
  company_url: '',
  company_slogan: '', // 这里存文字
  company_background: '', // 这里存文字
  company_business: '',
  company_market: '',
  company_advantage: '',
  company_culture: '',
  company_future: '',
  company_qr_code_intro: '',
  company_address: '',
  company_longtitude: '',
  company_latitude: '',
  honors: [],
  qualifications: [],
  images: []
})

// --- 核心修改：定义4组图片列表 ---
const imageList = ref<UploadUserFile[]>([])      // purpose = 1 (宣传图)
const logoList = ref<UploadUserFile[]>([])       // purpose = 2 (Logo)
const sloganFileList = ref<UploadUserFile[]>([]) // purpose = 3 (标语配图)
const backgroundFileList = ref<UploadUserFile[]>([]) // purpose = 4 (背景配图)

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const mapDialogVisible = ref(false)

onMounted(async () => {
  window.addEventListener('message', handleMapMessage, false)
  fetchData()
})
onUnmounted(() => {
  window.removeEventListener('message', handleMapMessage)
})

const fetchData = async () => {
  try {
    const res: any = await getCompanyInformation({ company_id: COMPANY_ID })
    const data = (res.data || res) as CompanyResponse 
    
    if (data && data.company_information) {
      Object.assign(form.value, data.company_information)
      form.value.honors = data.company_honor || []
      form.value.qualifications = data.company_qualification || []
      
      // --- 核心修改：图片回显归类 ---
      const imgs = data.company_image || []
      form.value.images = imgs 
      
      // 1. 宣传图
      imageList.value = imgs.filter(img => img.img_purpose === 1)
        .map(img => ({ name: 'Promo', url: img.img_url, uid: img.img_id }))
      
      // 2. Logo
      logoList.value = imgs.filter(img => img.img_purpose === 2)
        .map(img => ({ name: 'Logo', url: img.img_url, uid: img.img_id }))

      // 3. 标语配图
      sloganFileList.value = imgs.filter(img => img.img_purpose === 3)
        .map(img => ({ name: 'SloganImg', url: img.img_url, uid: img.img_id }))

      // 4. 背景配图
      backgroundFileList.value = imgs.filter(img => img.img_purpose === 4)
        .map(img => ({ name: 'BgImg', url: img.img_url, uid: img.img_id }))
    }
  } catch (error) {
    console.error('获取详情失败', error)
  }
}

// --- 核心修改：统一提交逻辑 ---
const handleSave = async () => {
  try {
    isSaving.value = true
    const formData = new FormData()
    
    // 1. 基础字段 (文本)
    for (const key in form.value) {
      const val = (form.value as any)[key]
      // 排除掉对象数组，只传基础类型
      if (typeof val !== 'object' && val !== undefined) {
         // 处理一下命名兼容
         if (key === 'company_business') {
            formData.append('business', String(val))
         } 
         formData.append(key, String(val))
      }
    }
    
    // 2. 复杂字段 (JSON 字符串)

    formData.append('honors', JSON.stringify(form.value.honors))
    formData.append('qualifications', JSON.stringify(form.value.qualifications))
    
    // 3. 统一处理所有图片 (核心！)
    // 按照后端的约定，直接把文件流 append 到 'file'，并把对应的 purpose append 到 'img_purposes'
    processFiles(formData, imageList.value, 1)       // 宣传图
    processFiles(formData, logoList.value, 2)        // Logo
    processFiles(formData, sloganFileList.value, 3)  // 标语图
    processFiles(formData, backgroundFileList.value, 4) // 背景图

    // 发送请求
    await editCompanyInformation(formData)
    ElMessage.success('保存成功')
    fetchData() 
    
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

// 辅助函数：处理图片列表
// 逻辑：
// - 如果是新上传的(raw存在)：append 'file' 和 'img_purposes'
// - 如果是旧图片(uid存在)：append 'img_id' (告诉后端这张图要保留)
const processFiles = (formData: FormData, files: UploadUserFile[], purpose: number) => {
  files.forEach(file => {
    if (file.raw) {
      // 新文件
      formData.append('file', file.raw)
      formData.append('img_purposes', String(purpose))
    } else if (file.uid) {
      // 旧文件，传ID保活
      formData.append('img_id', String(file.uid))
    }
  })
}

// --- 其他交互 ---
const addHonor = () => form.value.honors.push({ honor_id: 0, company_id :1,honor_name: '' })
const addQualification = () => form.value.qualifications.push({ qualification_id: 0,company_id :1, qualification_name: '' })

const handlePreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}
const handleRemove = () => { /* 列表变动自动同步 v-model */ }

// 地图逻辑
const openMapDialog = () => { mapDialogVisible.value = true }
const handleMapMessage = (event: any) => {
  const loc = event.data
  if (loc && loc.module === 'locationPicker') {
    if (loc.poiaddress) form.value.company_address = loc.poiaddress
    if (loc.latlng) {
      form.value.company_latitude = String(loc.latlng.lat)
      form.value.company_longtitude = String(loc.latlng.lng)
    }
    mapDialogVisible.value = false
  }
}
</script>

<style scoped>
/* 保持原有样式 */
.company-profile { max-width: 1000px; margin: 0 auto 80px; }
.top-banner { margin-bottom: 20px; }
.form-card { padding: 10px 20px; }
.section-title { font-size: 16px; font-weight: bold; color: #303133; margin: 20px 0 15px; padding-left: 10px; border-left: 4px solid #409eff; }
.dynamic-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.footer-bar { position: fixed; bottom: 0; left: 220px; right: 0; background-color: #ffffff; padding: 15px 40px; box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); text-align: right; z-index: 100; }
.map-container { height: 500px; width: 100%; }
</style>