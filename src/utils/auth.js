import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const UserInfoKey = 'User-Info'

// Token相关操作
export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 用户信息相关操作
export function getUserInfo() {
  const userInfo = Cookies.get(UserInfoKey)
  return userInfo ? JSON.parse(userInfo) : null
}

export function setUserInfo(userInfo) {
  return Cookies.set(UserInfoKey, JSON.stringify(userInfo))
}

export function removeUserInfo() {
  return Cookies.remove(UserInfoKey)
}
