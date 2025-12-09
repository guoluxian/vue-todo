// 管理事件数据，localStorage、增删改查
/*
3.1 useEvents.js
管理事件数据（增删改查）
绑定 localStorage
过滤 / 搜索 / 分组逻辑
 */

import { ref, computed, watch } from 'vue'

export function useEvents() {
  const events = ref(JSON.parse(localStorage.getItem('event-list') || '[]'))

  watch(events, v => localStorage.setItem('event-list', JSON.stringify(v)), { deep: true })

  function addEvent(event) { events.value.push(event) }
  function deleteEvent(index) { events.value.splice(index, 1) }
  function updateEvent(index, newEvent) { events.value[index] = newEvent }

  const eventsByDate = computed(() => {
    const map = {}
    events.value.forEach(item => {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    })
    return map
  })

  function filterEvents(keyword) {
    const key = keyword.trim().toLowerCase()
    if (!key) return events.value
    return events.value.filter(item =>
      item.name.toLowerCase().includes(key) ||
      item.date.toLowerCase().includes(key) ||
      item.category.toLowerCase().includes(key)
    )
  }

  return { events, addEvent, deleteEvent, updateEvent, eventsByDate, filterEvents }
}
