// pages/my/index.js
const { APP_NAME, COMPANY_NAME } = require('../../config/index')

const cellList = [
  {
    icon: '/images/icon_equipment_msg.png',
    title: '答题记录',
  },
  {
    icon: '/images/icon_center_phone.png',
    title: '分享好友',
  },
  {
    icon: '/images/icon_center_msg.png',
    title: '意见反馈',
    page: '../feedback/index',
  },
  {
    icon: '/images/icon_center_tj.png',
    title: '关于我们',
  },
  {
    icon: '/images/icon_center_tj.png',
    title: 'SVIP码绑定',
    page: '../svip/bind/index',
  },
]

Page({
  data: {
    cellList,
    is_login: true,
    canIUseGetUserProfile: false,
    svipBound: false,
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
  },

  onShow() {
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      svipBound: !!wx.getStorageSync('svip_bound'),
    })
  },

  onShareAppMessage(t) {
    return t.from, {
      title: `${APP_NAME} · 学习答题助手`,
      path: 'pages/start/index',
    }
  },

  go_view(e) {
    switch (1 * e.currentTarget.dataset.viewind) {
      case 0:
        if (this.data.userInfo.avatarUrl == undefined || this.data.userInfo.avatarUrl == '') {
          this.login()
          return
        }
        wx.navigateTo({
          url: '../record/index',
        })
        break
      case 1:
        break
      case 2:
        if (this.data.userInfo.avatarUrl == undefined || this.data.userInfo.avatarUrl == '') {
          this.login()
          return
        }
        wx.navigateTo({
          url: '../feedback/index',
        })
        break
      case 3:
        this.about()
        break
      case 4:
        wx.navigateTo({
          url: '../svip/bind/index',
        })
        break
    }
  },

  about() {
    wx.showModal({
      title: '关于我们',
      content: `${APP_NAME}由${COMPANY_NAME}提供服务，用于学习训练与测评辅助。`,
      showCancel: false,
    })
  },

  go_svip() {
    wx.navigateTo({
      url: '../svip/bind/index',
    })
  },

  login() {
    this.setData({
      is_login: !this.data.is_login,
    })
  },

  bindgetuserinfo() {
    this.login()
    const that = this
    wx.getUserInfo({
      success(res) {
        wx.showLoading({
          title: '授权登录中',
        })
        wx.u.getUserInfo().then((res1) => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => {})
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl
          res1.result.nickName = res.userInfo.nickName
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
          })
          wx.hideLoading()
        })
      },
    })
  },

  getUserProfile() {
    this.login()
    const that = this
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        wx.showLoading({
          title: '授权登录中',
        })
        wx.u.getUserInfo().then((res1) => {
          const bmobUser = res1.result
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(() => {})
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl
          res1.result.nickName = res.userInfo.nickName
          wx.setStorageSync('userInfo', res1.result)
          that.setData({
            userInfo: res1.result,
          })
          wx.hideLoading()
        })
      },
    })
  },
})

