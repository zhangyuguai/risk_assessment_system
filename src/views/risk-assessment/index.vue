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
            <div class="card-title">评估资产数</div>
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
            <div class="card-title">高风险资产</div>
            <div class="card-number">{{ getHighRiskCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #E6A23C">
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="card-content">
            <div class="card-title">平均风险值</div>
            <div class="card-number">{{ getAverageRisk }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #67C23A">
            <i class="el-icon-success"></i>
          </div>
          <div class="card-content">
            <div class="card-title">可接受风险比例</div>
            <div class="card-number">{{ getAcceptableRate }}%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">
            <span>风险等级分布</span>
          </div>
          <v-chart 
            ref="pieChart"
            :options="pieOptions" 
            :auto-resize="true" 
            class="chart"/>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">
            <span>资产风险矩阵</span>
          </div>
          <v-chart 
            ref="scatterChart"
            :options="scatterOptions" 
            :auto-resize="true" 
            class="chart"/>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <el-card shadow="hover" class="table-card">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-warning"></i> 资产风险评估表
        </span>
        <div style="float: right">
          <el-button-group>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd">
              添加评估
            </el-button>
            <el-button
              type="success"
              size="small"
              icon="el-icon-download"
              @click="handleExport">
              导出评估表
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
          prop="a_id"
          label="序号"
          width="60"
          align="center">
        </el-table-column>
        <el-table-column
          prop="asset_name"
          label="资产名称"
          width="120">
        </el-table-column>
        <el-table-column
          prop="importance_level"
          label="资产重要程度"
          width="120">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.importance_level"
              :max="5"
              disabled
              show-score
              text-color="#ff9900">
            </el-rate>
          </template>
        </el-table-column>
        <el-table-column
          prop="threat_likelihood"
          label="威胁发生可能性"
          width="120">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.threat_likelihood"
              :max="5"
              disabled
              show-score
              text-color="#ff9900">
            </el-rate>
          </template>
        </el-table-column>
        <el-table-column
          prop="threat_impact"
          label="威胁影响程度"
          width="120">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.threat_impact"
              :max="5"
              disabled
              show-score
              text-color="#ff9900">
            </el-rate>
          </template>
        </el-table-column>
        <el-table-column
          prop="threat_risk_factor"
          label="威胁风险系数"
          width="120">
          <template slot-scope="scope">
            {{ scope.row.threat_risk_factor }}
          </template>
        </el-table-column>
        <el-table-column
          prop="asset_risk_value"
          label="资产风险值"
          width="120">
          <template slot-scope="scope">
            {{ scope.row.asset_risk_value }}
          </template>
        </el-table-column>
        <el-table-column
          prop="acceptable_risk"
          label="是否可接受风险"
          width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.acceptable_risk ? 'success' : 'danger'">
              {{ scope.row.acceptable_risk ? '可接受' : '不可接受' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="risk_level"
          label="风险等级"
          width="100">
          <template slot-scope="scope">
            <el-tag :type="getRiskLevelType(scope.row.risk_level)">
              {{ getRiskLevelText(scope.row.risk_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="responsible_person"
          label="责任人"
          width="100">
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="650px">
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="120px">
        <el-form-item label="资产名称" prop="assetName">
          <el-input v-model="form.assetName"></el-input>
        </el-form-item>
        <el-form-item label="资产重要程度" prop="importance">
          <el-rate
            v-model="form.importance"
            :max="5"
            show-score
            text-color="#ff9900">
          </el-rate>
        </el-form-item>
        <el-form-item label="威胁" prop="threat">
          <el-input v-model="form.threat"></el-input>
        </el-form-item>
        <el-form-item label="威胁发生可能性" prop="probability">
          <el-slider
            v-model="form.probability"
            :step="0.01"
            :max="1">
          </el-slider>
        </el-form-item>
        <el-form-item label="威胁�����响程度" prop="impact">
          <el-slider
            v-model="form.impact"
            :step="0.01"
            :max="1">
          </el-slider>
        </el-form-item>
        <el-form-item label="是否可接受风险" prop="acceptable">
          <el-switch v-model="form.acceptable"></el-switch>
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
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/visualMap'
import cookie from "core-js/internals/internal-state";
import {selectAssets} from "@/api/asset";

export default {
  name: 'RiskAssessment',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加风险评估',
      objectId: undefined,
      form: {
        assetName: '',
        importance: 3,
        threat: '',
        probability: 0.5,
        impact: 0.5,
        acceptable: false
      },
      rules: {
        assetName: [
          { required: true, message: '请输入资产名称', trigger: 'blur' }
        ],
        importance: [
          { required: true, message: '请评定资产重要程度', trigger: 'change' }
        ],
        threat: [
          { required: true, message: '请输入威胁', trigger: 'blur' }
        ],
        probability: [
          { required: true, message: '请设置威胁发生可能性', trigger: 'change' },
          { type: 'number', min: 0, max: 1, message: '值必须在0到1之间' }
        ],
        impact: [
          { required: true, message: '请设置威胁影响程度', trigger: 'change' },
          { type: 'number', min: 0, max: 1, message: '值必须在0到1之间' }
        ]
      },
      tableData: [
        {
          id: 1,
          assetName: 'OA系统',
          importance: 4,
          threat: '未授权访问',
          probability: 0.6,
          impact: 0.8,
          riskFactor: '0.48',
          assetRiskValue: '0.384',
          acceptable: false,
          riskLevel: '高'
        }
      ]
    }
  },
  computed: {
    getHighRiskCount() {
      return this.tableData.filter(item => item.riskLevel === '高').length
    },
    getAverageRisk() {
      if (!this.tableData.length) return '0.00'
      const avg = this.tableData.reduce((sum, item) =>
        sum + parseFloat(item.assetRiskValue), 0) / this.tableData.length
      return avg.toFixed(2)
    },
    getAcceptableRate() {
      if (!this.tableData.length) return '0'
      const rate = (this.tableData.filter(item =>
        item.acceptable).length / this.tableData.length) * 100
      return rate.toFixed(0)
    },
    pieOptions() {
      const riskLevels = ['高', '中', '低']
      const data = riskLevels.map(level => ({
        name: level,
        value: this.tableData.filter(item => item.riskLevel === level).length
      }))

      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    },
    scatterOptions() {
      return {
        tooltip: {
          formatter: function(params) {
            return `${params.data.name}<br/>
                    可能性: ${params.data.probability}<br/>
                    影响程度: ${params.data.impact}<br/>
                    风险值: ${params.data.risk}`
          }
        },
        xAxis: {
          name: '威胁发生可能性',
          min: 0,
          max: 1
        },
        yAxis: {
          name: '威胁影响程度',
          min: 0,
          max: 1
        },
        visualMap: {
          min: 0,
          max: 1,
          dimension: 2,
          inRange: {
            color: ['#51A351', '#F89406', '#BD362F']
          }
        },
        series: [{
          type: 'scatter',
          symbolSize: 20,
          data: this.tableData.map(item => ({
            name: item.assetName,
            value: [
              item.probability,
              item.impact,
              parseFloat(item.assetRiskValue)
            ],
            probability: item.probability,
            impact: item.impact,
            risk: item.assetRiskValue
          }))
        }]
      }
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
          name: '风险值'
        },
        series: [{
          data: this.tableData.map(item => ({
            value: parseFloat(item.assetRiskValue),
            itemStyle: {
              color: this.getRiskColor(item.riskLevel)
            }
          })),
          type: 'bar',
          barWidth: '40%'
        }]
      }
    }
  },
  methods: {
    getImportanceType(importance) {
      return {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }[importance]
    },
    getProbabilityType(probability) {
      return {
        '高': 'danger',
        '���': 'warning',
        '���': 'success'
      }[probability]
    },
    getImpactType(impact) {
      return {
        '高': 'danger',
        '中': 'warning',
        '低': 'success'
      }[impact]
    },
    getRiskLevelType(level) {
      const types = {
        0: 'danger',   // 高风险
        1: 'warning',  // 中风险
        2: 'success'   // 低风险
      }
      return types[level] || 'info'
    },
    handleAdd() {
      this.dialogTitle = '添加风险评估'
      this.form = {
        assetName: '',
        importance: 3,
        threat: '',
        probability: 0.5,
        impact: 0.5,
        acceptable: false
      }
      this.dialogVisible = true
    },
    calculateRisk(row) {
      const riskFactor = row.probability * row.impact
      const assetRiskValue = riskFactor * (row.importance / 5)
      let riskLevel = '低'
      if (assetRiskValue > 0.6) {
        riskLevel = '高'
      } else if (assetRiskValue > 0.3) {
        riskLevel = '中'
      }
      return {
        riskFactor: riskFactor.toFixed(3),
        assetRiskValue: assetRiskValue.toFixed(3),
        riskLevel
      }
    },
    async getAssetList() {
      this.loading = true

      const res = await selectAssets(this.objectId)
      console.log(res)
      this.tableData = res
      console.log('asdasdas',this.tableData)

    this.loading = false
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const risk = this.calculateRisk(this.form)
          const newRow = {
            ...this.form,
            id: this.tableData.length + 1,
            riskFactor: risk.riskFactor,
            assetRiskValue: risk.assetRiskValue,
            riskLevel: risk.riskLevel
          }
          this.tableData.push(newRow)
          this.dialogVisible = false
          this.$message.success('保存成功')
        }
      })
    },
    handleExport() {
      this.$message.success('评估表导出成功')
    },
    getRiskColor(level) {
      const colors = {
        '高': '#BD362F',
        '中': '#F89406',
        '低': '#51A351'
      }
      return colors[level] || '#409EFF'
    },
    getRiskLevelText(level) {
      const texts = {
        0: '高',
        1: '中',
        2: '低'
      }
      return texts[level] || '未知'
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

.el-tag {
  margin-right: 5px;
}

.el-rate {
  display: inline-block;
  vertical-align: text-top;
}

.el-slider {
  width: 300px;
}

.el-table {
  margin-top: 20px;
}

.el-rate {
  display: inline-block;
}

.el-tag {
  margin-right: 5px;
}
</style>
