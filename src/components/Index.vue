<template>
 <el-container>
  <el-header>
    <el-menu :default-active="$route.path" 
    class="el-menu-demo" 
    mode="horizontal" 
    @select="handleSelect"
    :router="true"
    >
        <img class="logo" src="../assets/logo.png" />
        <text class="text1">阿松图片大师</text>
        <el-menu-item index="/cut" >裁切图片</el-menu-item>
        <el-menu-item index="/compress">压缩图片</el-menu-item>
        <el-menu-item index="/watermark">添加水印</el-menu-item>
        <el-menu-item index="/subtitle">字幕生成器</el-menu-item>
        <el-menu-item index="/poster">豆包海报</el-menu-item>
        <el-button 
          type="primary" 
          class="signin" 
          @click="$router.push('/signinup')">登录</el-button>
    </el-menu> 

  </el-header>
  <el-main>
    <KeepAlive :include="['ImageCut', 'ImageCompress', 'WaterMark', 'SubtitleGenerator']">
      <router-view></router-view>
    </KeepAlive>
  </el-main>
  <el-footer>
    <a href="https://github.com/GeniusWww" target="_blank">
    <img src="../assets/github-fill.png" alt="">
  </a>
  <a href="https://okjk.co/mWL1os" target="_blank">
    <img src="../assets/jike.png" alt="">
  </a>
  </el-footer>
</el-container>
</template>

<script setup>
//import { ref } from 'vue'

//const activeIndex = ref('/cut')
</script>

<style scoped>
  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 50px;
    background-color: #fff;
    
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    height: 800px;
    display: flex;
    justify-content: center;
  }

  .el-menu-demo {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .logo {
    position: absolute;
    left: 20px;
    height: 40px;
    margin: 10px 0;
  }
  .text1 {
    position: absolute;
    left: 60px;
    height: 40px;
    margin: 10px 0;
  }
  .signin{
    position: absolute;
    right: 1px;
    height: 40px;
    margin: 10px 0;
  }
</style>