Page({
  data: {
    stage: '初中',
    stageList: ['初中', '单招'],
    svipBound: false,
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

  onShow() {
    const svipBound = !!wx.getStorageSync('svip_bound')
    const courseList = (this.data.courseList || []).map((item) => {
      const seconds = Number(wx.getStorageSync(this.getProgressKey(item.id)) || 0)
      const progressSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
      return {
        ...item,
        progressSeconds,
        progressText: progressSeconds ? `${Math.floor(progressSeconds)}s` : '',
      }
    })
    this.setData({ svipBound, courseList })
  },

  getProgressKey(id) {
    return `course_progress_${id}`
  },

  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    this.setData({ stage })
  },

  goPlay(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.setStorageSync('last_course_id', id)
    if (!this.data.svipBound) {
      wx.showModal({
        title: 'SVIP 未开通',
        content: '当前仅支持浏览封面与简介；绑定 SVIP 后可观看（Mock）。',
        confirmText: '去绑定',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) return
          wx.navigateTo({ url: '/pages/svip/bind/index' })
        },
      })
      return
    }
    wx.navigateTo({ url: `/pages/course/player?id=${encodeURIComponent(id || '')}` })
  },
})

