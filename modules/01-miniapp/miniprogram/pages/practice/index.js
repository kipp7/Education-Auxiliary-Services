// pages/practice/index.js
const { APP_NAME } = require('../../config/index')

Page({
  data: {
    cateList: {},
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: `${APP_NAME} · 练习` })
    wx.showLoading({ title: '正在加载' })
    wx.u.getQuestionMenu().then((res) => {
      this.setData({ cateList: res.result })
      wx.hideLoading()
    })
  },

  goquestion(e) {
    const cateid = e.currentTarget.dataset.cateid
    const menu = e.currentTarget.dataset.menu
    wx.navigateTo({
      url: `/pages/learn/index?cateid=${cateid}&menu=${menu}`,
    })
  },
})

