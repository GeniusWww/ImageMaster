<template>
  <div class="subtitle-generator">
    <div class="content-container">
      <div class="left-section">
        <div class="panel">
          <h3 class="panel-title">图片上传</h3>
          <div class="upload-section">
            <el-upload
              class="upload-button"
              action="https://jsonplaceholder.typicode.com/posts/"
              :on-change="handleImageChange"
              :auto-upload="false"
              :show-file-list="true">
              <el-button class="apple-button upload-btn" type="primary">上传图片</el-button>
            </el-upload>
          </div>

          <div class="preview-section">
            <div class="panel-title-small">字幕文本</div>
            <div class="subtitle-input">
              <el-input
                type="textarea"
                :rows="5"
                placeholder="请输入字幕文本，每行将作为一条字幕"
                v-model="subtitleText"
              ></el-input>
            </div>
            
            <div class="panel-title-small">字幕设置</div>
            <div class="subtitle-settings">
              <div class="setting-item">
                <span>字体大小</span>
                <el-input-number v-model="fontSize" :min="12" :max="48" :step="2" controls-position="right"></el-input-number>
                <span>px</span>
              </div>
              <div class="setting-item">
                <span>字体颜色</span>
                <el-color-picker v-model="fontColor"></el-color-picker>
              </div>
              <div class="setting-item">
                <span>字体样式</span>
                <el-select v-model="fontFamily" placeholder="请选择字体">
                  <el-option v-for="font in fontFamilies" :key="font.value" :label="font.label" :value="font.value"></el-option>
                </el-select>
              </div>
              <div class="setting-item">
                <span>字幕高度</span>
                <el-input-number v-model="subtitleHeight" :min="30" :max="100" :step="5" controls-position="right"></el-input-number>
                <span>px</span>
              </div>
            </div>
            
            <div class="controls">
              <el-button class="apple-button generate-btn" type="primary" @click="generateSubtitles">生成字幕图片</el-button>
              <el-button class="apple-button download-btn" type="success" @click="downloadImage" v-if="resultImageUrl">下载图片</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-section">
        <div class="preview-panel">
          <h3 class="panel-title">预览</h3>
          <div class="result-section">
            <img :src="resultImageUrl" class="result-image" v-if="resultImageUrl" />
            <div class="empty-preview" v-else></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import { ElMessage } from 'element-plus'

defineComponent({
  name: 'SubtitleGenerator'
})

const subtitleText = ref('')
const fontSize = ref(24)
const fontColor = ref('#ffffff')
const fontFamily = ref('Arial')
const subtitleHeight = ref(40)
const resultImageUrl = ref('')
const uploadedImage = ref(null)

// 字体选项
const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'SimSun', label: '宋体' },
  { value: 'Microsoft YaHei', label: '微软雅黑' }
]

// 处理图片上传
const handleImageChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 生成字幕图片
const generateSubtitles = () => {
  if (!uploadedImage.value) {
    // 使用Element Plus的消息提示
    ElMessage.warning('请先上传图片')
    return
  }

  if (!subtitleText.value.trim()) {
    ElMessage.warning('请输入字幕文本')
    return
  }

  // 创建Canvas来处理图片和字幕
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  img.onload = () => {
    // 分割字幕文本为多行
    const lines = subtitleText.value.split('\n')
    
    // 设置字体样式
    ctx.font = `${fontSize.value}px ${fontFamily.value}`
    ctx.textAlign = 'center'
    
    // 计算单个字幕区域的高度
    const singleSubtitleHeight = subtitleHeight.value // 使用用户设置的字幕高度
    
    // 计算新画布的高度（原图高度 + 所有字幕区域的总高度）
    const totalSubtitlesHeight = singleSubtitleHeight * lines.length
    
    // 设置Canvas尺寸（宽度与图片一致，高度是原图高度加上所有字幕区域的高度）
    canvas.width = img.width
    canvas.height = img.height + totalSubtitlesHeight
    
    // 绘制原始图片
    ctx.drawImage(img, 0, 0, img.width, img.height)
    
    // 设置字体颜色
    ctx.fillStyle = fontColor.value
    
    // 创建一个临时Canvas来截取图片底部区域作为字幕背景模板
    const templateCanvas = document.createElement('canvas')
    const templateCtx = templateCanvas.getContext('2d')
    templateCanvas.width = img.width
    templateCanvas.height = singleSubtitleHeight
    
    // 计算原图底部区域的位置和大小
    const bottomAreaHeight = Math.min(singleSubtitleHeight, img.height * 0.15) // 取图片高度的15%或字幕高度中较小的值
    const bottomAreaY = img.height - bottomAreaHeight
    
    // 从原图底部截取区域绘制到模板Canvas上
    templateCtx.drawImage(img, 0, bottomAreaY, img.width, bottomAreaHeight, 0, 0, img.width, singleSubtitleHeight)
    
    // 添加半透明黑色遮罩以增强文字可读性
    templateCtx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    templateCtx.fillRect(0, 0, templateCanvas.width, templateCanvas.height)
    
    // 为每行字幕创建一个区域
    lines.forEach((line, index) => {
      // 计算当前字幕区域的Y坐标位置
      const subtitleY = img.height + index * singleSubtitleHeight
      
      // 绘制字幕背景（使用模板）
      ctx.drawImage(templateCanvas, 0, subtitleY)
      
      // 绘制分隔线（与图片等宽）
      if (index > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, subtitleY)
        ctx.lineTo(img.width, subtitleY)
        ctx.stroke()
      }
      
      // 设置文字颜色和样式
      ctx.font = `${fontSize.value}px ${fontFamily.value}`
      ctx.fillStyle = fontColor.value
      ctx.textAlign = 'center'
      
      // 计算文字Y坐标（垂直居中于字幕区域）
      const textY = subtitleY + singleSubtitleHeight / 2
      
      // 添加文字描边以增强可读性
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.strokeText(line, img.width / 2, textY)
      
      // 填充文字
      ctx.fillText(line, img.width / 2, textY)
    })

    // 将Canvas转换为图片URL
    resultImageUrl.value = canvas.toDataURL('image/png')
  }

  img.src = uploadedImage.value
}

// 下载生成的图片
const downloadImage = () => {
  if (!resultImageUrl.value) {
    ElMessage.warning('请先生成字幕图片')
    return
  }

  const link = document.createElement('a')
  link.download = 'subtitle_image.png'
  link.href = resultImageUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.subtitle-generator {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.content-container {
  display: flex;
  gap: 30px;
  width: 100%;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.right-section {
  width: 45%;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.preview-panel {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.result-section {
  margin-top: 20px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.empty-preview {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
  background-color: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
}

.panel, .preview-panel {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.panel-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 20px;
  color: #1d1d1f;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 12px;
}

.panel-title-small {
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 12px;
  color: #1d1d1f;
}

.upload-section {
  text-align: center;
  margin-bottom: 20px;
}

.upload-button {
  display: inline-block;
}

.preview-section {
  display: flex;
  flex-direction: column;
}

.subtitle-input {
  margin-bottom: 20px;
}

.subtitle-settings {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.setting-item span {
  margin-right: 10px;
  min-width: 70px;
  color: #555;
}

.controls {
  display: flex;
  gap: 12px;
  margin: 20px 0 10px;
}

.apple-button {
  border-radius: 8px;
}
</style>