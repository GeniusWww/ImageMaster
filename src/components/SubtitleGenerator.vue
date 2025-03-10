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
            <img :src="resultImageUrl" class="result-image" @click="showLargeImage" v-if="resultImageUrl" />
            <div class="empty-preview" v-else></div>
          </div>
        </div>
      </div>
      
      <!-- 图片放大查看对话框 -->
      <el-dialog v-model="dialogVisible" title="图片预览" width="80%" :before-close="handleClose">
        <img :src="resultImageUrl" style="width: 100%;" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 图片相关数据
const imageUrl = ref('')
const resultImageUrl = ref('')
const subtitleText = ref('')
const originalImage = ref(null)
const fileName = ref('')

// 字幕样式设置
const fontSize = ref(24)
const fontColor = ref('#FFFFFF')
const fontFamily = ref('Arial')
const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'KaiTi', label: '楷体' }
]

// 图片放大查看相关
const dialogVisible = ref(false)

// 处理图片上传
const handleImageChange = (file) => {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
    // 预加载图片以便后续处理
    const img = new Image()
    img.src = e.target.result
    img.onload = () => {
      originalImage.value = img
    }
  }
  reader.readAsDataURL(file.raw)
}

// 生成字幕图片
const generateSubtitles = () => {
  if (!originalImage.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (!subtitleText.value) {
    ElMessage.warning('请先输入需要展示的字幕')
    return
  }

  // 分割字幕文本为多行
  const subtitleLines = subtitleText.value.split('\n').filter(line => line.trim() !== '')
  if (subtitleLines.length === 0) {
    ElMessage.warning('请先输入需要展示的字幕')
    return
  }

  // 创建画布
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 设置画布尺寸
  const img = originalImage.value
  const subtitleHeight = 50 // 每行字幕的高度
  const subtitleAreaHeight = subtitleLines.length * subtitleHeight // 字幕区域总高度
  canvas.width = img.width
  canvas.height = img.height + subtitleAreaHeight // 为字幕区域增加高度
  
  // 绘制原始图片
  ctx.drawImage(img, 0, 0)
  
  // 设置字幕样式
  ctx.font = `bold ${fontSize.value}px ${fontFamily.value}`
  ctx.textAlign = 'center'
  ctx.lineWidth = 2
  
  // 获取图片底部区域作为字幕背景的模板
  // 创建一个临时画布来处理底部区域的复制
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  tempCanvas.width = img.width
  tempCanvas.height = subtitleHeight
  
  // 从原图底部截取一小部分作为模板
  const templateHeight = Math.min(subtitleHeight, img.height * 0.1) // 使用图片底部10%的区域作为模板
  tempCtx.drawImage(img, 0, img.height - templateHeight, img.width, templateHeight, 0, 0, img.width, subtitleHeight)
  
  // 调整模板的亮度，使其变暗
  tempCtx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
  
  // 将模板重复绘制到字幕区域
  for (let i = 0; i < subtitleLines.length; i++) {
    ctx.drawImage(tempCanvas, 0, img.height + i * subtitleHeight, img.width, subtitleHeight)
    
    // 在每行字幕之间添加与图片等宽的分隔线
    if (i > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, img.height + i * subtitleHeight)
      ctx.lineTo(canvas.width, img.height + i * subtitleHeight)
      ctx.stroke()
    }
  }
  
  // 绘制字幕文本
  subtitleLines.forEach((line, index) => {
    const y = img.height + (index * subtitleHeight) + subtitleHeight / 2 + 8 // 垂直居中
    
    // 绘制描边 - 黑色描边增加可读性
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    ctx.strokeText(line, canvas.width / 2, y)
    
    // 绘制文本 - 使用用户选择的颜色
    ctx.fillStyle = fontColor.value
    ctx.fillText(line, canvas.width / 2, y)
  })
  
  // 更新结果图片URL
  resultImageUrl.value = canvas.toDataURL('image/png')
}

// 下载生成的图片
const downloadImage = () => {
  if (!resultImageUrl.value) return
  
  const link = document.createElement('a')
  link.href = resultImageUrl.value
  link.download = 'subtitle-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 显示大图
const showLargeImage = () => {
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.subtitle-generator {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.content-container {
  display: flex;
  gap: 30px;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-section {
  width: 45%;
  display: flex;
  flex-direction: column;
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
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 10px 20px;
  border: none;
}

.generate-btn {
  background-color: #0071e3;
  border-color: #0071e3;
}

.generate-btn:hover {
  background-color: #0077ed;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.download-btn {
  background-color: #34c759;
  border-color: #34c759;
}

.download-btn:hover {
  background-color: #30d158;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

.upload-btn {
  background-color: #0071e3;
  border-color: #0071e3;
}

.upload-btn:hover {
  background-color: #0077ed;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.result-section {
  padding: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.result-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.result-image:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
  }
  
  .right-section {
    width: 100%;
  }
}

.empty-preview {
  width: 100%;
  height: 300px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.empty-preview::after {
  content: '上传图片并生成字幕后预览将显示在这里';
}
</style>