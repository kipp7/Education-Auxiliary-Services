const config = require('../../config/index')

Page({
  data: {
    appName: config.APP_NAME,
    cateList: [],
  },

  onLoad() {
    wx.showLoading({ title: '正在加载' })
    wx.u
      .getQuestionMenu()
      .then((res) => {
        const list = Array.isArray(res.result) ? res.result : []
        const cateList = list.map((x) => ({
          ...x,
          total: x.total || x.questionTotal || x.questionNum || 0,
        }))
        this.setData({ cateList })
      })
      .finally(() => wx.hideLoading())
  },

  goLearn() {
    wx.navigateTo({ url: '/pages/category/index?action=learn' })
  },

  goExam() {
    wx.switchTab({ url: '/pages/exam-menu/index' })
  },

  goWrong() {
    wx.navigateTo({ url: '/pages/wrong/index' })
  },

  goFavorite() {
    wx.showToast({ title: '收藏功能待接入', icon: 'none' })
  },

  goDefaultLearn(e) {
    const cateid = e.currentTarget.dataset.cateid
    const name = e.currentTarget.dataset.name || ''
    wx.navigateTo({ url: `/pages/learn/index?cateid=${cateid}&menu=${encodeURIComponent(name)}` })
  },
})

