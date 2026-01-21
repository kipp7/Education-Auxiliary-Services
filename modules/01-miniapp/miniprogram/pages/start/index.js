// pages/start/index.js
const { APP_NAME, COMPANY_NAME } = require('../../config/index')
const config = require('../../config/index')

Page({
  data: {
    appName: APP_NAME,
    companyName: COMPANY_NAME,

    userInfo: {},
    angle: 0,
    status: false, // 是否通过审核
    remind: '加载中',
    checkUser: false,
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: APP_NAME })
  },

  onShow() {
    const cached = wx.getStorageSync('userInfo') || {}
    if (config.USE_MOCK) {
      this.setData({
        userInfo: {
          avatarUrl: cached.avatarUrl || '/images/header.png',
          nickName: cached.nickName || '同学',
          ...cached,
        },
      })
      return
    }

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
      fail() {
        that.setData({
          userInfo: {
            avatarUrl: cached.avatarUrl || '/images/header.png',
            nickName: cached.nickName || '同学',
            ...cached,
          },
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
      const userInfo = this.data.userInfo
      if (userInfo.status === '1') {
        wx.switchTab({ url: '/pages/index/index' })
      } else if (userInfo.status === '0') {
        wx.navigateTo({ url: '/pages/status/index' })
      } else {
        wx.navigateTo({ url: '/pages/register/index' })
      }
    } else {
      wx.switchTab({ url: '/pages/index/index' })
    }

    wx.hideLoading()
  },
})
