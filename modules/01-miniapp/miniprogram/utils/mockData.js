/**
 * 这里只放“跑通小程序”的最小数据集，后续可按客户真实目录层级扩充。
 *
 * 数据字段尽量沿用原项目的习惯：
 * - questionMenu: 分类/套题
 * - menuDetail: 每套题的参数（题量、时间、题目来源）
 * - questions: 题目列表（type: 1单选 2多选 3判断 4填空/简答等）
 */

const settings = {
  useLearn: "true",
  checkUser: "false",
};

const questionMenu = [
  {
    objectId: "menu_demo_1",
    name: "示例题库（单选）",
    questionNum: "10",
    time: "20",
    questionUrl: "",
  },
  {
    objectId: "menu_demo_2",
    name: "示例题库（多选）",
    questionNum: "10",
    time: "20",
    questionUrl: "",
  },
];

const questionsByMenuId = {
  menu_demo_1: [
    {
      objectId: "q_1",
      type: "1",
      title: "下列哪一项是微信小程序的页面文件后缀？",
      optionA: "wxml",
      optionB: "html",
      optionC: "vue",
      optionD: "jsx",
      answer: "A",
      analysis: "小程序页面结构使用 WXML。",
    },
    {
      objectId: "q_2",
      type: "1",
      title: "wx.request 默认支持的协议一般要求是？",
      optionA: "http",
      optionB: "https",
      optionC: "ftp",
      optionD: "file",
      answer: "B",
      analysis: "正式环境需要配置 https 域名白名单。",
    },
    {
      objectId: "q_3",
      type: "1",
      title: "小程序页面样式文件的后缀通常是？",
      optionA: "css",
      optionB: "wxss",
      optionC: "less",
      optionD: "sass",
      answer: "B",
      analysis: "小程序页面样式使用 WXSS。",
    },
    {
      objectId: "q_4",
      type: "1",
      title: "在小程序中做本地持久化存储常用的 API 是？",
      optionA: "wx.setStorageSync",
      optionB: "wx.saveFile",
      optionC: "wx.openDocument",
      optionD: "wx.previewImage",
      answer: "A",
      analysis: "本地 KV 存储常用 `wx.setStorageSync / wx.getStorageSync`。",
    },
    {
      objectId: "q_5",
      type: "1",
      title: "小程序页面配置文件的后缀通常是？",
      optionA: "yaml",
      optionB: "toml",
      optionC: "json",
      optionD: "ini",
      answer: "C",
      analysis: "页面级配置为 JSON（如 navigationBarTitleText）。",
    },
    {
      objectId: "q_6",
      type: "1",
      title: "WXML 中列表渲染常用指令是？",
      optionA: "v-for",
      optionB: "ng-repeat",
      optionC: "wx:for",
      optionD: "forEach",
      answer: "C",
      analysis: "WXML 使用 `wx:for` 做列表渲染。",
    },
    {
      objectId: "q_7",
      type: "1",
      title: "WXML 中条件渲染常用指令是？",
      optionA: "wx:if",
      optionB: "v-if",
      optionC: "if",
      optionD: "show",
      answer: "A",
      analysis: "WXML 使用 `wx:if / wx:else / wx:elif`。",
    },
    {
      objectId: "q_8",
      type: "1",
      title: "小程序页面跳转到非 tabBar 页面常用的 API 是？",
      optionA: "wx.switchTab",
      optionB: "wx.navigateTo",
      optionC: "wx.reLaunch",
      optionD: "wx.redirectTo",
      answer: "B",
      analysis: "一般进入非 tabBar 页使用 `wx.navigateTo`。",
    },
    {
      objectId: "q_9",
      type: "1",
      title: "小程序页面返回上一页常用的 API 是？",
      optionA: "wx.navigateBack",
      optionB: "wx.navigateTo",
      optionC: "wx.switchTab",
      optionD: "wx.previewImage",
      answer: "A",
      analysis: "`wx.navigateBack` 用于返回上一页。",
    },
    {
      objectId: "q_10",
      type: "1",
      title: "在小程序里展示提示信息（不阻塞）常用的 API 是？",
      optionA: "wx.showToast",
      optionB: "wx.showModal",
      optionC: "wx.showActionSheet",
      optionD: "wx.hideLoading",
      answer: "A",
      analysis: "`wx.showToast` 用于轻量提示。",
    },
  ],
  menu_demo_2: [
    {
      objectId: "q_m_1",
      type: "2",
      title: "以下哪些属于小程序的文件类型？",
      optionA: "wxml",
      optionB: "wxss",
      optionC: "js",
      optionD: "java",
      answer: "ABC",
      analysis: "小程序页面通常由 wxml/wxss/js/json 组成。",
    },
    {
      objectId: "q_m_2",
      type: "2",
      title: "以下哪些属于小程序常用的导航方式？",
      optionA: "wx.navigateTo",
      optionB: "wx.switchTab",
      optionC: "wx.navigateBack",
      optionD: "wx.request",
      answer: "ABC",
      analysis: "前三个是导航相关 API；wx.request 是网络请求。",
    },
    {
      objectId: "q_m_3",
      type: "2",
      title: "以下哪些用于本地存储？",
      optionA: "wx.setStorageSync",
      optionB: "wx.getStorageSync",
      optionC: "wx.removeStorageSync",
      optionD: "wx.showToast",
      answer: "ABC",
      analysis: "本地 KV 存储相关 API 为 set/get/remove。",
    },
    {
      objectId: "q_m_4",
      type: "2",
      title: "以下哪些是 WXML 的指令？",
      optionA: "wx:for",
      optionB: "wx:if",
      optionC: "wx:key",
      optionD: "v-for",
      answer: "ABC",
      analysis: "`v-for` 属于 Vue 模板语法，不是 WXML。",
    },
    {
      objectId: "q_m_5",
      type: "2",
      title: "以下哪些属于小程序常用的 UI 提示组件（API）？",
      optionA: "wx.showToast",
      optionB: "wx.showModal",
      optionC: "wx.showActionSheet",
      optionD: "wx.getStorageSync",
      answer: "ABC",
      analysis: "showToast/showModal/showActionSheet 常用于提示与交互。",
    },
  ],
};

function normalizeQuestions(rawList) {
  const list = Array.isArray(rawList) ? rawList : [];
  return list.map((q, idx) => {
    const item = { ...q, id: idx };

    if (!Array.isArray(item.choseList) || item.choseList.length < 1) {
      const optionKeys = [
        "optionA",
        "optionB",
        "optionC",
        "optionD",
        "optionE",
        "optionF",
        "optionG",
        "optionH",
        "optionI",
        "optionJ",
      ];
      const options = optionKeys
        .map((key) => item[key])
        .filter((val) => typeof val === "string" && val.trim().length > 0)
        .map((val) => ({ item: val }));
      if (options.length > 0) item.choseList = options;
    }

    if (typeof item.help !== "string" || item.help.trim().length < 1) {
      if (typeof item.analysis === "string" && item.analysis.trim().length > 0) {
        item.help = item.analysis;
      }
    }

    if (typeof item.picUrl !== "string") item.picUrl = "";
    if (typeof item.helpPicUrl !== "string") item.helpPicUrl = "";

    if (String(item.type) === "2" && typeof item.answer === "string") {
      item.answerArr = item.answer.split("");
    }
    return item;
  });
}

function getSetting(key) {
  return settings[String(key)] ?? "";
}

function getQuestionMenu() {
  return questionMenu;
}

function getMenuDetail(menuId) {
  const found = questionMenu.find((m) => m.objectId === menuId);
  return (
    found || {
      objectId: menuId,
      name: "",
      questionNum: "10",
      time: "20",
      questionUrl: "",
    }
  );
}

function getQuestionsForMenu(menuId) {
  return normalizeQuestions(questionsByMenuId[menuId] || []);
}

module.exports = {
  getSetting,
  getQuestionMenu,
  getMenuDetail,
  getQuestionsForMenu,
};
