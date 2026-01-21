//index.js
const { APP_NAME } = require('../../config/index')
const homeConfig = require('../../mock/home-config.js')

Page({
  data: {
    appName: APP_NAME,
    userInfo: {},
    useLearn:true,
    is_login:true,
    checkUser: false,
    canIUseGetUserProfile: false,
    svipBound: false,
    stageList: homeConfig.stageList || ['初中', '单招'],
    stage: (homeConfig.stageList && homeConfig.stageList[0]) || '初中',
    banners: homeConfig.banners || [],
    conversion: homeConfig.conversion || {},
    recommend: { courses: [], banks: [] },
  },

  onLoad: function() {
    this.refreshHomeByStage()
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
  goExam(){
    wx.navigateTo({ url: '/pages/exam-menu/index' })
  }
})
