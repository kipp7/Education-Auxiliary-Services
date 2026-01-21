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
        durationSeconds: 750,
        cover: '/images/BG.png',
      },
      {
        id: 'c_demo_2',
        title: '示例课程：错题整理与复盘',
        desc: '帮助提升正确率与复习效率。',
        durationText: '08:10',
        durationSeconds: 490,
        cover: '/images/BG.png',
      },
    ],
  },

  onLoad() {},

  onShow() {
    const courseList = (this.data.courseList || []).map((c) => {
      const seconds = Number(wx.getStorageSync(this.getProgressKey(c.id)) || 0)
      const currentSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
      const totalSeconds = Number.isFinite(c.durationSeconds) ? Math.max(1, Math.floor(c.durationSeconds)) : 1
      const percent = Math.max(0, Math.min(100, Math.floor((currentSeconds / totalSeconds) * 100)))
      return {
        ...c,
        currentSeconds,
        progressPercent: percent,
        progressText: currentSeconds > 0 ? `进度：${percent}%（${currentSeconds}s）` : '进度：未开始',
      }
    })
    this.setData({ courseList })
  },

  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    this.setData({ stage })
  },

  goPlay(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/course/player?id=${encodeURIComponent(id || '')}` })
  },

  getProgressKey(id) {
    return `course_progress_${id}`
  },
})
