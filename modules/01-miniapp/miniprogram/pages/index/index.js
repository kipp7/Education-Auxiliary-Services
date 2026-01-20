const config = require('../../config/index')

Page({
  data: {
    appName: config.APP_NAME,
    userInfo: {},
    useLearn: true,
    is_login: true,
    checkUser: false,
    canIUseGetUserProfile: false,
    cateList: [],
    newsTop: {
      id: "n1",
      title: `欢迎使用${config.APP_NAME}（演示）`,
      time: "2026-01-20",
      cover: "/images/BG.png",
      content: "这是一个演示资讯，用于给客户预览 UI 效果。"
    }
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({ canIUseGetUserProfile: true })
    }

    wx.u.getSetting('useLearn').then(res => {
      let useLearn = true
      if (res.result.value == "false") useLearn = false
      this.setData({ useLearn })
    })

    wx.u.getSetting('checkUser').then(res => {
      let checkUser = false
      if (res.result.value == "true") checkUser = true
      this.setData({ checkUser })
    })

    wx.u.getQuestionMenu().then((res) => {
      const list = Array.isArray(res.result) ? res.result : []
      this.setData({ cateList: list.slice(0, 3) })
    })
  },

  onShow() {
    wx.setNavigationBarTitle({ title: config.APP_NAME })
    this.setData({ userInfo: wx.getStorageSync('userInfo') })
  },

  goMy() {
    wx.switchTab({ url: '/pages/my/index' })
  },

  onAvatarTap() {
    if (this.data.userInfo && this.data.userInfo.avatarUrl) {
      this.goMy()
      return
    }
    this.login()
  },

  goLibrary() {
    wx.switchTab({ url: '/pages/library/index' })
  },

  goNews() {
    wx.navigateTo({ url: '/pages/news/index' })
  },

  goNewsDetail() {
    wx.navigateTo({ url: `/pages/newsDetail/index?id=${this.data.newsTop.id}` })
  },
  goLearn() {
    if (this.data.useLearn) {
      wx.navigateTo({ url: '/pages/category/index?action=learn' })
      return
    }
    wx.showToast({ title: '练习模式未开启', icon: 'none' })
  },

  goWrong() {
    wx.navigateTo({ url: "/pages/wrong/index" })
  },

  goExam() {
    wx.switchTab({ url: '/pages/exam-menu/index' })
  },

  login() {
    this.setData({ is_login: !this.data.is_login })
  },

  bindgetuserinfo() {
    this.login()
    const that = this
    wx.getUserInfo({
      success(res) {
        wx.showLoading({ title: '授权登录中' })
        wx.u.getUserInfo().then(res1 => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl === '' || bmobUser.avatarUrl === undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => { })
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl
          res1.result.nickName = res.userInfo.nickName
          wx.setStorageSync('userInfo', res1.result)
          that.setData({ userInfo: res1.result })
          wx.hideLoading()
        })
      }
    })
  },

  getUserProfile() {
    this.login()
    const that = this
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        wx.showLoading({ title: '授权登录中' })
        wx.u.getUserInfo().then(res1 => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl === '' || bmobUser.avatarUrl === undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => { })
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl
          res1.result.nickName = res.userInfo.nickName
          wx.setStorageSync('userInfo', res1.result)
          that.setData({ userInfo: res1.result })
          wx.hideLoading()
        })
      }
    })
  },
  goCate(e) {
    const cateid = e.currentTarget.dataset.cateid
    const name = e.currentTarget.dataset.name || ""
    wx.navigateTo({ url: `/pages/learn/index?cateid=${cateid}&menu=${encodeURIComponent(name)}` })
  }
})
