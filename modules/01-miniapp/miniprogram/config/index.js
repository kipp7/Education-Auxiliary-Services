module.exports = {
  /**
   * 先用 Mock 跑通小程序闭环；等后端接口确定后改为 false。
   */
  USE_MOCK: true,

  /**
   * 后端 API 基地址（后续联调时填写）。
   * 示例：https://api.example.com
   */
  API_BASE_URL: "",

  /**
   * wx.request 超时
   */
  REQUEST_TIMEOUT_MS: 15000,
};

