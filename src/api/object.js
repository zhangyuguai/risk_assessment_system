import request from '@/utils/request'

// 获取评估对象列表
export function getObjects(userId) {
  return request({
    url: '/selectAllEvaluationObject',
    method: 'get',
    params: {
      userId
    }
  })
}

// 获取单个评估对象
export function getObject(id) {
  return request({
    url: `/objects/${id}`,
    method: 'get'
  })
}

// 创建评估对象
export function createObject(data) {
  return request({
    url: '/insertEvaluationobject',
    method: 'post',
    data
  })
}

// 获取资产信息
export function getAssets(objectId) {
  return request({
    url: `/objects/${objectId}/assets`,
    method: 'get'
  })
}

// 获取脆弱性信息
export function getVulnerabilities(objectId) {
  return request({
    url: `/objects/${objectId}/vulnerabilities`,
    method: 'get'
  })
}

// 获取威胁信息
export function getThreats(objectId) {
  return request({
    url: `/objects/${objectId}/threats`,
    method: 'get'
  })
}

// 更新对象
export function updateObject(data) {
  return request({
    url: `/updateEvaluationObject`,
    method: 'post',
    data
  })
}

// 删除对象
export function deleteObject(id) {
  return request({
    url: `/deleteEvaluationObject`,
    method: 'delete',
    data: {
      e_id: id
    }
  })
}

