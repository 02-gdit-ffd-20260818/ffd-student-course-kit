<script setup>
defineProps({ item:{type:Object,required:true} })
</script>
<template>
 <figure class="article-media">
  <!-- 任务一：在这里补上带src、alt、loading属性的图片标签。 -->
  <p v-if="item.type==='image'">请完成图片标签</p>
  <!-- 任务二：音频或视频任选一种，补上controls与preload属性。 -->
  <p v-else>请完成音频或视频播放器</p>
  <figcaption>{{item.caption}}</figcaption>
 </figure>
</template>
