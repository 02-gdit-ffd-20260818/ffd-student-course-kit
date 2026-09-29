<template>
  <div class="links">
    <div class="link-container">
      <div
        class="link-item"
        v-for="(item, index) in linkList"
        :key="index"
        @click="openLink(item.url)"
      >
        <div class="link-icon">
          <img :src="item.icon" :alt="item.name" />
        </div>
        <span class="link-name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const linkList = ref([]);

// 打开链接
const openLink = (url) => {
  window.open(url, '_blank');
};

// 初始化链接列表
onMounted(() => {
  // 默认链接列表
  linkList.value = [
    {
      name: "用户管理",
      icon: "/images/icon/qq.png",
      url: "#/user-management",
    },
    {
      name: "班级管理",
      icon: "/images/icon/github.png",
      url: "#/classes",
    },
    {
      name: "照片墙",
      icon: "/images/icon/email.png",
      url: "#/photo-wall",
    },
  ];
});
</script>

<style scoped>
.links {
  width: 100%;
  margin-top: 20px;
}

.link-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.link-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.link-name {
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
}
</style>