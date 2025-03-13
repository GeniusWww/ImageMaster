<template>
  <div class="watermark-container">
    <!-- 图片上传 -->
    <div class="upload-section">
      <el-upload 
        class="upload-demo" 
        :auto-upload="false"
        :show-file-list="false"
        @change="handleUpload"
      >
        <el-button type="primary" class="upload-button">
          <el-icon><Upload /></el-icon>
          选择图片
        </el-button>
      </el-upload>
    </div>

    <!-- 水印设置 -->
    <div v-if="imageSrc" class="settings-panel">
      <div class="settings-header">
        <h3>水印设置</h3>
      </div>
      
      <!-- 水印类型选择 -->
      <div class="setting-item">
        <span class="setting-label">水印类型</span>
        <el-radio-group v-model="watermarkType" @change="applyWatermark">
          <el-radio label="single">单一水印</el-radio>
          <el-radio label="tiled">铺满水印</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 水印文字 -->
      <div class="setting-item">
        <span class="setting-label">水印文字</span>
        <el-input v-model="watermarkText" placeholder="输入水印文字" @input="applyWatermark" />
      </div>
      
      <!-- 水印颜色 -->
      <div class="setting-item">
        <span class="setting-label">水印颜色</span>
        <el-color-picker v-model="watermarkColor" @change="applyWatermark" />
      </div>
      
      <!-- 单一水印位置 -->
      <div class="setting-item" v-if="watermarkType === 'single'">
        <span class="setting-label">水印位置</span>
        <el-select v-model="position" placeholder="选择位置" @change="applyWatermark">
          <el-option label="左上角" value="top-left" />
          <el-option label="右上角" value="top-right" />
          <el-option label="左下角" value="bottom-left" />
          <el-option label="右下角" value="bottom-right" />
          <el-option label="居中" value="center" />
        </el-select>
      </div>
      
      <!-- 铺满水印设置 -->
      <div class="setting-item" v-if="watermarkType === 'tiled'">
        <span class="setting-label">水印间距</span>
        <el-slider v-model="tileSpacing" :min="50" :max="200" @change="applyWatermark" />
      </div>
      
      <!-- 水印角度 -->
      <div class="setting-item">
        <span class="setting-label">水印角度</span>
        <el-slider v-model="rotation" :min="-45" :max="45" @change="applyWatermark" />
      </div>
      
      <!-- 字体大小 -->
      <div class="setting-item">
        <span class="setting-label">字体大小</span>
        <el-slider v-model="fontSize" :min="12" :max="48" @change="applyWatermark" />
      </div>
      
      <!-- 透明度 -->
      <div class="setting-item">
        <span class="setting-label">透明度</span>
        <el-slider v-model="opacity" :min="0.1" :max="1" :step="0.1" @change="applyWatermark" />
      </div>
    </div>

    <!-- 预览 & 下载 -->
    <div v-if="imageSrc" class="preview-area">
      <div class="preview-header">
        <h3>预览效果</h3>
      </div>
      <div class="preview-container">
        <img :src="processedImage" class="preview-image" />
      </div>
      <div class="action-buttons">
        <el-button @click="downloadImage" type="primary" class="download-button">
          <el-icon><Download /></el-icon>
          下载图片
        </el-button>
      </div>
    </div>

    <!-- 隐藏的Canvas -->
    <canvas ref="canvas" style="display: none;"></canvas>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload, Download } from '@element-plus/icons-vue'

const imageSrc = ref('')
const watermarkText = ref('阿松图片大师')
const watermarkColor = ref('#FFFFFF')
const position = ref('bottom-right')
const fontSize = ref(24)
const opacity = ref(0.7)
const canvas = ref(null)
const processedImage = ref('')
const watermarkType = ref('single')
const tileSpacing = ref(100)
const rotation = ref(-15)

// 处理图片上传
const handleUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    applyWatermark()
  }
  reader.readAsDataURL(file.raw)
}

// 应用水印
const applyWatermark = () => {
  if (!imageSrc.value) return
  
  const img = new Image()
  img.onload = () => {
    const ctx = canvas.value.getContext('2d')
    
    // 设置Canvas尺寸
    canvas.value.width = img.width
    canvas.value.height = img.height
    
    // 绘制原图
    ctx.drawImage(img, 0, 0)
    
    // 设置水印样式
    ctx.font = `${fontSize.value}px "SF Pro Display", "Helvetica Neue", Arial, sans-serif`
    ctx.fillStyle = watermarkColor.value
    ctx.globalAlpha = opacity.value
    
    if (watermarkType.value === 'single') {
      // 单一水印
      drawSingleWatermark(ctx, img.width, img.height)
    } else {
      // 铺满水印
      drawTiledWatermark(ctx, img.width, img.height)
    }
    
    // 生成预览图
    processedImage.value = canvas.value.toDataURL('image/png')
  }
  img.src = imageSrc.value
}

// 绘制单一水印
const drawSingleWatermark = (ctx, width, height) => {
  const padding = 30
  const textWidth = ctx.measureText(watermarkText.value).width
  
  let x, y
  switch(position.value) {
    case 'top-left':
      x = padding
      y = fontSize.value + padding
      break
    case 'top-right':
      x = width - textWidth - padding
      y = fontSize.value + padding
      break
    case 'center':
      x = (width - textWidth) / 2
      y = height / 2
      break
    case 'bottom-left':
      x = padding
      y = height - padding
      break
    case 'bottom-right':
      x = width - textWidth - padding
      y = height - padding
      break
  }
  
  // 保存当前状态
  ctx.save()
  
  // 移动到文字位置
  ctx.translate(x, y)
  
  // 旋转
  ctx.rotate(rotation.value * Math.PI / 180)
  
  // 绘制文字
  ctx.fillText(watermarkText.value, 0, 0)
  
  // 恢复状态
  ctx.restore()
}

// 绘制铺满水印
const drawTiledWatermark = (ctx, width, height) => {
  //const textWidth = ctx.measureText(watermarkText.value).width
  const spacing = tileSpacing.value
  
  // 计算行列数
  const cols = Math.ceil(width / spacing) + 1
  const rows = Math.ceil(height / spacing) + 1
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * spacing
      const y = i * spacing + fontSize.value
      
      // 保存当前状态
      ctx.save()
      
      // 移动到文字位置
      ctx.translate(x, y)
      
      // 旋转
      ctx.rotate(rotation.value * Math.PI / 180)
      
      // 绘制文字
      ctx.fillText(watermarkText.value, 0, 0)
      
      // 恢复状态
      ctx.restore()
    }
  }
}

// 下载图片
const downloadImage = () => {
  const link = document.createElement('a')
  link.download = 'watermarked-image.png'
  link.href = processedImage.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 监听设置变化，自动应用水印
watch([watermarkText, watermarkColor, fontSize, opacity, position, watermarkType, tileSpacing, rotation], () => {
  if (imageSrc.value) {
    applyWatermark()
  }
}, { deep: true })
</script>

<style scoped>
.watermark-container {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
}

.upload-section {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}

.settings-panel {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.settings-header, .preview-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

.settings-header h3, .preview-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.preview-area {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.download-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .watermark-container {
    grid-template-columns: 1fr;
  }
}
</style>