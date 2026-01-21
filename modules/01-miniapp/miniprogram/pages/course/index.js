Page({
  data: {
    stage: '初中',
    stageList: ['初中', '单招'],
    svipBound: false,

    gradeList: ['初一', '初二', '初三'],
    semesterList: ['上册', '下册'],
    subjectList: ['语文', '数学', '英语'],

    singleSubjectList: ['信息技术', '通用技术', '音乐鉴赏', '美术鉴赏', '劳动技术'],
    singleTypeList: ['选择', '判断', '论述'],

    grade: '初一',
    semester: '上册',
    subject: '语文',

    singleSubject: '信息技术',
    singleType: '选择',

    courseList: [],
  },

  onLoad() {},

  onShow() {
    const svipBound = !!wx.getStorageSync('svip_bound')
    this.setData({ svipBound })
    this.refreshCourseList()
  },

  getProgressKey(id) {
    return `course_progress_${id}`
  },

  getJuniorSubjectList(grade) {
    const g = String(grade || '')
    if (g === '初一') return ['语文', '数学', '英语']
    if (g === '初二') return ['语文', '数学', '英语', '物理']
    return ['语文', '数学', '英语', '物理', '化学']
  },

  switchStage(e) {
    const stage = e.currentTarget.dataset.stage
    if (!stage) return
    if (stage === '初中') {
      const grade = this.data.gradeList[0]
      const subjectList = this.getJuniorSubjectList(grade)
      this.setData({
        stage,
        grade,
        semester: this.data.semesterList[0],
        subjectList,
        subject: subjectList[0],
      })
    } else {
      this.setData({
        stage,
        singleSubject: this.data.singleSubjectList[0],
        singleType: this.data.singleTypeList[0],
      })
    }
    this.refreshCourseList()
  },

  selectGrade(e) {
    const grade = e.currentTarget.dataset.value
    const subjectList = this.getJuniorSubjectList(grade)
    const subject = subjectList.includes(this.data.subject) ? this.data.subject : subjectList[0]
    this.setData({ grade, subjectList, subject })
    this.refreshCourseList()
  },

  selectSemester(e) {
    this.setData({ semester: e.currentTarget.dataset.value })
    this.refreshCourseList()
  },

  selectSubject(e) {
    this.setData({ subject: e.currentTarget.dataset.value })
    this.refreshCourseList()
  },

  selectSingleSubject(e) {
    this.setData({ singleSubject: e.currentTarget.dataset.value })
    this.refreshCourseList()
  },

  selectSingleType(e) {
    this.setData({ singleType: e.currentTarget.dataset.value })
    this.refreshCourseList()
  },

  refreshCourseList() {
    let prefix = ''
    if (this.data.stage === '初中') {
      prefix = `${this.data.grade}${this.data.semester}-${this.data.subject}`
    } else {
      prefix = `${this.data.singleSubject}-${this.data.singleType}`
    }

    const baseList = [
      {
        id: `c_${prefix}_1`,
        title: `${prefix} · 知识点精讲`,
        desc: '封面/标题/简介/时长/进度（Mock）',
        durationText: '12:30',
        cover: '/images/BG.png',
      },
      {
        id: `c_${prefix}_2`,
        title: `${prefix} · 典题解析`,
        desc: '用于演示筛选联动与续播记录（本地）',
        durationText: '08:10',
        cover: '/images/BG.png',
      },
    ]

    const courseList = baseList.map((item) => {
      const seconds = Number(wx.getStorageSync(this.getProgressKey(item.id)) || 0)
      const progressSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
      return {
        ...item,
        progressSeconds,
        progressText: progressSeconds ? `${Math.floor(progressSeconds)}s` : '',
      }
    })

    this.setData({ courseList })
  },

  goPlay(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.setStorageSync('last_course_id', id)
    if (!this.data.svipBound) {
      wx.showModal({
        title: 'SVIP 未开通',
        content: '当前仅支持浏览封面与简介；绑定 SVIP 后可观看（Mock）。',
        confirmText: '去绑定',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) return
          wx.navigateTo({ url: '/pages/svip/bind/index' })
        },
      })
      return
    }
    wx.navigateTo({ url: `/pages/course/player?id=${encodeURIComponent(id || '')}` })
  },
})

