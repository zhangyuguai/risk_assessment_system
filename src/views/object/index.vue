<script>
import {getObjects, addObject, createObject, updateObject, deleteObject} from "@/api/object";
import {mapGetters} from "vuex";
import * as XLSX from 'xlsx'

export default {
  name: 'ObjectIndex',
  data() {
    return {
      ObjectList: [],
      dialogVisible: false,
      dialogType: 'add',
      dialogTitle: '添加评估对象',
      form: {
        name: '',
        type: '',
        description: ''
      },
      rules: {
        name: [
          {required: true, message: '请输入对象名称', trigger: 'blur'},
          {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
        ],
        type: [
          {required: true, message: '请输入对象类型', trigger: 'blur'},
          {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
        ],
        description: [
          {required: true, message: '请输入对象描述', trigger: 'blur'},
          {max: 200, message: '描述不能超过200个字符', trigger: 'blur'}
        ]
      },
      submitting: false,
      filterForm: {
        name: '',
        type: '',
        dateRange: []
      },
      loading: false,
      currentPage: 1,
      pageSize: 10,
      importDialogVisible: false,
      fileList: [],
      importing: false,
      importData: []
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'name',
      'avatar',
      'roles',
      'userId'
    ]),
    filteredList() {
      let list = this.ObjectList || []
      console.log('Filtering list:', list)

      // 名称筛选
      if (this.filterForm.name) {
        list = list.filter(item =>
          item.name?.toLowerCase().includes(this.filterForm.name.toLowerCase())
        )
      }

      // 类型筛选
      if (this.filterForm.type) {
        list = list.filter(item =>
          item.type?.toLowerCase().includes(this.filterForm.type.toLowerCase())
        )
      }

      // 日期筛选
      if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
        const [startDate, endDate] = this.filterForm.dateRange
        list = list.filter(item => {
          const itemDate = item.created_at?.split(' ')[0]
          return itemDate && itemDate >= startDate && itemDate <= endDate
        })
      }

      console.log('Filtered list:', list)
      return list
    },
    getTypeCount() {
      return (type) => this.ObjectList.filter(item => item.type === type).length
    },
    getOtherTypeCount() {
      return this.ObjectList.filter(item =>
        item.type !== '人' && item.type !== '系统'
      ).length
    },
  },
  methods: {
    async init() {
      try {
        this.loading = true
        const res = await getObjects(this.userId)
        console.log('API Response:', res)

        if (res && res.data) {
          // 确保数据格式正确
          this.ObjectList = Array.isArray(res.data) ? res.data : [res.data]
        } else if (Array.isArray(res)) {
          this.ObjectList = res
        } else {
          this.ObjectList = []
        }

        console.log('ObjectList:', this.ObjectList)
      } catch (error) {
        console.error('获取数据失败：', error)
        this.$message.error('获取数据失败：' + error.message)
        this.ObjectList = []
      } finally {
        this.loading = false
      }
    },
    // handleView(row, type) {
    //   const routeMap = {
    //     asset: '/asset/index',
    //     vulnerability: '/vulnerability/index',
    //     threat: '/threat/index'
    //   }
    //
    //   this.$router.push({
    //     path: routeMap[type],
    //     query: {
    //       objectId: row.e_id,
    //       objectName: row.name
    //     }
    //   })
    // },
    handleView(row, type) {
      if (type === 'edit') {
        this.dialogType = 'edit'
        this.dialogTitle = 'Edit Object'
        this.form = {...row}
        this.dialogVisible = true
      } else {
        const routeMap = {
          asset: '/asset/index',
          vulnerability: '/vulnerability/index',
          threat: '/threat/index'
        }

        this.$router.push({
          path: routeMap[type],
          query: {
            objectId: row.e_id,
            objectName: row.name
          }
        })
      }
    },
    handleAdd() {
      this.dialogVisible = true
    },
    resetForm() {
      this.$refs.objectForm?.resetFields()
      this.form = {
        name: '',
        type: '',
        description: ''
      }
    },
    async submitForm() {
      if (this.dialogType === 'add') {
        await this.$refs.objectForm.validate()
        this.submitting = true
        this.form.userId = this.userId
        const res = await createObject(this.form)
        console.log(res)
        this.$message({
          type: 'success',
          message: '添加成功',
          duration: 2000
        })
      } else {
        await this.$refs.objectForm.validate()
        this.submitting = true
        // this.form.userId = this.userId
        console.log('form:', this.form)
        const res = await updateObject(this.form)
        console.log(res)
        this.$message({
          type: 'success',
          message: '修改成功',
          duration: 2000
        })
      }

      this.dialogVisible = false
      this.submitting = false
      await this.init()
    },
    handleFilter() {
      this.currentPage = 1
    },
    resetFilter() {
      this.filterForm = {
        name: '',
        type: '',
        dateRange: []
      }
      this.handleFilter()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleImport() {
      this.importDialogVisible = true
      this.fileList = []
      this.importData = []
    },
    handleFileChange(file) {
      if (file.raw) {
        this.fileList = [file]
        this.parseExcel(file.raw)
      }
    },
    // 解析 Excel 文件
    parseExcel(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target.result
          const workbook = XLSX.read(data, {type: 'array'})
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // 将工作表转换为数组（跳过表头行）
          const results = XLSX.utils.sheet_to_json(worksheet, {header: 1})

          // 过滤掉表头行，转换为对象数组
          this.importData = results.slice(1) // 跳过表头行
            .map(row => ({
              name: row[0], // 对象名称 (A列)
              type: row[1], // 对象类型 (B列)
              description: row[2] // 对象描述 (C列)
            }))
            .filter(item => item.name || item.type || item.description) // 过滤空行

          console.log('解析后的数据：', this.importData)

          if (this.importData.length === 0) {
            this.$message.warning('未检测到有效数据')
            return
          }

          // 数据验证
          const invalidData = this.importData.filter(item => {
            return !item.name || !item.type || !item.description ||
              item.name.length > 20 ||
              item.type.length > 20 ||
              item.description.length > 200
          })

          if (invalidData.length > 0) {
            this.$message.warning(`检测到 ${invalidData.length} 条数据不符合要求，请检查数据格式`)
            return
          }

          this.$message.success(`成功解析 ${this.importData.length} 条数据`)
        } catch (error) {
          console.error('解析文件失败：', error)
          this.$message.error('解析文件败，请检查文件格式是否正确')
        }
      }
      reader.readAsArrayBuffer(file)
    },
    // 确认导入
    async confirmImport() {
      if (!this.importData.length) {
        this.$message.warning('没有可导入的据')
        return
      }

      try {
        this.importing = true

        // 批量创建对象
        for (const item of this.importData) {
          await createObject({
            ...item,
            userId: this.userId
          })
        }

        this.$message.success(`成功导入 ${this.importData.length} 条数据`)
        this.importDialogVisible = false
        this.init() // 刷新列表
      } catch (error) {
        console.error('导入失败：', error)
        this.$message.error('导入失败：' + error.message)
      } finally {
        this.importing = false
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该对象吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        await deleteObject(row.e_id);
        this.$message.success('删除成功');
        await this.init();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
          this.$message.error('删除失败：' + error.message);
        }
      }
    },

  downloadTemplate() {
    var a = document.createElement("a");  // 创建一个<a />标签
    a.href = "static/object-template.xlsx";                  // 设置下载文件地址 注意：使用英文
    a.download = "excel模板.xlsx";        // 设置下载文件文件名
    a.style.display = "none";             // 隐藏a标签
    document.body.appendChild(a);         // 将a标签追加到文档对象中
    a.click();                            // 点击，浏览器自动下载
    a.remove();                           // 用完就删除<a />标签
  },
},
  created() {
    this.init()
  },
  watch: {
    ObjectList: {
      handler(newVal) {
        console.log('ObjectList changed:', newVal)
      },
      deep: true
    },
    filteredList: {
      handler(newVal) {
        console.log('filteredList changed:', newVal)
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 搜索筛选区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="对象名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入对象名称"
            clearable
            @clear="handleFilter"
            @keyup.enter.native="handleFilter">
          </el-input>
        </el-form-item>
        <el-form-item label="对象类型">
          <el-input
            v-model="filterForm.type"
            placeholder="请输入对象类型"
            clearable
            @clear="handleFilter"
            @keyup.enter.native="handleFilter">
          </el-input>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleFilter">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button plain icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="data-statistics">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <i class="el-icon-s-data"></i>
            <span>总对象数</span>
          </div>
          <div class="data-content">{{ ObjectList.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="icon-wrapper green">
              <i class="el-icon-user"></i>
            </div>
            <div class="data-info">
              <div class="data-title">人员对象</div>
              <div class="data-value">{{ getTypeCount('人') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="icon-wrapper orange">
              <i class="el-icon-s-platform"></i>
            </div>
            <div class="data-info">
              <div class="data-title">系统对象</div>
              <div class="data-value">{{ getTypeCount('系统') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <div class="icon-wrapper purple">
              <i class="el-icon-s-management"></i>
            </div>
            <div class="data-info">
              <div class="data-title">其他对象</div>
              <div class="data-value">{{ getOtherTypeCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 列表卡片 -->
    <el-card class="list-container" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">评估对象列表</span>
        <div class="right-btns">
          <el-button-group>
            <el-button
              type="info"
              size="small"
              icon="el-icon-download"
              @click="downloadTemplate">
              导入模板
            </el-button>
            <el-button
              type="success"
              size="small"
              icon="el-icon-upload2"
              @click="handleImport">
              导入列表
            </el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd">
              添加对象
            </el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredList"
        border
        style="width: 100%">
        <el-table-column prop="e_id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="对象名称" width="180"></el-table-column>
        <el-table-column prop="type" label="类型" width="120"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="450">
          <template slot-scope="scope">

            <el-button
              size="mini"
              type="info"
              @click="handleView(scope.row, 'edit')">
              编辑对象
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleView(scope.row, 'asset')">
              资产信息
            </el-button>
            <el-button
              size="mini"
              type="warning"
              @click="handleView(scope.row, 'vulnerability')">
              脆弱性
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleView(scope.row, 'threat')">
              威胁程度
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">
              删除对象
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredList.length">
        </el-pagination>
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="550px"
      :close-on-click-modal="false"
      @close="resetForm">
      <div class="dialog-content">
        <el-form
          ref="objectForm"
          :model="form"
          :rules="rules"
          label-width="90px"
          class="object-form">
          <el-form-item label="对象名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入对象名称"
              prefix-icon="el-icon-edit">
            </el-input>
          </el-form-item>
          <el-form-item label="对象类型" prop="type">
            <el-input
              v-model="form.type"
              placeholder="请输入对象类型"
              prefix-icon="el-icon-collection-tag">
            </el-input>
          </el-form-item>
          <el-form-item label="对象描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入对象描"
              resize="none">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" plain>取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ submitting ? '提交中...' : '确 定' }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="导入列表"
      :visible.sync="importDialogVisible"
      width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".xlsx,.xls">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传 xlsx/xls 文件</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmImport" :loading="importing">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.filter-container {
  margin-bottom: 20px;
  border-radius: 8px;
}

.data-statistics {
  margin-bottom: 20px;
}

.data-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.data-header {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.icon-wrapper i {
  font-size: 24px;
  color: white;
}

.blue { background-color: #409EFF; }
.green { background-color: #67C23A; }
.orange { background-color: #E6A23C; }
.purple { background-color: #909399; }

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.list-container {
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.right-btns {
  float: right;
}

.right-btns .el-button-group {
  margin-left: 10px;
}

.el-button-group .el-button {
  margin: 0;
}

.data-card {
  padding: 20px;
}

.data-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #606266;
}

.data-header i {
  font-size: 20px;
  margin-right: 10px;
  color: #409EFF;
}

.data-content {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

.right-btns {
  float: right;
}

.right-btns .el-button {
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.upload-demo {
  text-align: center;
}
.el-upload-dragger {
  width: 100%;
}
.el-upload__tip {
  margin-top: 10px;
  color: #909399;
}
</style>
