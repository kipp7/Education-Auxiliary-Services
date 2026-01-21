module.exports = {
  stageList: ['初中', '单招'],
  banners: [
    {
      id: 'home_b1',
      title: '章节练习 · 快速进入题库',
      image: '/images/BG.png',
      action: { type: 'switchTab', url: '/pages/library/index' },
    },
    {
      id: 'home_b2',
      title: '模拟测评 · 开始一次考试',
      image: '/images/BG.png',
      action: { type: 'navigateTo', url: '/pages/exam-menu/index' },
    },
    {
      id: 'home_b3',
      title: 'SVIP 绑定 · 解锁课程能力（Mock）',
      image: '/images/BG.png',
      action: { type: 'navigateTo', url: '/pages/svip/bind/index' },
    },
  ],
  recommendByStage: {
    初中: {
      courses: [
        {
          id: 'c_demo_1',
          title: '数学基础精讲',
          subtitle: '函数与方程 · 45min',
          cover: '/images/BG.png',
          badge: 'SVIP',
          price: '¥199',
          action: { type: 'navigateTo', url: '/pages/course/index' },
        },
      ],
      banks: [
        {
          id: 'bank_junior_1',
          title: '七年级 · 数学题库',
          subtitle: '章节/随机练习',
          badge: '热门',
          action: { type: 'switchTab', url: '/pages/library/index' },
        },
      ],
    },
    单招: {
      courses: [
        {
          id: 'c_demo_s1',
          title: '单招英语阅读提分',
          subtitle: '答题技巧 · 30min',
          cover: '/images/BG.png',
          badge: '精品',
          price: '¥99',
          action: { type: 'navigateTo', url: '/pages/course/index' },
        },
      ],
      banks: [
        {
          id: 'bank_single_1',
          title: '单招 · 英语题库',
          subtitle: '专项训练',
          badge: '推荐',
          action: { type: 'switchTab', url: '/pages/library/index' },
        },
      ],
    },
  },
  conversion: {
    svipBind: {
      title: '绑定 SVIP',
      desc: '输入激活码，解锁课程入口（Mock）',
      action: { type: 'navigateTo', url: '/pages/svip/bind/index' },
    },
    svipOpen: {
      title: '付费开通',
      desc: '购买入口待接入（占位）',
      action: { type: 'toast', text: '付费开通入口待接入' },
    },
  },
  news: [
    {
      id: 'news_1',
      title: '学习技巧：如何规划 30 分钟复习？',
      desc: '高频建议 · 适合日常训练',
      action: { type: 'toast', text: '资讯详情待接入（Mock）' },
    },
    {
      id: 'news_2',
      title: '答题技巧：错题本该怎么用？',
      desc: '方法论 · 复盘与提升',
      action: { type: 'toast', text: '资讯详情待接入（Mock）' },
    },
  ],
}
