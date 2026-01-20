// pages/start/index.js
const config = require('../../config/index')

Page({
  data: {
    appName: config.APP_NAME,
    companyName: config.COMPANY_NAME,

    userInfo: {},
    angle: 0,
    status: false, // 是否通过审核
    remind: '加载中',
    checkUser: false,
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: config.APP_NAME })
  },

  onShow() {
    const that = this
    wx.getUserInfo({
      success(res) {
        wx.u.getUserInfo().then((res1) => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl === '' || bmobUser.avatarUrl === undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => {})
          }
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
            finish: true,
          })
        })
      },
    })

    // wx.u.getSetting('checkUser').then(res => {
    //   let checkUser = false
    //   if (res.result.value == "true")
    //     checkUser = true
    //   this.setData({
    //     checkUser: checkUser
    //   })
    // })
  },

  onReady() {
    setTimeout(() => {
      this.setData({ remind: '' })
    }, 1000)
  },

  bindgetuserinfo() {
    const that = this
    wx.getUserInfo({
      success(res) {
        wx.u.getUserInfo().then((res1) => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl === '' || bmobUser.avatarUrl === undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => {})
          }
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
          })
        })
      },
    })
  },

  goSign() {
    wx.showLoading({ title: '正在加载' })

    if (this.data.checkUser) {
      const userInfo = this.data.userInfo || {}
      if (userInfo.status === '1') {
        wx.hideLoading()
        wx.switchTab({ url: '/pages/index/index' })
        return
      }
      if (userInfo.status === '0') {
        wx.hideLoading()
        wx.navigateTo({ url: '/pages/status/index' })
        return
      }
      wx.hideLoading()
      wx.navigateTo({ url: '/pages/register/index' })
      return
    }

    wx.hideLoading()
    wx.switchTab({ url: '/pages/index/index' })
  },
})
