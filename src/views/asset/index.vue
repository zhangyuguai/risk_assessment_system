<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>资产列表 - {{ objectName }}</span>
        <el-button
          style="float: right"
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdd">
          添加资产
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="assetList"
        border
        style="width: 100%">
        <!-- 序号列 -->
        <el-table-column
          type="index"
          label="序号"
          width="80"
          align="center">
        </el-table-column>

        <!-- 资产名称 -->
        <el-table-column
          prop="asset_name"
          label="资产名称"
          width="180"
          show-overflow-tooltip>
        </el-table-column>

        <!-- 资产描述 -->
        <el-table-column
          prop="asset_description"
          label="资产描述"
          min-width="250"
          show-overflow-tooltip>
        </el-table-column>

        <!-- 负责人 -->
        <el-table-column
          prop="responsible_person"
          label="负责人"
          width="120"
          align="center">
        </el-table-column>

        <!-- 重要程度 -->
        <el-table-column
          prop="importance_level"
          label="重要程度"
          width="150"
          align="center">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.importance_level"
              disabled
              show-score
              text-color="#ff9900">
            </el-rate>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          label="操作"
          width="120"
          fixed="right"
          align="center">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="handleEdit(scope.row)">
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="handleDelete(scope.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogType === 'add' ? '添加资产' : '编辑资产'"
      :visible.sync="dialogVisible"
      width="650px"
      :close-on-click-modal="false"
      @close="resetForm">
      <el-form
        ref="assetForm"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="资产名称" prop="asset_name">
          <el-input v-model="form.asset_name" placeholder="请输入资产名称"></el-input>
        </el-form-item>

        <el-form-item label="资产描述" prop="asset_description">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.asset_description"
            placeholder="请输入资产描述">
          </el-input>
        </el-form-item>

        <el-form-item label="负责人" prop="responsible_person">
          <el-input v-model="form.responsible_person" placeholder="请输入负责人"></el-input>
        </el-form-item>

        <el-form-item label="重要程度" prop="importance_level">
          <el-rate
            v-model="form.importance_level"
            :max="5"
            show-score
            text-color="#ff9900">
          </el-rate>
        </el-form-item>

        <el-form-item label="威胁类型" prop="threat_type">
          <el-input
            type="textarea"
            :rows="2"
            v-model="form.threat_type"
            placeholder="请输入威胁类型">
          </el-input>
        </el-form-item>

        <el-form-item label="脆弱性" prop="vulnerability_name">
          <el-input
            type="textarea"
            :rows="2"
            v-model="form.vulnerability_name"
            placeholder="请输入脆弱性">
          </el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="威胁可能性" prop="threat_likelihood">
              <el-input-number
                v-model="form.threat_likelihood"
                :min="0"
                :max="5"
                controls-position="right">
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="威胁影响" prop="threat_impact">
              <el-input-number
                v-model="form.threat_impact"
                :min="0"
                :max="5"
                controls-position="right">
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ submitting ? '提交中...' : '确 定' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { selectAssets,deleteAsset,updateAsset,createAsset } from '@/api/asset'
import ro from "element-ui/src/locale/lang/ro";
import {mapGetters} from "vuex";

export default {
  data() {
    return {
      loading: false,
      assetList: [],
      objectId: null,
      objectName: '',
      deleteForm:{
        assetId: '',
        evalObjId: ''
      },
      dialogVisible: false,
      dialogType: 'add', // 'add' 或 'edit'
      submitting: false,
      form: {
        a_id: undefined,
        asset_name: '',
        asset_description: '',
        responsible_person: '',
        importance_level: 3,
        evaluation_object_id: 0,
        threat_impact: 0,
        threat_likelihood:0,
        threat_type:'',
        vulnerability_name:'',
      },
      rules: {
        asset_name: [
          { required: true, message: '请输入资产名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        asset_description: [
          { required: true, message: '请输入资产描述', trigger: 'blur' }
        ],
        responsible_person: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        importance_level: [
          { required: true, message: '请选择重要程度', trigger: 'change' }
        ],
        threat_type: [
          { required: true, message: '请输入威胁类型', trigger: 'blur' }
        ],
        vulnerability_name: [
          { required: true, message: '请输入脆弱性', trigger: 'blur' }
        ],
        threat_likelihood: [
          { required: true, message: '请输入威胁可能性', trigger: 'change' }
        ],
        threat_impact: [
          { required: true, message: '请输入威胁影响', trigger: 'change' }
        ]
      }
    }
  },
  computed:{
  ...mapGetters([
      'token',
      'name',
      'avatar',
      'roles',
      'userId'
    ]),
  },
  created() {
    console.log(this.name)
    console.log(this.roles)
    console.log(this.userId)
    // 从路由获取评估对象信息
    this.objectId = this.$cookie.get('objectId')
    console.log('asdsadas',this.objectId)
    this.objectName = this.$route.query.objectName || '未知评估对象'

    if (this.objectId) {
      this.fetchAssetList()
    } else {
      this.$message.error('未获取到评估对象ID')
    }
  },
  methods: {
    // 获取资产列表
    async fetchAssetList() {
      try {
        this.loading = true
        const res = await selectAssets(this.objectId)
        console.log('资产列表响应：', res) // 调试用

          this.assetList = res || []


      } catch (error) {
        console.error('获取资产列表失败：', error)
        this.$message.error(error.message || '获取资产列表失败')
      } finally {
        this.loading = false
      }
    },

    // 处理添加按钮点击
    handleAdd() {
      this.dialogType = 'add'
      // 重置表单，但保留评估对象ID
      this.form = {
        a_id: undefined,
        asset_name: '',
        asset_description: '',
        responsible_person: '',
        importance_level: 3,
        evaluation_object_id: parseInt(this.$route.query.objectId),
        threat_impact: 0,
        threat_likelihood: 0,
        threat_type: '',
        vulnerability_name: ''
      }
      this.dialogVisible = true
    },

    // 编辑资产
    handleEdit(row) {
      this.dialogType = 'edit'
      // 逐个赋值所有字段
      this.form.a_id = parseInt(row.a_id)
      this.form.asset_name = row.asset_name
      this.form.asset_description = row.asset_description
      this.form.responsible_person = row.responsible_person
      this.form.importance_level = parseInt(row.importance_level)
      this.form.evaluation_object_id = parseInt(this.$route.query.objectId)
      this.form.threat_impact = parseInt(row.threat_impact)
      this.form.threat_likelihood = parseInt(row.threat_likelihood)
      this.form.threat_type = row.threat_type
      this.form.vulnerability_name = row.vulnerability_name

      console.log('编辑表单数据：', this.form) // 调试用
      this.dialogVisible = true
    },

    // 删除后刷新列表
    async handleDelete(row) {
      this.$confirm('确认删除该资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.deleteForm={}
          this.deleteForm.assetId=row.a_id
          this.deleteForm.evalObjId=this.objectId
          console.log('删除表单数据：', this.deleteForm) // 调试用
          const res = await deleteAsset(this.deleteForm)

            this.$message.success('删除成功')
            await this.fetchAssetList() // 删除成功后重新获取列表

        } catch (error) {
          console.error('删除失败：', error)
          this.$message.error(error.message || '删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
//实现新增功能
    // 重置表单
    resetForm() {
      this.$refs.assetForm?.resetFields()
      this.form = {
        a_id: undefined,
        asset_name: '',
        asset_description: '',
        responsible_person: '',
        importance_level: 3,
        evaluation_object_id: this.objectId
      }
      this.submitting = false
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.assetForm.validate()
        this.submitting = true

        if (this.dialogType === 'add') {
          // 新增资产
          const res = await createAsset(this.form)
            this.$message.success('添加成功')
            this.dialogVisible = false
            this.fetchAssetList()
        } else if (this.dialogType === 'edit') {
          // 原有的编辑逻辑
          const res = await updateAsset(this.form)

            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchAssetList()
        }
        this.dialogVisible=false
      } catch (error) {
        console.error('提交失败：', error)
        this.$message.error(error.message || '提交失败，请检查数据格式')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

/* 按钮间距 */
.el-button + .el-button {
  margin-left: 8px;
}

/* Rate 组件样式调整 */
:deep(.el-rate) {
  display: inline-block;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-rate) {
  display: inline-block;
  margin-top: 8px;
}

.el-input-number {
  width: 100%;
}

.el-textarea {
  font-size: 14px;
}
</style>
