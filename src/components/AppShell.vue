<template>
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="#/">长风成卷</a>
      <nav aria-label="主导航"><slot name="navigation" /></nav>
    </header>
    <main id="main-content" class="main-content"><slot /></main>
    <footer class="site-footer">P2 v1.0 · 用作品记录学习</footer>
  </div>
</template>
