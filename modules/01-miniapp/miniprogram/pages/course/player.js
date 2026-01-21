Page({
  data: {
    id: '',
    resumeSeconds: 0,
    tip: '',
    currentSeconds: 0,
    svipBound: false,
  },

  onLoad(options) {
    const id = options.id || ''
    this.setData({ id })
    if (id) wx.setStorageSync('last_course_id', id)

    const key = this.getProgressKey(id)
    const seconds = Number(wx.getStorageSync(key) || 0)
    const resumeSeconds = Number.isFinite(seconds) ? seconds : 0
    if (resumeSeconds > 0) {
      this.setData({
        resumeSeconds,
        tip: `检测到上次播放进度：${Math.floor(resumeSeconds)}s（Mock）`,
      })

      wx.showModal({
        title: '继续播放？',
        content: `检测到上次进度 ${Math.floor(resumeSeconds)}s，是否从此处继续（Mock）？`,
        cancelText: '重新开始',
        confirmText: '继续',
        success: (res) => {
          const nextSeconds = res.confirm ? resumeSeconds : 0
          this.setData({ currentSeconds: nextSeconds })
          wx.setStorageSync(this.getProgressKey(this.data.id), nextSeconds)
        },
      })
      return
    }

    this.setData({ currentSeconds: 0 })
  },

  onShow() {
    this.setData({
      svipBound: !!wx.getStorageSync('svip_bound'),
    })
  },

  getProgressKey(id) {
    return `course_progress_${id}`
  },

  addTenSeconds() {
    const nextSeconds = (Number(this.data.currentSeconds) || 0) + 10
    this.setData({ currentSeconds: nextSeconds })
    wx.setStorageSync(this.getProgressKey(this.data.id), nextSeconds)
  },

  onSliderChange(e) {
    const nextSeconds = Number(e.detail.value || 0)
    this.setData({ currentSeconds: nextSeconds })
    wx.setStorageSync(this.getProgressKey(this.data.id), nextSeconds)
  },

  goBindSvip() {
    wx.navigateTo({
      url: '/pages/svip/bind/index',
    })
  },
})
