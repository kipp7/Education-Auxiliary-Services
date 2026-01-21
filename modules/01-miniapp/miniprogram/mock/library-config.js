module.exports = {
  banners: [
    {
      id: 'lib_b1',
      title: '章节练习',
      desc: '快速进入题库筛选',
      action: { type: 'toast', text: '章节练习后续接真实数据（Mock）' },
    },
    {
      id: 'lib_b2',
      title: '真题/测评',
      desc: '开始一次模拟测评',
      action: { type: 'navigateTo', url: '/pages/exam-menu/index' },
    },
    {
      id: 'lib_b3',
      title: '学习技巧',
      desc: '资讯入口待接入',
      action: { type: 'toast', text: '资讯模块待接入（Mock）' },
    },
  ],
}

