<template>
  <div class="poster-container">
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <h2>豆包海报生成</h2>
        <div class="input-section">
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入您想要生成的海报描述..."
            class="prompt-input"
          ></el-input>

          <div class="quick-tags-section">
            <div class="tag-category">
              <h3>创意风格</h3>
              <div class="tag-group">
                <el-tag
                  v-for="style in creativeStyles"
                  :key="style"
                  class="tag-item"
                  @click="appendTag(style)"
                  effect="plain"
                >{{ style }}</el-tag>
              </div>
            </div>

            <div class="tag-category">
              <h3>光线</h3>
              <div class="tag-group">
                <el-tag
                  v-for="light in lightingStyles"
                  :key="light"
                  class="tag-item"
                  @click="appendTag(light)"
                  effect="plain"
                >{{ light }}</el-tag>
              </div>
            </div>

            <div class="tag-category">
              <h3>镜头语言</h3>
              <div class="tag-group">
                <el-tag
                  v-for="shot in cameraShots"
                  :key="shot"
                  class="tag-item"
                  @click="appendTag(shot)"
                  effect="plain"
                >{{ shot }}</el-tag>
              </div>
            </div>
          </div>

          <div class="control-section">
            <el-select v-model="propotion" placeholder="选择海报比例" class="ratio-select">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="generatePoster" :loading="loading" class="generate-btn">生成海报</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="right-panel">
        <div class="preview-section" :class="{ 'has-image': posterUrl }">
          <div v-if="!posterUrl" class="empty-state">
            <el-icon class="empty-icon"><picture-rounded /></el-icon>
            <p>生成的海报将在这里显示</p>
          </div>
          <img v-else :src="posterUrl" class="poster-image" />
        </div>
        <!-- <el-button v-if="posterUrl" type="success" @click="downloadPoster" class="download-btn">下载海报</el-button> -->
      </div>
          <!-- 二维码设置 -->
      <div class="qrcode-section">
        <h3>二维码设置</h3>
        <el-upload
          class="qrcode-upload"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleQRCodeUpload">
          <el-button type="primary" plain>上传二维码</el-button>
        </el-upload>
        <div v-if="qrcodePreview" class="qrcode-preview">
          <!-- <img :src="qrcodePreview" class="qrcode-image" /> -->
          <el-select v-model="qrcodePosition" placeholder="选择二维码位置" class="position-select">
            <el-option label="左上角" value="top-left" />
            <el-option label="右上角" value="top-right" />
            <el-option label="左下角" value="bottom-left" />
            <el-option label="右下角" value="bottom-right" />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { PictureRounded } from '@element-plus/icons-vue'
import { CozeAPI } from '@coze/api'

// 二维码相关状态
const qrcodePreview = ref('')
const qrcodePosition = ref('bottom-right')
const qrcodeFile = ref(null)

// 监听二维码位置变化
watch(qrcodePosition, async () => {
  if (qrcodeFile.value && posterUrl.value) {
    try {
      await addQRCodeToPoster()
    } catch (error) {
      ElMessage.error('二维码位置更新失败')
    }
  }
})
// 初始化Coze API客户端
const apiClient = new CozeAPI({
  token: 'pat_ceXDvTAxXSKCB3jmvFYvnMHQJnCfanKs49AsesgnbKTJA09fdJ0vrOxTlIPoM9Ue',
  baseURL: 'https://api.coze.cn',
  allowPersonalAccessTokenInBrowser: true
})

// 快捷标签数据
const creativeStyles = [
  '羊毛毡风格',
  '敦煌壁画',
  '水墨写意',
  '水彩',
  '工笔画',
  '漫画页版面',
  '折纸',
  '儿童画',
  '古埃及壁画'
]

const lightingStyles = [
  '硬光',
  '柔光',
  '察博朗克光',
  '窗光',
  '明暗分明',
  '戏剧光',
  '电影照明',
  '丁达尔效应',
  '暖光'
]

const cameraShots = [
  '四分之三侧',
  '焦点构图',
  '头像',
  '长焦镜头',
  '平铺俯拍',
  '全景镜头'
]

const options = [
  { value: '1', label: '1:1' },
  { value: '2', label: '2:3' },
  { value: '3', label: '4:3' },
  { value: '4', label: '9:16' },
  { value: '5', label: '16:9' }
]

const prompt = ref('')
const propotion = ref('')
const posterUrl = ref('')
const loading = ref(false)

// 添加标签到输入框
const appendTag = (tag) => {
  const currentPrompt = prompt.value
  prompt.value = currentPrompt ? `${currentPrompt}, ${tag}` : tag
}

// 生成海报
const generatePoster = async () => {
  if (!prompt.value) {
    ElMessage.warning('请输入海报描述')
    return
  }
  
  if (!propotion.value) {
    ElMessage.warning('请选择海报比例')
    return
  }
  
  loading.value = true
  try {
    const res = await apiClient.workflows.runs.create({
      workflow_id: '7481600194980446248',
      parameters: {
        prompt: prompt.value,
        propotion: propotion.value
      },
    })
    
    if (res && res.data) {
      try {
        const parsedData = JSON.parse(res.data)
        if (parsedData.output) {
          posterUrl.value = parsedData.output
        } else {
          throw new Error('解析后的数据中没有output字段')
        }
      } catch (parseError) {
        throw new Error('解析API返回数据失败')
      }
    } else {
      throw new Error('API返回格式不符合预期')
    }
  } catch (error) {
    ElMessage.error(`生成海报失败: ${error.message || '请稍后重试'}`)
  } finally {
    loading.value = false
  }
}

// 下载海报
const handleQRCodeUpload = async (file) => {
  if (!posterUrl.value) {
    ElMessage.warning('请在生成海报后再添加二维码')
    return
  }
  qrcodeFile.value = file.raw
  qrcodePreview.value = URL.createObjectURL(file.raw)
  
  try {
    await addQRCodeToPoster()
  } catch (error) {
    ElMessage.error('预览二维码添加失败，但您仍可以继续操作')
  }
}

const addQRCodeToPoster = async () => {
  if (!qrcodeFile.value || !posterUrl.value) return
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  try {
    // 获取原始海报URL（不含二维码）
    let originalPosterUrl = posterUrl.value
    // 如果当前海报URL是data URL格式，说明已经添加过二维码，需要重新获取原始海报
    if (posterUrl.value.startsWith('data:')) {
      originalPosterUrl = window._originalPosterUrl || posterUrl.value
    } else {
      // 保存原始海报URL，用于后续重新添加二维码
      window._originalPosterUrl = posterUrl.value
      const response = await fetch(posterUrl.value)
      if (!response.ok) throw new Error('获取海报图片失败')
      const blob = await response.blob()
      originalPosterUrl = URL.createObjectURL(blob)
    }
    
    // 创建新的Image对象并设置跨域
    const posterImage = new Image()
    posterImage.crossOrigin = 'anonymous'
    const qrcodeImage = new Image()
    
    // 使用Promise.all等待两个图片都加载完成
    const [poster, qrcode] = await Promise.all([
      new Promise((resolve, reject) => {
        posterImage.onload = () => resolve(posterImage)
        posterImage.onerror = () => reject(new Error('海报图片加载失败'))
        posterImage.src = originalPosterUrl
      }),
      new Promise((resolve, reject) => {
        qrcodeImage.onload = () => resolve(qrcodeImage)
        qrcodeImage.onerror = () => reject(new Error('二维码图片加载失败'))
        qrcodeImage.src = qrcodePreview.value
      })
    ])
    
    // 设置画布尺寸
    canvas.width = poster.width
    canvas.height = poster.height
    
    // 完全清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 重新绘制原始海报
    ctx.drawImage(poster, 0, 0)
    
    // 计算二维码大小和位置
    const qrcodeSize = Math.min(poster.width, poster.height) * 0.15
    const padding = qrcodeSize * 0.1
    
    // 计算二维码位置
    let x, y
    switch (qrcodePosition.value) {
      case 'top-left':
        x = padding
        y = padding
        break
      case 'top-right':
        x = poster.width - qrcodeSize - padding
        y = padding
        break
      case 'bottom-left':
        x = padding
        y = poster.height - qrcodeSize - padding
        break
      case 'bottom-right':
        x = poster.width - qrcodeSize - padding
        y = poster.height - qrcodeSize - padding
        break
      default:
        throw new Error('无效的二维码位置')
    }
    
    // 绘制二维码
    ctx.drawImage(qrcode, x, y, qrcodeSize, qrcodeSize)
    
    // 更新海报URL
    const newPosterUrl = canvas.toDataURL('image/png')
    if (newPosterUrl.length > 0) {
      // 释放之前的URL对象
      if (!posterUrl.value.startsWith('data:')) {
        URL.revokeObjectURL(originalPosterUrl)
      }
      posterUrl.value = newPosterUrl
    } else {
      throw new Error('海报生成失败')
    }
  } catch (error) {
    console.error('添加二维码时发生错误:', error)
    ElMessage.error(`添加二维码失败: ${error.message}`)
    throw error
  } finally {
    // 确保在任何情况下都清理掉临时创建的URL对象
    const currentPosterUrl = posterUrl.value
    if (!currentPosterUrl.startsWith('data:')) {
      URL.revokeObjectURL(currentPosterUrl)
    }
  }
}

// const downloadPoster = async () => {
//   if (qrcodeFile.value) {
//     await addQRCodeToPoster()
//   }
//   const link = document.createElement('a')
//   link.href = posterUrl.value
//   link.download = '豆包海报.png'
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
// }
</script>

<style scoped>
.poster-container {
  padding: 40px;
  min-height: calc(100vh - 120px);
  background-color: #f5f5f7;
}

.content-wrapper {
  display: flex;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.left-panel {
  flex: 1;
  min-width: 400px;
  max-width: 600px;
}

.right-panel {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 24px;
}

.input-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.prompt-input {
  margin-bottom: 24px;
}

.quick-tags-section {
  margin-bottom: 24px;
}

.tag-category {
  margin-bottom: 20px;
}

.tag-category h3 {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.tag-item:hover {
  background-color: #f5f5f7;
  transform: translateY(-1px);
}

.control-section {
  display: flex;
  gap: 12px;
}

.ratio-select {
  width: 140px;
}

.generate-btn {
  flex: 1;
  height: 40px;
  font-weight: 500;
}

.preview-section {
  background: white;
  border-radius: 16px;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.poster-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.download-btn {
  width: 100%;
  height: 40px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    max-width: 100%;
  }
}
</style>