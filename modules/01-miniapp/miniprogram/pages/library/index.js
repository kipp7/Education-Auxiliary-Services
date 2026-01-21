// pages/library/index.js
const config = require('../../config/index')

const juniorGrades = ['初一', '初二', '初三']
const juniorSemesters = ['上册', '下册']
const juniorSubjects = ['语文', '数学', '英语', '物理', '化学']

const singleSubjects = ['信息技术', '通用技术', '音乐鉴赏', '美术鉴赏', '劳动技术']
const singleTypes = ['选择', '判断', '论述']

const banners = [
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
    desc: '查看最新资讯',
    action: { type: 'switchTab', url: '/pages/news/index' },
  },
]

function makeUnits(prefix) {
  return Array.from({ length: 6 }).map((_, idx) => ({
    id: `${prefix}_u${idx + 1}`,
    title: `${prefix} · 第${idx + 1}单元`,
    subtitle: '同步试题(预览) / 在线做题(练习/测评)',
  }))
}

function getJuniorSubjectList(grade) {
  const g = String(grade || '')
  if (g === '初一') return ['语文', '数学', '英语']
  if (g === '初二') return ['语文', '数学', '英语', '物理']
  return juniorSubjects
}

Page({
  data: {
    appName: config.APP_NAME,

    stageList: ['初中', '单招'],
    stage: '初中',

    gradeList: juniorGrades,
    semesterList: juniorSemesters,
    subjectList: getJuniorSubjectList(juniorGrades[0]),

    singleSubjectList: singleSubjects,
    singleTypeList: singleTypes,

    grade: juniorGrades[0],
    semester: juniorSemesters[0],
    subject: getJuniorSubjectList(juniorGrades[0])[0],

    singleSubject: singleSubjects[0],
    singleType: singleTypes[0],

    bannerList: banners,

    unitList: [],
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: `${config.APP_NAME} · 题库` })
    this.refreshUnits()
  },

  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    this.setData({ stage })
    this.refreshUnits()
  },

  selectGrade(e) {
    const grade = e.currentTarget.dataset.value
    const subjectList = getJuniorSubjectList(grade)
    const subject = subjectList.includes(this.data.subject) ? this.data.subject : subjectList[0]
    this.setData({ grade, subjectList, subject })
    this.refreshUnits()
  },

  selectSemester(e) {
    this.setData({ semester: e.currentTarget.dataset.value })
    this.refreshUnits()
  },

  selectSubject(e) {
    this.setData({ subject: e.currentTarget.dataset.value })
    this.refreshUnits()
  },

  selectSingleSubject(e) {
    this.setData({ singleSubject: e.currentTarget.dataset.value })
    this.refreshUnits()
  },

  selectSingleType(e) {
    this.setData({ singleType: e.currentTarget.dataset.value })
    this.refreshUnits()
  },

  refreshUnits() {
    if (this.data.stage === '初中') {
      const prefix = `${this.data.grade}${this.data.semester}-${this.data.subject}`
      this.setData({ unitList: makeUnits(prefix) })
      return
    }
    const prefix = `${this.data.singleSubject}-${this.data.singleType}`
    this.setData({ unitList: makeUnits(prefix) })
  },

  goUnitDetail(e) {
    const unitId = e.currentTarget.dataset.unitid
    const unitTitle = e.currentTarget.dataset.unittitle

    const encode = (v) => encodeURIComponent(v || '')
    const qs =
      `stage=${encode(this.data.stage)}` +
      `&grade=${encode(this.data.grade)}` +
      `&semester=${encode(this.data.semester)}` +
      `&subject=${encode(this.data.subject)}` +
      `&singleSubject=${encode(this.data.singleSubject)}` +
      `&singleType=${encode(this.data.singleType)}` +
      `&unitId=${encode(unitId)}` +
      `&unitTitle=${encode(unitTitle)}`

    wx.navigateTo({ url: `/pages/library/unit/index?${qs}` })
  },

  onBannerTap(e) {
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

