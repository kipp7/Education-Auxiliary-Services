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
      success: () => {
        wx.showToast({ title: '在线做题后续接题库映射', icon: 'none' })
      },
    })
  },
})

