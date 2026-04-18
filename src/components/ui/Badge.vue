<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClass = computed(() => {
  const classes: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-[var(--input)] bg-background',
    ghost: 'bg-transparent',
  }
  return classes[props.variant] || classes.default
})
</script>

<template>
  <span 
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
    :class="variantClass"
  >
    <slot />
  </span>
</template>
