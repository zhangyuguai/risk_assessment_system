import { login, logout, getInfo } from '@/api/user'
import { 
  getToken, 
  setToken, 
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
} from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  const userInfo = getUserInfo() || {}
  return {
    token: getToken(),
    name: userInfo.name || '',
    avatar: userInfo.avatar || '',
    userId: userInfo.userId || 0,
    roles: userInfo.roles || []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response
          // 存储token
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          
          // 存储用户基本信息
          const userInfo = {
            userId: data.userId,
            name: data.name,
            avatar: data.avatar,
            roles: data.roles || []
          }
          setUserInfo(userInfo)
          
          // 更新vuex状态
          commit('SET_USER_ID', userInfo.userId)
          commit('SET_NAME', userInfo.name)
          commit('SET_AVATAR', userInfo.avatar)
          commit('SET_ROLES', userInfo.roles)
          
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.userId)
        .then(response => {
          const { data } = response

          if (!data) {
            reject('Verification failed, please Login again.')
            return
          }

          // 更新cookie中的用户信息
          setUserInfo(data)
          
          // 更新vuex状态
          const { name, avatar, userId, roles } = data
          commit('SET_NAME', name)
          commit('SET_AVATAR', avatar)
          commit('SET_USER_ID', userId)
          commit('SET_ROLES', roles)
          
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 退出登录
  logout({ commit }) {
    return new Promise(resolve => {
      // 清除cookie
      removeToken()
      removeUserInfo()
      
      // 重置路由
      resetRouter()
      
      // 重置vuex状态
      commit('RESET_STATE')
      
      resolve()
    })
  },

  // 重置token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken()
      removeUserInfo()
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

