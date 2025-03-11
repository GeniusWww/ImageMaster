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