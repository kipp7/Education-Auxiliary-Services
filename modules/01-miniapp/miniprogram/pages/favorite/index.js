Page({
  data: {
    menuList: [],
  },

  onShow() {
    this.refresh()
  },

  onPullDownRefresh() {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh() {
    const list = wx.getStorageSync('fav_menuStorageList') || []
    this.setData({ menuList: Array.isArray(list) ? list : [] })
  },

  goLearn() {
    wx.navigateTo({ url: '../category/index?action=learn' })
  },

  goFavoriteDetail(e) {
    const cateid = e.currentTarget.dataset.cateid
    const menu = e.currentTarget.dataset.menu
    if (!cateid) return
    wx.navigateTo({
      url: `../errorStar/index?mode=fav&cateid=${encodeURIComponent(cateid)}&menu=${encodeURIComponent(menu || '')}`,
    })
  },
})
