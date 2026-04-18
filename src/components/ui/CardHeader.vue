<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  as?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  as: 'div',
})
</script>

<template>
  <div class="flex flex-col space-y-1.5 p-6">
    <slot />
  </div>
</template>
