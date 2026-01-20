const list = [
  {
    id: "n1",
    title: "欢迎使用金榜题库（演示）",
    time: "2026-01-20",
    cover: "/images/BG.png",
    content: "这是一个演示资讯，用于给客户预览 UI 效果。后续会接入真实后台数据。"
  }
]

Page({
  data: {
    item: {}
  },
  onLoad(options) {
    const id = options.id
    const item = list.find((x) => x.id === id) || list[0]
    this.setData({ item })
  }
})

