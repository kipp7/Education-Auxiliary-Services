Page({
  data: {
    code: '',
    statusType: '',
    statusText: '',
    svipBound: false,
    boundAtText: '',
    mockOkCode: 'JLXB-SVIP-OK',
  },

  onShow() {
    this.refreshStatus()
  },

  refreshStatus() {
    const svipBound = !!wx.getStorageSync('svip_bound')
    const boundAt = wx.getStorageSync('svip_bound_at')
    this.setData({
      svipBound,
      boundAtText: boundAt ? new Date(boundAt).toLocaleString() : '',
    })
  },

  onInput(e) {
    this.setData({ code: e.detail.value || '' })
  },

  clear() {
    this.setData({ code: '', statusType: '', statusText: '' })
  },

  submit() {
    const code = String(this.data.code || '').trim()
    if (!code) {
      this.setData({ statusType: 'err', statusText: '请输入 SVIP 码（Mock）' })
      return
    }

    if (code !== this.data.mockOkCode) {
      this.setData({ statusType: 'err', statusText: 'SVIP 码无效（Mock）' })
      return
    }

    wx.setStorageSync('svip_bound', true)
    wx.setStorageSync('svip_bound_at', Date.now())
    this.setData({ statusType: 'ok', statusText: '绑定成功：SVIP 已开通（Mock）' })
    this.refreshStatus()
  },

  unbind() {
    wx.removeStorageSync('svip_bound')
    wx.removeStorageSync('svip_bound_at')
    this.setData({ statusType: 'ok', statusText: '已解除绑定（本地）' })
    this.refreshStatus()
  },
})
