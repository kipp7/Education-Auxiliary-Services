const newsConfig = require('../../mock/news-config.json')

Page({
  data: {
    item: null,
  },

  onLoad(options) {
    const id = options && options.id
    const list = newsConfig.list || []
    const item = list.find((x) => x.id === id) || null
    this.setData({ item })
    if (item && item.title) wx.setNavigationBarTitle({ title: item.title })
  },
})
