<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="bg-card border-t border-border">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-semibold mb-4">關於符寶</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><RouterLink to="/about" class="hover:text-foreground transition-colors">平台介紹</RouterLink></li>
            <li><RouterLink to="/contact" class="hover:text-foreground transition-colors">聯繫我們</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-4">幫助中心</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><RouterLink to="/help" class="hover:text-foreground transition-colors">常見問題</RouterLink></li>
            <li><RouterLink to="/help/shipping" class="hover:text-foreground transition-colors">配送說明</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-4">服務保障</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><RouterLink to="/verify" class="hover:text-foreground transition-colors">證書驗證</RouterLink></li>
            <li><RouterLink to="/baike" class="hover:text-foreground transition-colors">知識百科</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-4">聯繫方式</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>客服郵箱：support@fubao.ltd</li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2024 符寶網 版權所有</p>
      </div>
    </div>
  </footer>
</template>
