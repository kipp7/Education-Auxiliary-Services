const config = require("../config/index");

function joinUrl(baseUrl, path) {
  const cleanBase = String(baseUrl || "").replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  if (!cleanBase) return `/${cleanPath}`;
  return `${cleanBase}/${cleanPath}`;
}

function request({ path, url, method = "GET", data, header }) {
  const finalUrl = url || joinUrl(config.API_BASE_URL, path);
  return new Promise((resolve, reject) => {
    wx.request({
      url: finalUrl,
      method,
      data,
      header,
      timeout: config.REQUEST_TIMEOUT_MS,
      success: (res) => {
        const { statusCode, data: body } = res || {};
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body);
          return;
        }
        reject(
          new Error(
            `HTTP ${statusCode || "UNKNOWN"}: ${typeof body === "string" ? body : JSON.stringify(body)}`
          )
        );
      },
      fail: (err) => reject(err),
    });
  });
}

module.exports = {
  request,
};

