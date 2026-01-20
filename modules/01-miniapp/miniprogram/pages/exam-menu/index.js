// pages/exam-menu/index.js
const { APP_NAME } = require('../../config/index')

Page({
  data: {
    cateList: {},
    checkUser: false,
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: `${APP_NAME} · 答题` })
    wx.showLoading({ title: '正在加载' })

    wx.u.getSetting('checkUser').then((res) => {
      let checkUser = false
      if (res.result.value == 'true') checkUser = true
      this.setData({ checkUser })
    })

    wx.u.getQuestionMenu().then((res) => {
      this.setData({ cateList: res.result })
      wx.hideLoading()
    })
  },

  goquestion(e) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    if (userInfo.avatarUrl == undefined || userInfo.avatarUrl == '') {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.switchTab({ url: '/pages/my/index' })
      return
    }

    if (this.data.checkUser) {
      if (userInfo.status == '1') {
        // ok
      } else if (userInfo.status == '0') {
        wx.navigateTo({ url: '/pages/status/index' })
        return
      } else {
        wx.navigateTo({ url: '/pages/register/index' })
        return
      }
    }

    const cateid = e.currentTarget.dataset.cateid
    const menu = e.currentTarget.dataset.menu
    wx.navigateTo({
      url: `/pages/exam/index?cateid=${cateid}&menu=${encodeURIComponent(menu || '')}`,
    })
  },
})

