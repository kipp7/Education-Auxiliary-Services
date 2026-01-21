//index.js
const { APP_NAME } = require('../../config/index')
const homeConfig = require('../../mock/home-config.json')

Page({
  data: {
    appName: APP_NAME,
    userInfo: {},
    useLearn:true,
    is_login:true,
    checkUser: false,
    canIUseGetUserProfile: false,
    homeConfig,
    svipBound: false,
  },

  onLoad: function() {
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
  goNews() {
    wx.switchTab({ url: '/pages/news/index' })
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
  },
  onBizTap(e) {
    const type = e.currentTarget.dataset.type || ''
    const url = e.currentTarget.dataset.url || ''
    const text = e.currentTarget.dataset.text || ''
    if (type === 'switchTab' && url) {
      wx.switchTab({ url })
      return
    }
    if (type === 'navigateTo' && url) {
      wx.navigateTo({ url })
      return
    }
    if (type === 'toast') {
      wx.showToast({ title: text || '功能后置（Mock）', icon: 'none' })
      return
    }
    wx.showToast({ title: '跳转占位（Mock）', icon: 'none' })
  },
})
