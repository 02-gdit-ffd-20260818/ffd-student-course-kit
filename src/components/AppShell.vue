<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">长风成卷</RouterLink>
      <nav aria-label="主导航"><slot name="navigation" /></nav>
    </header>
    <main id="main-content" class="main-content"><slot /></main>
    <footer class="site-footer">长风成卷 · 学习、实践与记录</footer>
  </div>
</template>
