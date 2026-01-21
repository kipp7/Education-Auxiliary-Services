const NEWS = {
  n1: {
    id: 'n1',
    title: '金榜学伴 · 上线试运行',
    date: '2026-01-21',
    tag: '公告',
    content: '欢迎体验原型。\n\n本期重点：\n- 题库：初中/单招筛选与单元入口\n- 课程：播放页续播（Mock）\n- 我的：SVIP 绑定（Mock）\n\n后续将逐步接入真实数据与权限。',
  },
  n2: {
    id: 'n2',
    title: '学习小技巧：高效复习三步法',
    date: '2026-01-20',
    tag: '学习',
    content: '1) 做题：限定时间，模拟真实考试\n2) 复盘：统计错题与薄弱点\n3) 回看：错题重做 + 总结方法\n\n坚持 7 天会看到明显提升。',
  },
}

Page({
  data: {
    id: '',
    detail: {
      title: '资讯详情（Mock）',
      date: '',
      tag: '',
      content: '',
    },
  },

  onLoad(options) {
    const id = options?.id ? decodeURIComponent(options.id) : ''
    this.setData({ id })
    const detail = NEWS[id] || NEWS.n1
    this.setData({ detail })
  },
})
