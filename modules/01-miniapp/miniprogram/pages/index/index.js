//index.js
const { APP_NAME } = require('../../config/index')
const homeConfig = require('./home-config.js')

function clampNumber(value, min, max) {
  const n = Number(value)
  if (Number.isNaN(n)) return min
  if (n < min) return min
  if (n > max) return max
  return n
}

Page({
  data: {
    appName: APP_NAME,
    userInfo: {},
    useLearn:true,
    is_login:true,
    checkUser: false,
    canIUseGetUserProfile: false,
    svipBound: false,
    stageList: homeConfig.stageList || [],
    stage: (homeConfig.stageList && homeConfig.stageList[0]) || '',
    banners: homeConfig.banners || [],
    conversion: homeConfig.conversion || {},
    recommend: { courses: [], banks: [] },
    showBannerDots: false,
    today: {
      targetMinutes: 45,
      learnedMinutes: 12,
      percent: 0,
    },
    newsList: homeConfig.news || [],
  },

  onLoad: function() {
    if (!this.data.stage && Array.isArray(this.data.stageList) && this.data.stageList.length > 0) {
      this.setData({ stage: this.data.stageList[0] })
    }
    this.refreshHomeByStage()
    this.refreshToday()
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    wx.u.getSetting('useLearn').then(res => {
      let useLearn = true
      if (res.result.value == "false")
        useLearn = false
      this.setData({
        useLearn: useLearn
      })
    })

    wx.u.getSetting('checkUser').then(res => {
      let checkUser = false
      if (res.result.value == "true")
        checkUser = true
      this.setData({
        checkUser: checkUser
      })
    })
  },
  onShow: function(){
    wx.setNavigationBarTitle({ title: APP_NAME })
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      svipBound: !!wx.getStorageSync('svip_bound'),
    })
    this.refreshToday()
  },
  gocenter() {
    wx.navigateTo({
      url: '../my/index',
    })
  },
  goWrong() {
    wx.navigateTo({ url: '/pages/wrong/index' })
  },
  goRank() {
    wx.navigateTo({ url: '/pages/category/index?action=rank' })
  },
  goLearn() {
    wx.switchTab({ url: '/pages/library/index' })
  },
  goCourse() {
    wx.switchTab({ url: '/pages/course/index' })
  },
  goContinue() {
    const lastCourseId = wx.getStorageSync('last_course_id')
    const lastMenuId = wx.getStorageSync('last_menu_id')
    if (lastCourseId) {
      wx.navigateTo({ url: `/pages/course/player?id=${encodeURIComponent(lastCourseId)}` })
      return
    }
    if (lastMenuId) {
      wx.navigateTo({ url: `/pages/learn/index?cateid=${encodeURIComponent(lastMenuId)}` })
      return
    }
    wx.showToast({ title: '暂无学习记录', icon: 'none' })
    wx.switchTab({ url: '/pages/course/index' })
  },
  goRecord() {
    wx.navigateTo({ url: '/pages/record/index' })
  },
  goFavorite() {
    wx.navigateTo({ url: '/pages/errorStar/index' })
  },
  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    if (stage === this.data.stage) return
    this.setData({ stage }, () => this.refreshHomeByStage())
  },
  refreshHomeByStage() {
    const stage = this.data && this.data.stage
    const map = homeConfig.recommendByStage || {}
    const payload = map[stage] || { courses: [], banks: [] }
    this.setData({ recommend: payload })
  },
  refreshToday() {
    const targetMinutes = clampNumber(wx.getStorageSync('today_target_min') || 45, 10, 240)
    const learnedMinutes = clampNumber(wx.getStorageSync('today_learned_min') || 12, 0, targetMinutes)
    const percent = targetMinutes > 0 ? Math.round((learnedMinutes / targetMinutes) * 100) : 0
    this.setData({
      today: {
        targetMinutes,
        learnedMinutes,
        percent,
      },
    })
  },
  handleAction(e) {
    const action = e.currentTarget.dataset.action
    if (!action || !action.type) return

    const type = action.type
    const url = action.url
    const text = action.text

    if (type === 'switchTab' && url) return wx.switchTab({ url })
    if (type === 'navigateTo' && url) return wx.navigateTo({ url })
    if (type === 'reLaunch' && url) return wx.reLaunch({ url })
    if (type === 'toast') return wx.showToast({ title: text || '敬请期待', icon: 'none' })
  },
  login() {
    this.setData({
      is_login:!this.data.is_login
    })
  },
  bindgetuserinfo: function () {
    this.login()
    var that = this
    wx.getUserInfo({
      success(res) {
        console.log(res)
        wx.showLoading({
          title: '授权登录中',
        })
        wx.u.getUserInfo().then(res1 => {
          var bmobUser = res1.result;
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(res2 => { });
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl;
          res1.result.nickName = res.userInfo.nickName;
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
          })
          wx.hideLoading()
        })
      }
    })
  },
  getUserProfile(e) {
    console.log(this.data.canIUseGetUserProfile)
    this.login()
    var that = this
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        console.log(res)
        wx.showLoading({
          title: '授权登录中',
        })
        wx.u.getUserInfo().then(res1 => {
          var bmobUser = res1.result;
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(res2 => { });
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl;
          res1.result.nickName = res.userInfo.nickName;
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
          })
          wx.hideLoading()
        })
      }
    })
  },
  goExamMenu(){
    wx.navigateTo({ url: '/pages/exam-menu/index' })
  },
  goExam() {
    this.goExamMenu()
  },

  onBannerTouchStart() {
    if (this._bannerDotsTimer) clearTimeout(this._bannerDotsTimer)
    if (!this.data.showBannerDots) this.setData({ showBannerDots: true })
  },

  onBannerTouchEnd() {
    if (this._bannerDotsTimer) clearTimeout(this._bannerDotsTimer)
    this._bannerDotsTimer = setTimeout(() => {
      this._bannerDotsTimer = null
      if (this.data.showBannerDots) this.setData({ showBannerDots: false })
    }, 1200)
  }
})
