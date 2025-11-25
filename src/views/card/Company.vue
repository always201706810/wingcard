    <template>
      <div class="company-profile">
        <!-- 顶部的蓝色提示条 -->
        <el-alert
          title="打造专属电子名片，展现实力，一触即达！"
          description="请上传公司介绍、奖项、荣誉、联系方式等信息"
          type="info"
          :closable="false"
          show-icon
          class="top-banner"
        />

        <el-card shadow="never" class="form-card">
          <el-form :model="form" label-position="top" label-width="100px">
            
            <!-- 上传类型 (单选框) -->
            <el-form-item label="上传类型">
              <el-radio-group v-model="form.uploadType">
                <el-radio label="image">图片</el-radio>
                <el-radio label="video">视频</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 公司图片上传 -->
            <el-form-item label="公司图片">
              <el-upload
                v-model:file-list="form.companyImages"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <p class="upload-tip">支持 jpg、png、jpeg 格式图片，可上传多张图片，不超过 5 张</p>
            </el-form-item>

            <!-- 公司 Logo 上传 -->
            <el-form-item label="公司 logo">
              <el-upload
                v-model:file-list="form.companyLogo"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <p class="upload-tip">支持 jpg、png、jpeg 格式图片，只能上传一张</p>
            </el-form-item>

            <!-- 公司标语 -->
            <el-form-item label="公司标语">
              <el-input v-model="form.slogan" placeholder="请输入公司标语" />
            </el-form-item>

            <!-- 公司介绍 -->
            <el-form-item label="公司介绍">

              <el-input
                v-model="form.introduction"
                type="textarea"
                rows="6"
                placeholder="请输入公司详细介绍..."
              />
            </el-form-item>

          </el-form>
        </el-card>

        <!-- 底部的保存按钮栏 -->
        <div class="footer-bar">
          <el-button type="primary" size="large" @click="handleSave">保 存</el-button>
        </div>
      </div>

      <!-- 
        图片预览对话框
        v-model="dialogVisible" 控制它是否显示
      -->
      <el-dialog v-model="dialogVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
      </el-dialog>
    </template>

    <script setup lang="ts">
    import { ref } from 'vue'
    import { Plus } from '@element-plus/icons-vue'
    import type { UploadFile } from 'element-plus'

    // 【对接预留】
    const form = ref({
      uploadType: 'image',
      // 用模拟数据预先填充图片列表
      // 注意: url 应该换成真实可访问的图片 URL
      // 我这里先用占位图 (placeholder)
      companyImages: [
        { name: 'pic1.jpg', url: 'https://placehold.co/148x148/eee/ccc?text=Image1' },
        { name: 'pic2.jpg', url: 'https://placehold.co/148x148/eee/ccc?text=Image2' },
      ],
      companyLogo: [
        { name: 'logo.png', url: 'https://placehold.co/148x148/409eff/fff?text=Logo' }
      ],
      slogan: '用心服务、转型开拓、团结拼搏、勇往直前',
      introduction: '公司成立于... (这里是公司介绍内容)'
    })

    // --- 图片上传相关的逻辑 ---
    const dialogImageUrl = ref('')
    const dialogVisible = ref(false)

    // 处理图片移除 (预留)
    const handleRemove = (uploadFile: UploadFile, fileList: UploadFile[]) => {
      console.log('移除了图片:', uploadFile, fileList)
    }

    // 处理图片预览
    const handlePictureCardPreview = (uploadFile: UploadFile) => {
      dialogImageUrl.value = uploadFile.url! // 把点击的图片 URL 赋给对话框
      dialogVisible.value = true // 打开对话框
    }

    // 【对接预留】
    // 保存按钮的点击事件
    const handleSave = () => {
      console.log('保存公司简介，表单数据：', form.value)
      // TODO: 在这里调用 API, 把 form.value 发送给后端
    }
    </script>

    <style scoped>
    .company-profile {
      /* 我们给页面一个最大宽度, 让表单在大屏幕上不至于拉得太宽 */
      max-width: 1000px;
      margin: 0 auto;
    }

    .top-banner {
      margin-bottom: 20px;
    }

    .form-card {
      padding: 10px 30px; /* 卡片内边距, 让表单更宽松 */
    }

    .upload-tip {
      color: #999;
      font-size: 13px;
      line-height: 1.5;
    }

    .footer-bar {
      position: fixed; /* 固定在屏幕底部 */
      bottom: 0;
      left: 200px; /* 避开左侧菜单栏的宽度 */
      right: 0;
      background-color: #ffffff;
      padding: 20px 40px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      text-align: right;
      z-index: 10;
    }

    /* 适配 el-main 的 20px 内边距 */
    @media (max-width: 768px) {
      .footer-bar {
        left: 0; /* 移动端可能没有侧边栏 */
      }
    }
    </style>