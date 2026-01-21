// pages/examResult/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const rightNum = parseInt(options.rightNum || 0, 10) || 0
    const errNum = parseInt(options.errNum || 0, 10) || 0
    const unAnswerNum = parseInt(options.unAnswerNum || 0, 10) || 0
    const totalNum = rightNum + errNum + unAnswerNum
    const accuracy = totalNum > 0 ? Math.round((rightNum / totalNum) * 100) : 0

    var ytimesf = String(options.useTime || '00:00').split(":")[0]
    var ytimesm = String(options.useTime || '00:00').split(":")[1]
    this.setData({
      rightNum,
      errNum,
      unAnswerNum,
      totalNum,
      accuracy,
      ytimesf:ytimesf,
      ytimesm:ytimesm,
      cateid:options.cateid,
      menu:options.menu
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  clickRank:function(){
    wx.navigateTo({
      url: '/pages/rank/index?cateid='+this.data.cateid,
    })
  },
  exam_repeat:function(){
    wx.navigateTo({
      url: '/pages/category/index?action=exam',
    })
  },
  examBack:function(){
    wx.navigateTo({
      url: '../errorStar/index?cateid=' + this.data.cateid + '&menu=' + this.data.menu,
    })
  }
})
