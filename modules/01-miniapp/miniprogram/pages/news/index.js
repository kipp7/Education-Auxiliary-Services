Page({
  data: {
    list: [
      {
        id: "n1",
        title: "欢迎使用金榜题库（演示）",
        time: "2026-01-20",
        cover: "/images/BG.png",
        content: "这是一个演示资讯，用于给客户预览 UI 效果。"
      }
    ]
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/newsDetail/index?id=${id}` })
  }
})

