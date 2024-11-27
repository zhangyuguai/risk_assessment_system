import request from "@/utils/request";

export function deleteAsset(data) {
  return request({
    url: '/deleteAsset',
    method: 'delete',
    params: {
      assetId: parseInt(data.assetId),
      evalObjId: parseInt(data.evalObjId)
    }
  })
}

export function createAsset(data) {
  return request({
    url: '/insertAssets',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: JSON.stringify({
      asset_name: data.asset_name,
      asset_description: data.asset_description,
      responsible_person: data.responsible_person,
      importance_level: parseInt(data.importance_level),
      evaluation_object_id: parseInt(data.evaluation_object_id),
      threat_impact: parseInt(data.threat_impact),
      threat_likelihood: parseInt(data.threat_likelihood),
      threat_type: data.threat_type,
      vulnerability_name: data.vulnerability_name
    })
  })
}

export function updateAsset(data) {
  return request({
    url: '/updateAsset',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: JSON.stringify({
      a_id: parseInt(data.a_id),
      evaluation_object_id: parseInt(data.evaluation_object_id),
      asset_name: data.asset_name,
      asset_description: data.asset_description,
      responsible_person: data.responsible_person,
      importance_level: parseInt(data.importance_level),
      threat_impact: parseInt(data.threat_impact),
      threat_likelihood: parseInt(data.threat_likelihood),
      threat_type: data.threat_type,
      vulnerability_name: data.vulnerability_name
    })
  })
}

// 获取资产列表
export function selectAssets(evalObjId) {
  return request({
    url: '/selectAssets',
    method: 'get',
    params: {
      evalObjId: parseInt(evalObjId)
    }
  })
}
