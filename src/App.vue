<template>
  <div class="container">
    <div>时间:<input type="date" v-model="newDate" /></div>
    <div>名称:<input type="text" placeholder="请输入名称" v-model="newName" /></div>
    <div>单价:<input type="number" placeholder="单价" v-model.number="newPrice" style="width: 80px;" /></div>
    <div>数量:<input type="number" placeholder="数量" v-model.number="newQty" style="width: 80px;" /></div>
    <button @click="addItem">添加</button>

    <!-- 搜索输入框 -->
    <input type="text" placeholder="搜索事件名称或日期" v-model="searchKeyword" style="margin-left: 5px; padding: 6px;" />

    <el-table :data="filteredData" border stripe class="custom-table">
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="date" label="时间" width="120" />
      <el-table-column prop="name" label="事件名称" width="150" />
      <el-table-column prop="price" label="单价" width="100" />
      <el-table-column prop="qty" label="数量" width="100" />
      <el-table-column prop="total" label="总价" width="100" />

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
        <el-form-item label="单价">
          <el-input type="number" v-model.number="editForm.price" @input="computeTotal" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input type="number" v-model.number="editForm.qty" @input="computeTotal" />
        </el-form-item>
        <el-form-item label="总价">
          <el-input :value="editForm.total" disabled />
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

const tableData = ref([])
const newDate = ref('')
const newName = ref('')
const newPrice = ref(0)
const newQty = ref(0)
const searchKeyword = ref('')

// 页面加载时读取 localStorage
onMounted(() => {
  const saved = localStorage.getItem('event-list')
  if (saved) tableData.value = JSON.parse(saved)
})

// 监听 tableData 自动同步 localStorage
watch(
  tableData,
  (val) => localStorage.setItem('event-list', JSON.stringify(val)),
  { deep: true }
)

// 过滤数据
const filteredData = computed(() => {
  const key = searchKeyword.value.trim().toLowerCase()
  if (!key) return tableData.value
  return tableData.value.filter(item =>
    item.name.toLowerCase().includes(key) ||
    item.date.toLowerCase().includes(key)
  )
})

// 添加功能
function addItem() {
  if (!newDate.value || !newName.value || newPrice.value <= 0 || newQty.value <= 0) {
    alert('请输入完整内容且单价/数量必须大于0')
    return
  }

  tableData.value.push({
    date: newDate.value,
    name: newName.value,
    price: newPrice.value,
    qty: newQty.value,
    total: newPrice.value * newQty.value
  })

  // 清空输入框
  newDate.value = ''
  newName.value = ''
  newPrice.value = 0
  newQty.value = 0

  ElMessage.success('添加成功')
}

// 删除功能
function confirmDelete(index) {
  ElMessageBox.confirm('确认删除这条记录吗？', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).then(() => {
    tableData.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => { })
}

// 编辑功能
const editVisible = ref(false)
const editForm = ref({ date: '', name: '', price: 0, qty: 0, total: 0 })
const editingIndex = ref(-1)

function confirmEdit(row, index) {
  ElMessageBox.confirm('确定要编辑这条记录吗？', '编辑确认', {
    type: 'info',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(() => openEdit(row, index))
    .catch(() => { })
}

function openEdit(row, index) {
  editingIndex.value = index
  editForm.value = { ...row }
  editVisible.value = true
}

// 编辑弹窗中计算总价
function computeTotal() {
  editForm.value.total = (editForm.value.price || 0) * (editForm.value.qty || 0)
}

// 保存编辑
function saveEdit() {
  tableData.value[editingIndex.value] = { ...editForm.value }
  editVisible.value = false
}
</script>

<style scoped>
input {
  margin: 0 5px 5px 0;
  padding: 6px;
}

.custom-table {
  margin-top: 20px;
}
</style>
