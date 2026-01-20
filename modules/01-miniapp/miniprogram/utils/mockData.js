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
  ],
};

function normalizeQuestions(rawList) {
  const list = Array.isArray(rawList) ? rawList : [];
  return list.map((q, idx) => {
    const item = { ...q, id: idx };

    if (!Array.isArray(item.choseList) || item.choseList.length < 1) {
      const optionKeys = ["optionA", "optionB", "optionC", "optionD", "optionE", "optionF", "optionG", "optionH", "optionI", "optionJ"];
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
