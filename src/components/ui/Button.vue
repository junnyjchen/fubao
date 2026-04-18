<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
})
</script>

<template>
  <span
    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    :class="[
      variant === 'default' ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90' : '',
      variant === 'secondary' ? 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80' : '',
      variant === 'destructive' ? 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90' : '',
      variant === 'outline' ? 'border border-[var(--input)] bg-background shadow-sm hover:bg-accent hover:text-accent-foreground' : '',
      variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : '',
      size === 'default' ? 'h-9 px-4 py-2' : '',
      size === 'sm' ? 'h-8 rounded-md px-3 text-xs' : '',
      size === 'lg' ? 'h-10 rounded-md px-8' : '',
      size === 'icon' ? 'h-9 w-9' : '',
    ]"
  >
    <slot />
  </span>
</template>
