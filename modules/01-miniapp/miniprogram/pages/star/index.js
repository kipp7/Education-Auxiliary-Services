Page({
  data: {
    starMenuStorageList: [],
  },

  onShow() {
    const raw = wx.getStorageSync('starMenuStorageList')
    const starMenuStorageList = Array.isArray(raw) ? raw : []
    this.setData({ starMenuStorageList })
  },

  goLearn() {
    wx.switchTab({
      url: '/pages/library/index',
    })
  },

  goStar(e) {
    const cateid = e.currentTarget.dataset.cateid
    const menu = e.currentTarget.dataset.menu
    wx.navigateTo({
      url: `/pages/errorStar/index?cateid=${encodeURIComponent(cateid)}&menu=${encodeURIComponent(menu)}&mode=star`,
    })
  },
})

