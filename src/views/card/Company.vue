<template>
  <div class="company-profile">
    <el-alert
      title="完善公司档案，全面展示企业实力"
      description="请完整填写下列信息，这些内容将在小程序端展示给客户。"
      type="info"
      :closable="false"
      show-icon
      class="top-banner"
    />

    <el-card shadow="never" class="form-card">
      <el-form :model="form" label-position="top" label-width="120px" ref="formRef">
        
        <div class="section-title">基础信息</div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="公司名称" required>
              <el-input v-model="form.company_name" placeholder="请输入公司全称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司电话" required>
              <el-input v-model="form.company_phone" placeholder="请输入对外联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="公司邮箱">
              <el-input v-model="form.company_email" placeholder="请输入公司邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="官网链接">
              <el-input v-model="form.company_url" placeholder="https://..." />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="公司标语 (Slogan)">
          <el-input v-model="form.company_slogan" placeholder="例如：用心服务、转型开拓..." />
        </el-form-item>

        <div class="section-title">图片资料</div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="公司 Logo (单张)">
              <el-upload
                v-model:file-list="logoList"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                :on-preview="handlePictureCardPreview"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宣传图片 (多张)">
              <el-upload
                v-model:file-list="imageList"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-preview="handlePictureCardPreview"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">详细介绍</div>
        
        <el-form-item label="成立背景">
          <el-input type="textarea" :rows="4" v-model="form.company_background" placeholder="请输入公司成立背景..." />
        </el-form-item>

        <el-form-item label="业务范围">
          <el-input type="textarea" :rows="4" v-model="form.company_bussiness" placeholder="请输入主营业务范围..." />
        </el-form-item>

        <el-form-item label="市场定位">
          <el-input type="textarea" :rows="3" v-model="form.company_market" placeholder="请输入市场定位..." />
        </el-form-item>

        <el-form-item label="能力优势">
          <el-input type="textarea" :rows="3" v-model="form.company_advantage" placeholder="请输入核心竞争力..." />
        </el-form-item>

        <el-form-item label="企业文化">
          <el-input type="textarea" :rows="3" v-model="form.company_culture" placeholder="请输入企业价值观、愿景等..." />
        </el-form-item>

        <el-form-item label="未来规划">
          <el-input type="textarea" :rows="3" v-model="form.company_future" placeholder="请输入未来发展规划..." />
        </el-form-item>

        <el-form-item label="二维码介绍">
          <el-input type="textarea" :rows="3" v-model="form.company_qr_code_intro" placeholder="请输入二维码相关的介绍文案..." />
        </el-form-item>

        <div class="section-title">荣誉与资质</div>
        
        <el-form-item label="企业荣誉">
          <div v-for="(item, index) in form.honors" :key="'honor-'+index" class="dynamic-row">
            <el-input v-model="item.honor_name" placeholder="输入荣誉名称" />
            <el-button type="danger" :icon="Delete" circle @click="removeHonor(index)" v-if="form.honors && form.honors.length > 0" />
          </div>
          <el-button type="primary" link :icon="Plus" @click="addHonor">添加荣誉</el-button>
        </el-form-item>

        <el-form-item label="公司资质">
          <div v-for="(item, index) in form.qualifications" :key="'qual-'+index" class="dynamic-row">
            <el-input v-model="item.qualification_name" placeholder="输入资质名称" />
            <el-button type="danger" :icon="Delete" circle @click="removeQualification(index)" v-if="form.qualifications && form.qualifications.length > 0" />
          </div>
          <el-button type="primary" link :icon="Plus" @click="addQualification">添加资质</el-button>
        </el-form-item>

        <div class="section-title">地理位置</div>
        <el-form-item label="公司地址" required>
          <el-input v-model="form.company_address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="经度 (Longitude)">
              <el-input v-model="form.company_longitude" placeholder="例如：107.440037" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度 (Latitude)">
              <el-input v-model="form.company_latitude" placeholder="例如：31.199922" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="tip-text">注：经纬度可使用地图拾取工具获取，用于小程序导航定位。</div>

      </el-form>
    </el-card>

    <div class="footer-bar">
      <el-button type="primary" size="large" @click="handleSave">保存全部信息</el-button>
    </div>

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadUserFile, UploadFile } from 'element-plus'
import { getCompanyInfo, saveCompanyInfo } from '../../types/api'
import type { CompanyInfo, Honor, Qualification, CompanyImg } from '../../types/api'

// --- 状态定义 ---
const form = ref<CompanyInfo>({
  company_name: '',
  company_phone: '',
  company_email: '',
  company_url: '',
  company_slogan: '',
  company_background: '',
  company_bussiness: '', // 注意拼写 bussiness
  company_market: '',
  company_advantage: '',
  company_culture: '',
  company_future: '',
  company_qr_code_intro: '',
  company_address: '',
  company_longitude: '',
  company_latitude: '',
  honors: [],
  qualifications: [],
  images: []
})

// 图片上传列表
const logoList = ref<UploadUserFile[]>([])
const imageList = ref<UploadUserFile[]>([])

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// --- 方法定义 ---

// 获取详情
onMounted(async () => {
  try {
    const res: any = await getCompanyInfo()
    if (res) {
      // 合并数据
      Object.assign(form.value, res)
      
      // 处理图片回显
      // 假设 res.images 是一个包含 {img_url, img_type} 的数组
      if (res.images && Array.isArray(res.images)) {
        logoList.value = res.images
          .filter((img: CompanyImg) => img.img_type === 'logo')
          .map((img: CompanyImg) => ({ name: 'Logo', url: img.img_url }))
        
        imageList.value = res.images
          .filter((img: CompanyImg) => img.img_type === 'image') // 或其他类型
          .map((img: CompanyImg, idx: number) => ({ name: `Img${idx}`, url: img.img_url }))
      }
      
      // 确保 honors/qualifications 是数组，防止报错
      if (!form.value.honors) form.value.honors = []
      if (!form.value.qualifications) form.value.qualifications = []
    }
  } catch (error) {
    console.error(error)
  }
})

// 荣誉增删
const addHonor = () => {
  if (!form.value.honors) form.value.honors = []
  form.value.honors.push({ honor_name: '' })
}
const removeHonor = (index: number) => {
  form.value.honors?.splice(index, 1)
}

// 资质增删
const addQualification = () => {
  if (!form.value.qualifications) form.value.qualifications = []
  form.value.qualifications.push({ qualification_name: '' })
}
const removeQualification = (index: number) => {
  form.value.qualifications?.splice(index, 1)
}

// 图片预览
const handlePictureCardPreview = (uploadFile: UploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  try {
    // 构造提交数据
    // 1. 处理图片：将 fileList 转换为后端需要的格式
    const imgs: CompanyImg[] = []
    
    // Logo
    logoList.value.forEach(f => {
      if (f.url) imgs.push({ img_url: f.url, img_type: 'logo' })
    })
    // 普通图片
    imageList.value.forEach(f => {
      if (f.url) imgs.push({ img_url: f.url, img_type: 'image' })
    })
    
    form.value.images = imgs

    // 2. 提交
    await saveCompanyInfo(form.value)
    ElMessage.success('保存成功')
  } catch (error) {
    // request.ts 已处理
  }
}
</script>

<style scoped>
.company-profile {
  max-width: 1000px;
  margin: 0 auto 80px; /* 底部留白给 fixed footer */
}
.top-banner {
  margin-bottom: 20px;
}
.form-card {
  padding: 10px 20px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}
.dynamic-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: -10px;
  margin-bottom: 20px;
}
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 220px; /* 对应 Sidebar 宽度 */
  right: 0;
  background-color: #ffffff;
  padding: 15px 40px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  text-align: right;
  z-index: 100;
}
@media (max-width: 768px) {
  .footer-bar { left: 0; }
}
</style>