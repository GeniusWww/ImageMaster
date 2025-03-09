<template>
  <div style="width:100%;height:500px">
    <vue-cropper
    autoCrop
    :img="ImgUrl"
    ref="cropperRef"
    centerBox
    >
    
  </vue-cropper>
  <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-change="handleChange"
            :auto-upload="false"
            :show-file-list="false"
        >
            <el-button size="small" type="primary" v-if="ImgUrl===''">上传图片上传</el-button>

            <el-button size="small" type="primary" v-else>重新上传</el-button>
           
        </el-upload>

        <el-button size="small" type="primary" v-if="ImgUrl" @click="downloadCroppedImage">下载</el-button>
  
      </div>
 
</template>
<script setup>
import { VueCropper } from 'vue-cropper'
import {ref} from "vue"
const ImgUrl = ref('')
const cropperRef = ref(null)
//const outputType = ref('png')

const handleChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      ImgUrl.value = e.target.result
    }
    reader.readAsDataURL(file.raw)
}

 // 下载裁剪后图片的方法
const downloadCroppedImage = () => {
  if (cropperRef.value) {
    cropperRef.value.getCropData((data) => {
      // 创建一个临时的 <a> 元素用于下载
      const link = document.createElement('a');
      link.href = data;
      link.download = 'cropped-image.png';
      
      // 模拟点击下载链接
      document.body.appendChild(link);
      link.click();
      
      // 移除临时的 <a> 元素
      document.body.removeChild(link);
    });
  }
}
</script>

<style scoped>

</style>