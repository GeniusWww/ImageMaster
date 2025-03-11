<template>
    <div v-if="imageUrl===''">
        <el-upload
        class="upload-demo"
        drag
        action="https://jsonplaceholder.typicode.com/posts/"
        :on-change="handleChange"
        :auto-upload="false"
        multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" :v-slot="tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    </div> 
    <div v-if="imageUrl">
        <img class="copimg" style="height: 500px;width: 250;" :src="imageUrl" />
        <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-change="handleChange"
            :auto-upload="false"
            :show-file-list="false"
        >
            <el-button size="small" type="primary">重新上传</el-button>

           
        </el-upload>
        <el-button size="small" type="primary" @click="compressImage">压缩并下载</el-button>
       
    </div> 
    

</template>

<script setup>
import { ref, defineComponent } from 'vue'
import 'vue-cropper/dist/index.css'

defineComponent({
  name: 'ImageCompress'
})

const imageUrl = ref('')
const quality = ref('')
const handleChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        imageUrl.value = e.target.result
    }
    reader.readAsDataURL(file.raw)
}
const compressImage = () => {
    if (!imageUrl.value) return;
    const blob = dataURLtoBlob(imageUrl.value);
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    
    img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 设置canvas尺寸
        canvas.width = img.width
        canvas.height = img.height
        
        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0)
        
        // 压缩图片
        canvas.toBlob((compressedBlob) => {
            const compressedUrl = URL.createObjectURL(compressedBlob)
            console.log('压缩后的图片URL:', compressedUrl)
            // 这里可以添加下载或显示压缩后图片的逻辑
            downloadImage(compressedUrl)
        }, 'image/jpeg', quality)
    }
}
const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
};

const downloadImage = (url) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'compressed_image.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
</script>

<style scoped>

.upload-demo{
    height: 50px;
    width: 500px;
    
}
.upload{
    height:fit-content;
    width: fit-content;
}
</style>