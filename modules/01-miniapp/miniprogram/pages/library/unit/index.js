Page({
  data: {
    stage: '',
    grade: '',
    semester: '',
    subject: '',
    singleSubject: '',
    singleType: '',
    unitId: '',
    unitTitle: '',
  },

  onLoad(options) {
    this.setData({
      stage: options.stage || '',
      grade: options.grade || '',
      semester: options.semester || '',
      subject: options.subject || '',
      singleSubject: options.singleSubject || '',
      singleType: options.singleType || '',
      unitId: options.unitId || '',
      unitTitle: options.unitTitle || '',
    })
  },

  preview() {
    const menuId = 'menu_demo_1'
    wx.showLoading({ title: '加载预览中' })
    wx.u.getQuestionsForMenu(menuId).then((res) => {
      wx.hideLoading()
      const list = res.result || []
      if (!Array.isArray(list) || list.length < 1) {
        wx.showToast({ title: '暂无可预览题目（Mock）', icon: 'none' })
        return
      }

      const top = list.slice(0, 3)
      const lines = top.map((q, idx) => `${idx + 1}. ${q.title}\n答案：${q.answer || ''}`)
      wx.showModal({
        title: this.data.unitTitle || '同步试题（预览）',
        content: lines.join('\n\n'),
        confirmText: '去练习',
        cancelText: '关闭',
        success: (m) => {
          if (!m.confirm) return
          const menu = this.data.unitTitle || '单元练习（Mock）'
          wx.navigateTo({
            url: `/pages/learn/index?cateid=${encodeURIComponent(menuId)}&menu=${encodeURIComponent(menu)}`,
          })
        },
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '预览加载失败（Mock）', icon: 'none' })
    })
  },

  online() {
    wx.showActionSheet({
      itemList: ['练习', '测评'],
      success: () => {
        wx.showToast({ title: '在线做题后续接题库映射', icon: 'none' })
      },
    })
  },
})

