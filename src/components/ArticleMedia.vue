<script setup>
import { ref,watch } from 'vue'
const props=defineProps({ item:{type:Object,required:true} })
const failed=ref(false)
watch(()=>props.item.url,()=>{failed.value=false})
</script>
<template>
 <figure class="article-media">
  <template v-if="!failed">
   <img v-if="item.type==='image'" :src="item.url" :alt="item.alt" loading="lazy" @error="failed=true" />
   <audio v-else-if="item.type==='audio'" :src="item.url" :aria-label="item.caption||'文章音频'" controls preload="metadata" @error="failed=true" />
   <video v-else :src="item.url" :aria-label="item.caption||'文章视频'" controls playsinline preload="metadata" @error="failed=true" />
  </template>
  <p v-else role="status">媒体暂时无法播放或显示，请检查资源地址或文件格式。</p>
  <figcaption>{{item.caption}} <a :href="item.url" target="_blank" rel="noopener noreferrer">打开原文件</a></figcaption>
 </figure>
</template>
