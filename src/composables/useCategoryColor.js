// 类别颜色映射逻辑
import { ref } from 'vue'
export function useCategoryColor() {
  const map = ref({})
  const colors = ['#ffd6e7', '#b3e5fc', '#d5f5e3', '#ffe0b2', '#f8bbd0', '#c5cae9']

  function getColor(category) {
    if (!category) return '#ffd6e7'
    if (!map.value[category]) {
      map.value[category] = colors[Object.keys(map.value).length % colors.length]
    }
    return map.value[category]
  }

  return { getColor }
}
