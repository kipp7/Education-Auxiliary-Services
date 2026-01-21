const homeConfig = require('../index/home-config.js')

Page({
  data: {
    newsList: (homeConfig && homeConfig.news) || [],
  },

  onPullDownRefresh() {
    this.setData({ newsList: (homeConfig && homeConfig.news) || [] })
    wx.stopPullDownRefresh()
  },

  handleAction(e) {
    const action = e.currentTarget.dataset.action
    if (!action || !action.type) return

    const type = action.type
    const url = action.url
    const text = action.text

    if (type === 'switchTab' && url) return wx.switchTab({ url })
    if (type === 'navigateTo' && url) return wx.navigateTo({ url })
    if (type === 'reLaunch' && url) return wx.reLaunch({ url })
    if (type === 'toast') return wx.showToast({ title: text || '敬请期待', icon: 'none' })
  },
})
