
<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #409EFF">
            <i class="el-icon-s-data"></i>
          </div>
          <div class="card-content">
            <div class="card-title">资产总数</div>
            <div class="card-number">{{ tableData.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #F56C6C">
            <i class="el-icon-warning"></i>
          </div>
          <div class="card-content">
            <div class="card-title">威胁总数</div>
            <div class="card-number">{{ getTotalThreats }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #E6A23C">
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="card-content">
            <div class="card-title">平均威胁数</div>
            <div class="card-number">{{ getAverageThreats }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #67C23A">
            <i class="el-icon-s-marketing"></i>
          </div>
          <div class="card-content">
            <div class="card-title">威胁类型数</div>
            <div class="card-number">{{ threatTypeStats.uniqueTypes }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>威胁类型分布</span>
          </div>
          <v-chart
            :options="pieOptions"
            :auto-resize="true"
            class="chart"/>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>资产威胁数量对比</span>
          </div>
          <v-chart
            :options="barOptions"
            :auto-resize="true"
            class="chart"/>
        </el-card>
      </el-col>
    </el-row>

    <!-- 原有的表格部分 -->
    <el-card class="table-card">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-warning-outline"></i> 重要资产威胁识别表
        </span>
        <div class="right-btns">
          <el-button-group>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd">
              添加威胁
            </el-button>
            <el-button
              type="success"
              size="small"
              icon="el-icon-download"
              @click="handleExport">
              导出表格
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="id"
          label="序号"
          width="80"
          align="center">
        </el-table-column>
        <el-table-column
          prop="assetName"
          label="资产名称"
          width="180">
        </el-table-column>
        <el-table-column
          prop="threatTypes"
          label="威胁类"
          min-width="300">
          <template slot-scope="scope">
            <el-tag
              v-for="(threat, index) in scope.row.threatTypes"
              :key="index"
              size="medium"
              style="margin: 2px">
              {{ threat }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="350"
          fixed="right"
          align="center">
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px">
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px">
        <el-form-item label="资产名称" prop="assetName">
          <el-input v-model="form.assetName"></el-input>
        </el-form-item>
        <el-form-item label="威胁类" prop="threatTypes">
          <el-checkbox-group v-model="form.threatTypes">
            <el-checkbox label="篡改用户或业务数据信息"></el-checkbox>
            <el-checkbox label="控制和破坏用户或业务数据"></el-checkbox>
            <el-checkbox label="滥用权限泄漏秘密信息"></el-checkbox>
            <el-checkbox label="数据篡改"></el-checkbox>
            <el-checkbox label="探测窃密"></el-checkbox>
            <el-checkbox label="未授权访问"></el-checkbox>
            <el-checkbox label="未授权访问系统资源"></el-checkbox>
            <el-checkbox label="用户或业务数据的窃取"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import { selectAssets } from "@/api/asset";

export default {
  name: 'Threat',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加威胁',
      objectId: null,
      form: {
        assetName: '',
        threatTypes: []
      },
      rules: {
        assetName: [
          { required: true, message: '请输入资产名称', trigger: 'blur' }
        ],
        threatTypes: [
          { type: 'array', required: true, message: '请至少选择一个威胁类型', trigger: 'change' }
        ]
      },
      tableData: []
    }
  },
  computed: {
    getTotalThreats() {
      return this.tableData.reduce((sum, item) => sum + item.threatTypes.length, 0)
    },
    getAverageThreats() {
      return this.tableData.length ?
        (this.getTotalThreats / this.tableData.length).toFixed(1) : 0
    },
    pieOptions() {
      const threatCounts = {};
      this.tableData.forEach(item => {
        item.threatTypes.forEach(threat => {
          threatCounts[threat] = (threatCounts[threat] || 0) + 1;
        });
      });

      const sortedData = Object.entries(threatCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({
          name,
          value,
          label: {
            show: true,
            formatter: '{b}: {c}个\n({d}%)'
          }
        }));

      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>数量: {c}个<br/>占比: {d}%'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 'middle',
          formatter: name => {
            const item = sortedData.find(d => d.name === name);
            return `${name}: ${item ? item.value : 0}个`;
          }
        },
        series: [{
          name: '威胁类型分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}个\n{d}%',
            alignTo: 'edge',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15
          },
          labelLine: {
            length: 15,
            length2: 0,
            maxSurfaceAngle: 80
          },
          emphasis: {
            label: {
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: sortedData
        }]
      };
    },
    barOptions() {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: this.tableData.map(item => item.assetName),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '威胁数量'
        },
        series: [{
          data: this.tableData.map(item => item.threatTypes.length),
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
    },
    threatTypeStats() {
      const stats = {
        total: 0,
        types: new Set()
      }

      this.tableData.forEach(item => {
        if (item.threatTypes && item.threatTypes.length) {
          stats.total += item.threatTypes.length
          item.threatTypes.forEach(type => stats.types.add(type))
        }
      })

      return {
        total: stats.total,
        uniqueTypes: stats.types.size
      }
    }
  },
  methods: {
    handleAdd() {
      this.dialogTitle = '添加威胁'
      this.form = {
        assetName: '',
        threatTypes: []
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑威胁'
      this.form = {
        id: row.id,
        assetName: row.assetName,
        threatTypes: [...row.threatTypes]
      }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该威胁记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.tableData.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.tableData.splice(index, 1)
          this.$message.success('删除成功')
        }
      }).catch(() => {})
    },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              ...this.form,
              objectId: this.objectId
            }

            if (this.form.id) {
              const index = this.tableData.findIndex(item => item.id === this.form.id)
              if (index > -1) {
                this.tableData[index] = { ...this.form }
              }
            } else {
              this.tableData.push({
                id: Date.now(),
                ...this.form
              })
            }

            this.dialogVisible = false
            this.$message.success('保存成功')
          } catch (error) {
            this.$message.error('保存失败')
            console.error(error)
          }
        }
      })
    },
    handleExport() {
      this.$message.success('表格导出成功')
    },
    async getAssetList() {
      this.loading = true
      try {
        const res = await selectAssets(this.objectId)
        if (!res) {
          this.$message.error('获取资产列表失败')
          return
        }

        this.tableData = (res || []).map((item, index) => ({
          id: item.a_id,
          assetName: item.asset_name,
          threatTypes: item.threat_type ? item.threat_type.split('；') : []
        }))

      } catch (error) {
        console.error('获取资产列表失败:', error)
        this.$message.error('获取资产列表失败')
      } finally {
        this.loading = false
      }
    }
  },
  async created() {
    const objectId = this.$cookie.get('objectId')
    if (!objectId) {
      this.$message.error('缺少评估对象ID参数')
      return
    }
    this.objectId = objectId
    await this.getAssetList()
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.el-checkbox {
  display: block;
  margin-left: 0 !important;
  margin-bottom: 10px;
}

.el-tag {
  margin-right: 5px;
}

.dashboard-cards {
  margin-bottom: 20px;
}

.data-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.card-icon i {
  font-size: 24px;
  color: white;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-top: 20px;
}

.chart {
  height: 300px;
}

.table-card {
  margin-top: 20px;
}

.right-btns {
  float: right;
}
</style>
```

