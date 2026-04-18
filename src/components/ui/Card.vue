<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'muted' | 'outline' | 'destructive'
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    class="rounded-lg border bg-card text-card-foreground shadow"
    :class="{ 'border-border': variant === 'default' || variant === 'secondary' }"
  >
    <slot />
  </component>
</template>
