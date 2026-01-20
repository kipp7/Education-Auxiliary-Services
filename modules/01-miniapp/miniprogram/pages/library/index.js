// pages/library/index.js
const { APP_NAME } = require('../../config/index')

Page({
  data: {
    mode: 'learn',
    cateList: [],
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: `${APP_NAME} · 题库` })
    wx.showLoading({ title: '正在加载' })
    wx.u
      .getQuestionMenu()
      .then((res) => {
        this.setData({ cateList: Array.isArray(res.result) ? res.result : [] })
      })
      .finally(() => wx.hideLoading())
  },

  setMode(e) {
    const mode = e.currentTarget.dataset.mode
    if (mode !== 'learn' && mode !== 'exam') return
    this.setData({ mode })
  },

  goCate(e) {
    const cateid = e.currentTarget.dataset.cateid
    const menu = e.currentTarget.dataset.menu
    if (this.data.mode === 'learn') {
      wx.navigateTo({ url: `/pages/learn/index?cateid=${cateid}&menu=${menu}` })
      return
    }
    wx.navigateTo({ url: `/pages/exam/index?cateid=${cateid}&menu=${menu}` })
  },
})

