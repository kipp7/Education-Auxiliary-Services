Page({
  data: {
    newsList: [
      {
        id: 'n1',
        title: '金榜学伴 · 上线试运行',
        date: '2026-01-21',
        tag: '公告',
        summary: '欢迎体验原型：题库/课程/我的等功能将逐步完善。',
      },
      {
        id: 'n2',
        title: '学习小技巧：高效复习三步法',
        date: '2026-01-20',
        tag: '学习',
        summary: '做题→复盘→错题回看，用短周期迭代提升正确率。',
      },
    ],
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id || ''
    wx.navigateTo({
      url: `/pages/news/detail?id=${encodeURIComponent(id)}`,
    })
  },
})
