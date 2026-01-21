const newsConfig = require('../../mock/news-config.json')

Page({
  data: {
    list: [],
  },

  onLoad() {
    this.setData({ list: newsConfig.list || [] })
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/news/detail?id=${encodeURIComponent(id)}` })
  },
})

