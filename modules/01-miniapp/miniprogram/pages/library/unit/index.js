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
    wx.showToast({ title: '同步试题预览后置', icon: 'none' })
  },

  online() {
    wx.showActionSheet({
      itemList: ['练习', '测评'],
      success: (res) => {
        const menu = this.data.unitTitle || '单元练习（Mock）'
        const cateid = 'menu_demo_1'
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/learn/index?cateid=${encodeURIComponent(cateid)}&menu=${encodeURIComponent(menu)}`,
          })
          return
        }
        wx.navigateTo({
          url: `/pages/exam/index?cateid=${encodeURIComponent(cateid)}&menu=${encodeURIComponent(menu)}`,
        })
      },
    })
  },
})

