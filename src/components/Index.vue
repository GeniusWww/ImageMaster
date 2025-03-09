<template>
 <el-container>
  <el-header>
    <el-menu :default-active="activeIndex" 
    class="el-menu-demo" 
    mode="horizontal" 
    @select="handleSelect"
    :router="true"
    >
        <img class="logo" src="../assets/logo.png" />
        <text class="text1">阿松图片大师</text>
        <el-menu-item index="/cut" >裁切图片</el-menu-item>
        <el-menu-item index="/compress">压缩图片</el-menu-item>
    </el-menu> 

  </el-header>
  <el-main>
    <router-view></router-view>
  </el-main>
  
</el-container>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref('/cut')
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
</style>