const categoryIcons: Record<string, string> = {
  mouse: 'mouse',
  keyboard: 'keyboard',
  headset: 'headphones',
  gaming: 'sports_esports',
  microphone: 'mic',
  monitor: 'desktop_windows',
}

export function getProductCategoryIcon(category: string): string {
  return categoryIcons[category.trim().toLowerCase()] || 'category'
}
