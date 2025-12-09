# vue-todo

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).



<template>
  <div class="container">
    <input type="date" v-model="newDate" />
    <input type="text" placeholder="请输入事件" v-model="newName" />
    <button @click="addItem">添加</button>

    搜索输入框
    <input type="text" placeholder="搜索事件名称或日期" v-model="searchKeyword" style="margin-left: 5px; padding: 6px;" />

    <el-table :data="filteredData" border stripe class="custom-table">
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="date" label="时间" width="180" />
      <el-table-column prop="name" label="事件名称" width="180" />

      <!-- 状态列（编辑 / 删除按钮） -->
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" @click="confirmEdit(scope.row, scope.$index)">编辑</el-button>
          <el-button type="danger" @click="confirmDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑事件" width="400px">
      <el-form>
        <el-form-item label="时间">
          <el-input v-model="editForm.date" />
        </el-form-item>
        <el-form-item label="事件名称">
          <el-input v-model="editForm.name" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="✔ 已完成" value="done" />
            <el-option label="✖ 未完成" value="pending" />
            <el-option label="⏳ 推迟" value="delay" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
/* 1~3(实现：
添加 → 自动保存到 localStorage
删除 → 自动保存
编辑 → 自动保存
刷新页面数据不会丢失
首次加载时自动从 localStorage 读取数据 */
// 1.初始化
const tableData = ref([])
const newDate = ref('')
const newName = ref('')
const searchKeyword = ref('')

// 2. 页面加载时，从 localStorage 取数据 
onMounted(() => {
  const saved = localStorage.getItem('event-list')
  if (saved) {
    tableData.value = JSON.parse(saved)
  }
})

// 3. 监听 tableData，每次变动都自动同步到 localStorage 
watch(
  tableData,
  (val) => {
    localStorage.setItem('event-list', JSON.stringify(val))
  },
  { deep: true }
)

//计算属性：过滤数据
const filteredData = computed(() => {
  const key = searchKeyword.value.trim().toLowerCase()

  // 如果没有输入关键词 → 显示全部
  if (!key) return tableData.value

  return tableData.value.filter(item => {
    return (
      item.name.toLowerCase().includes(key) ||
      item.date.toLowerCase().includes(key)
    )
  })
})
// 4.添加功能
function addItem() {
  if (!newDate.value || !newName.value) {
    alert('请输入完整内容')
    return
  }

  // push 到 tableData.value
  tableData.value.push({
    date: newDate.value,
    name: newName.value,
  })

  // 清空输入框
  newDate.value = ''
  newName.value = ''

  ElMessage.success('添加成功')
}

// 5.删除 
function confirmDelete(index) {
  ElMessageBox.confirm(
    '确认删除这条记录吗？',
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    }
  )
    .then(() => {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => { })
}

//6.编辑功能
const editVisible = ref(false)  // 控制弹窗显示
const editForm = ref({ date: '', name: '' }) // 弹窗内的数据
const editingIndex = ref(-1) // 当前编辑的行

// 点击编辑前 → 弹确认框
function confirmEdit(row, index) {
  ElMessageBox.confirm(
    '确定要编辑这条记录吗？',
    '编辑确认',
    {
      type: 'info',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }
  )
    .then(() => {
      openEdit(row, index)
    })
    .catch(() => { })
}

// 打开编辑窗
function openEdit(row, index) {
  editingIndex.value = index
  editForm.value = { ...row } // 复制数据
  editVisible.value = true
}

// 保存编辑
function saveEdit() {
  tableData.value[editingIndex.value] = { ...editForm.value }
  editVisible.value = false
}
</script>