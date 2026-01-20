const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const config = require('../config/index')
const mockData = require('./mockData')
const { request } = require('./request')

function wrapResult(result) {
  return Promise.resolve({ result })
}

function notImplemented(name) {
  return Promise.resolve({ result: [], message: `${name} not implemented` })
}
/**
 * 获取用户信息
 */
const getUserInfo = () => {
  if (config.USE_MOCK) {
    const user = wx.getStorageSync('userInfo') || {}
    return wrapResult(user)
  }
  // TODO: 对接真实后端用户信息接口
  return request({ path: '/me' }).then((res) => ({ result: res }))
}

/**
 * 保存用户头像昵称
 * avatarUrl：头像
 * nickName:昵称
 */
const changeUserInfo = (avatarUrl, nickName) => {
  if (config.USE_MOCK) {
    const user = wx.getStorageSync('userInfo') || {}
    const next = { ...user, avatarUrl, nickName }
    wx.setStorageSync('userInfo', next)
    return wrapResult('success')
  }
  // TODO: 对接真实后端用户信息更新接口
  return request({ path: '/me', method: 'PUT', data: { avatarUrl, nickName } }).then(() => ({ result: 'success' }))
}

/**
 * 提交注册信息
 */
const register = (params) => {
  if (config.USE_MOCK) {
    const user = wx.getStorageSync('userInfo') || {}
    const next = {
      ...user,
      company: params.company,
      department: params.department,
      realname: params.realname,
      status: '0',
    }
    wx.setStorageSync('userInfo', next)
    return wrapResult('success')
  }
  // TODO: 对接真实后端注册/资料完善接口
  return request({ path: '/me/profile', method: 'POST', data: params }).then(() => ({ result: 'success' }))
}
/**
 * 收集formId
 */
const saveFormId = (formid)=>{
  if (config.USE_MOCK) return wrapResult('success')
  return notImplemented('saveFormId')
}

/**
 * 保存意见反馈
 */
const saveFeedback = (params)=>{
  if (config.USE_MOCK) return wrapResult('success')
  // TODO: 对接真实反馈接口
  return request({ path: '/feedback', method: 'POST', data: params })
    .then(() => ({ result: 'success' }))
    .catch(() => ({ result: 'fail' }))
}

/**
 * 获取分类列表
 */
const getQuestionMenu = () => {
  if (config.USE_MOCK) return wrapResult(mockData.getQuestionMenu())
  // TODO: 对接真实分类/题库包接口
  return request({ path: '/question-menus' }).then((res) => ({ result: res }))
}
/**
 * 获取分类详情
 */
const getMenuDetail =(id)=>{
  if (config.USE_MOCK) return wrapResult(mockData.getMenuDetail(id))
  // TODO: 对接真实题库详情接口
  return request({ path: `/question-menus/${id}` }).then((res) => ({ result: res }))
}

/**
 * 获取题目
 * menuId:套题id
 * questionNum:题目数量
 */
const getQuestions = (menuId, questionNum) => {
  if (config.USE_MOCK) {
    const list = mockData.getQuestionsForMenu(menuId)
    const limit = Number.isFinite(parseInt(questionNum, 10)) ? parseInt(questionNum, 10) : list.length
    return wrapResult(list.slice(0, limit))
  }
  // TODO: 对接真实题目列表接口
  return request({ path: `/question-menus/${menuId}/questions`, data: { limit: parseInt(questionNum) } }).then((res) => ({ result: res }))
}

/**
 * 用于替代原项目中 menuDetail.questionUrl 的直连 JSON 方式。
 * 后续对接真实后端时，只需要在这里实现“按题库取题”的接口即可。
 */
const getQuestionsForMenu = (menuId) => {
  if (config.USE_MOCK) return wrapResult(mockData.getQuestionsForMenu(menuId))
  return request({ path: `/question-menus/${menuId}/questions` }).then((res) => ({ result: res }))
}
/**
 * 保存成绩
 */
const saveScore = (params)=>{
  if (config.USE_MOCK) return wrapResult('success')
  return notImplemented('saveScore')
}

/**
 * 查询错题
 */
const getErrQuestionList = (params)=>{
  if (config.USE_MOCK) return wrapResult([])
  return notImplemented('getErrQuestionList')
}

/**
 * 查询排名
 */
const getRankList = (params)=>{
  if (config.USE_MOCK) return wrapResult([])
  return notImplemented('getRankList')
}

/**
 * 答题记录
 */
const historyList =()=>{
  if (config.USE_MOCK) return wrapResult([])
  return notImplemented('historyList')
}

/**
 * 获取设置信息
 */
const getSetting =(key)=>{
  if (config.USE_MOCK) return wrapResult({ key, value: mockData.getSetting(key) })
  // TODO: 对接真实配置接口
  return request({ path: `/settings/${encodeURIComponent(key)}` }).then((res) => ({ result: res }))
}

module.exports = {
  formatTime: formatTime,
  getUserInfo: getUserInfo,
  changeUserInfo: changeUserInfo,
  register: register,
  saveFormId: saveFormId,
  saveFeedback: saveFeedback,
  getQuestionMenu: getQuestionMenu,
  getMenuDetail: getMenuDetail,
  getQuestions: getQuestions,
  getQuestionsForMenu: getQuestionsForMenu,
  saveScore: saveScore,
  getErrQuestionList: getErrQuestionList,
  getRankList: getRankList,
  historyList: historyList,
  getSetting: getSetting
}
