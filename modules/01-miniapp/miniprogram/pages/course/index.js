Page({
  data: {
    stage: '初中',
    stageList: ['初中', '单招'],
    courseList: [
      {
        id: 'c_demo_1',
        title: '示例课程：学习方法与答题技巧',
        desc: '用于演示课程列表与播放页（后续接真实数据）。',
        durationText: '12:30',
        cover: '/images/BG.png',
      },
      {
        id: 'c_demo_2',
        title: '示例课程：错题整理与复盘',
        desc: '帮助提升正确率与复习效率。',
        durationText: '08:10',
        cover: '/images/BG.png',
      },
    ],
  },

  onLoad() {},

  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    this.setData({ stage })
  },

  goPlay(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/course/player?id=${encodeURIComponent(id || '')}` })
  },
})

