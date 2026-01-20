Page({
  data: {
    id: '',
    resumeSeconds: 0,
    tip: '',
  },

  onLoad(options) {
    const id = options.id || ''
    this.setData({ id })

    const key = this.getProgressKey(id)
    const seconds = Number(wx.getStorageSync(key) || 0)
    const resumeSeconds = Number.isFinite(seconds) ? seconds : 0
    if (resumeSeconds > 0) {
      this.setData({
        resumeSeconds,
        tip: `检测到上次播放进度：${Math.floor(resumeSeconds)}s（演示）`,
      })
    }
  },

  getProgressKey(id) {
    return `course_progress_${id}`
  },

  onTimeUpdate(e) {
    const currentTime = e?.detail?.currentTime
    if (!Number.isFinite(currentTime)) return
    wx.setStorageSync(this.getProgressKey(this.data.id), currentTime)
  },
})

