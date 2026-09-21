<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">长风成卷</RouterLink>
      <nav aria-label="主导航"><slot name="navigation" /></nav>
    </header>
    <main id="main-content" class="main-content"><slot /></main>
    <footer class="site-footer">P2 v2.1 · SQLite 持久化</footer>
  </div>
</template>
