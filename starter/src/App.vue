<script setup>
import { ref } from 'vue'
import MemberDetail from './components/MemberDetail.vue'
import MemberGrid from './components/MemberGrid.vue'
import { members } from './data/members.js'
import { publicMembers } from './domain/member.js'

const visibleMembers = publicMembers(members)
const selected = ref(null)
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#top" aria-label="群像云图首页">
      <span class="brand-mark" aria-hidden="true">群</span>
      <span>群像云图</span>
    </a>
    <p>P3 · v1.0 成员画像</p>
  </header>

  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <div>
        <p class="eyebrow">COMMUNITY PORTRAITS · 2026</p>
        <h1 id="hero-title">看见每个人，<br /><em>找到协作的可能。</em></h1>
        <p class="hero-copy">一份以最少采集为边界的成员公开目录。这里没有真实联系方式，也不展示未经授权的照片和介绍。</p>
        <a class="primary-button" href="#members">认识 {{ visibleMembers.length }} 位成员</a>
      </div>
      <div class="hero-orbit" aria-hidden="true">
        <span class="orbit orbit-one"></span>
        <span class="orbit orbit-two"></span>
        <strong>{{ visibleMembers.length }}</strong>
        <small>AUTHORIZED<br />PROFILES</small>
      </div>
    </section>

    <section id="members" class="members-section" aria-labelledby="members-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">MEMBER DIRECTORY</p>
          <h2 id="members-title">成员画像</h2>
        </div>
        <p>虚构教学数据 · 公开字段经过授权标记 · 保留至 2027-07-31</p>
      </div>
      <MemberGrid :members="visibleMembers" @select="selected = $event" />
    </section>

    <section class="privacy-strip" aria-labelledby="privacy-title">
      <p class="eyebrow">DATA PROMISE</p>
      <h2 id="privacy-title">字段有目的，公开有边界。</h2>
      <div class="privacy-grid">
        <p><strong>最少采集</strong><span>不采集电话、住址、身份证件和私人账号。</span></p>
        <p><strong>明确授权</strong><span>照片与个人介绍分别确认，成员可以撤回。</span></p>
        <p><strong>按期删除</strong><span>到期复核，无继续用途的数据及时移除。</span></p>
      </div>
    </section>
  </main>

  <footer><span>群像云图 P3 v1.0</span><span>为协作而认识，不为收集而收集。</span></footer>

  <div v-if="selected" class="detail-backdrop" @click.self="selected = null">
    <MemberDetail :member="selected" @close="selected = null" />
  </div>
</template>
