const http = require("node:http");
const { URL } = require("node:url");

const orders = new Map();

function newRequestId() {
  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function json(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "X-Request-Id");
  res.end(body);
}

function error(res, statusCode, code, message, requestId) {
  json(res, statusCode, { code, message, requestId: requestId ?? null });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return null;
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("Invalid JSON");
    err.name = "InvalidJson";
    throw err;
  }
}

function requireAuth(req, res) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    error(res, 401, "UNAUTHORIZED", "Missing or invalid Authorization header", res.getHeader("X-Request-Id"));
    return false;
  }
  return true;
}

function newOrderId() {
  return `ord-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

const server = http.createServer(async (req, res) => {
  const requestId = newRequestId();
  res.setHeader("X-Request-Id", requestId);
  try {
    if (!req.url) return error(res, 400, "INVALID_ARGUMENT", "Missing URL", requestId);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Expose-Headers", "X-Request-Id");
      return res.end();
    }

    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;

    if (req.method === "GET" && path === "/health") {
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && path === "/auth/wechat") {
      const body = (await readJson(req)) || {};
      if (typeof body.code !== "string" || body.code.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing code", requestId);
      }
      return json(res, 200, {
        token: "demo-token",
        expiresIn: 7200,
        userId: "demo-user",
        isNewUser: false
      });
    }

    // Payment providers typically call back without Authorization.
    if (req.method === "POST" && path === "/billing/payment/callback") {
      const body = (await readJson(req)) || {};
      if (typeof body.orderId !== "string" || body.orderId.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing orderId", requestId);
      }
      const status = typeof body.status === "string" ? body.status : "PAID";
      const order = orders.get(body.orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        orders.set(body.orderId, order);
      }
      return json(res, 200, { ok: true });
    }

    if (!requireAuth(req, res)) return;

    if (req.method === "GET" && path === "/subjects") {
      return json(res, 200, [{ id: "sub-1", name: "科目A" }]);
    }

    if (req.method === "GET" && path === "/packages") {
      const subjectId = url.searchParams.get("subjectId");
      if (!subjectId) return error(res, 400, "INVALID_ARGUMENT", "Missing subjectId", requestId);
      return json(res, 200, [{ id: "pkg-1", subjectId, name: "题库包A" }]);
    }

    if (req.method === "GET" && path === "/chapters") {
      const packageId = url.searchParams.get("packageId");
      if (!packageId) return error(res, 400, "INVALID_ARGUMENT", "Missing packageId", requestId);
      return json(res, 200, [{ id: "ch-1", packageId, name: "章节A" }]);
    }

    if (req.method === "GET" && path === "/questions") {
      const chapterId = url.searchParams.get("chapterId");
      if (!chapterId) return error(res, 400, "INVALID_ARGUMENT", "Missing chapterId", requestId);
      return json(res, 200, [
        { id: "q-1", chapterId, stem: "示例题目 1", analysis: "示例解析" }
      ]);
    }

    if (req.method === "POST" && path === "/answers/submit") {
      const body = (await readJson(req)) || {};
      if (typeof body.chapterId !== "string" || body.chapterId.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing chapterId", requestId);
      }
      if (!Array.isArray(body.answers)) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing answers", requestId);
      }
      return json(res, 200, { submitted: body.answers.length });
    }

    if (req.method === "GET" && path === "/progress") {
      const packageId = url.searchParams.get("packageId");
      if (!packageId) return error(res, 400, "INVALID_ARGUMENT", "Missing packageId", requestId);
      return json(res, 200, {
        packageId,
        answeredCount: 1,
        correctCount: 1,
        totalCount: 10,
        updatedAt: new Date().toISOString()
      });
    }

    if (req.method === "GET" && path === "/wrongs") {
      return json(res, 200, [
        {
          questionId: "q-1",
          chapterId: "ch-1",
          wrongAt: new Date().toISOString()
        }
      ]);
    }

    if (path === "/favorites") {
      if (req.method === "POST") {
        const body = (await readJson(req)) || {};
        if (typeof body.questionId !== "string" || body.questionId.length === 0) {
          return error(res, 400, "INVALID_ARGUMENT", "Missing questionId", requestId);
        }
        return json(res, 200, { favorited: true, questionId: body.questionId });
      }
      if (req.method === "DELETE") {
        const questionId = url.searchParams.get("questionId");
        if (!questionId) return error(res, 400, "INVALID_ARGUMENT", "Missing questionId", requestId);
        return json(res, 200, { unfavorited: true, questionId });
      }
    }

    if (req.method === "GET" && path === "/videos") {
      const packageId = url.searchParams.get("packageId");
      if (!packageId) return error(res, 400, "INVALID_ARGUMENT", "Missing packageId", requestId);
      return json(res, 200, [{ id: "v-1", title: "示例视频 1", url: null }]);
    }

    if (path === "/videos/progress") {
      if (req.method === "GET") {
        const videoId = url.searchParams.get("videoId");
        if (!videoId) return error(res, 400, "INVALID_ARGUMENT", "Missing videoId", requestId);
        return json(res, 200, { videoId, progress: 0.25 });
      }
      if (req.method === "POST") {
        const body = (await readJson(req)) || {};
        if (typeof body.videoId !== "string" || body.videoId.length === 0) {
          return error(res, 400, "INVALID_ARGUMENT", "Missing videoId", requestId);
        }
        const progress = Number(body.progress);
        if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
          return error(res, 400, "INVALID_ARGUMENT", "Invalid progress", requestId);
        }
        return json(res, 200, { videoId: body.videoId, progress });
      }
    }

    if (req.method === "POST" && path === "/svip/bind") {
      const body = (await readJson(req)) || {};
      if (typeof body.code !== "string" || body.code.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing code", requestId);
      }
      return json(res, 200, { bound: true });
    }

    if (req.method === "POST" && path === "/activation/redeem") {
      const body = (await readJson(req)) || {};
      if (typeof body.code !== "string" || body.code.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing code", requestId);
      }
      return json(res, 200, { redeemed: true });
    }

    if (req.method === "GET" && path === "/me/entitlements") {
      return json(res, 200, {
        active: true,
        subjects: ["sub-1"],
        packages: ["pkg-1"]
      });
    }

    if (req.method === "GET" && path === "/me/learning-records") {
      return json(res, 200, [
        { id: "lr-1", chapterId: "ch-1", updatedAt: new Date().toISOString() }
      ]);
    }

    if (req.method === "GET" && path === "/content/banners") {
      return json(res, 200, [
        { id: "b-1", title: "运营 Banner", imageUrl: null, link: null }
      ]);
    }

    if (req.method === "GET" && path === "/content/news") {
      return json(res, 200, [
        { id: "n-1", title: "资讯标题", summary: "资讯摘要", publishedAt: new Date().toISOString() }
      ]);
    }

    if (req.method === "GET" && path.startsWith("/content/news/")) {
      const id = path.split("/").pop();
      return json(res, 200, {
        id: id || "n-1",
        title: "资讯标题",
        content: "资讯正文（mock）",
        publishedAt: new Date().toISOString()
      });
    }

    if (req.method === "GET" && path === "/content/recommendations") {
      return json(res, 200, [
        { id: "r-1", title: "推荐内容", type: "package", refId: "pkg-1" }
      ]);
    }

    if (req.method === "GET" && path === "/billing/plans") {
      return json(res, 200, [
        { id: "plan-1", name: "月卡", priceCents: 1999, currency: "CNY" }
      ]);
    }

    if (req.method === "POST" && path === "/billing/order") {
      const body = (await readJson(req)) || {};
      if (typeof body.planId !== "string" || body.planId.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing planId", requestId);
      }
      const orderId = newOrderId();
      const now = new Date().toISOString();
      orders.set(orderId, {
        orderId,
        planId: body.planId,
        status: "CREATED",
        createdAt: now,
        updatedAt: now
      });
      return json(res, 200, {
        orderId,
        planId: body.planId,
        status: "CREATED",
        payUrl: null
      });
    }

    if (req.method === "GET" && path.startsWith("/billing/order/")) {
      const orderId = path.split("/").pop();
      if (!orderId) return error(res, 400, "INVALID_ARGUMENT", "Missing orderId", requestId);
      const order = orders.get(orderId);
      if (!order) return error(res, 404, "NOT_FOUND", "Order not found", requestId);
      return json(res, 200, order);
    }

    return error(res, 404, "NOT_FOUND", "Not found", requestId);
  } catch (e) {
    if (e && typeof e === "object" && e.name === "InvalidJson") {
      return error(res, 400, "INVALID_ARGUMENT", "Invalid JSON", requestId);
    }
    return error(res, 500, "INTERNAL", e instanceof Error ? e.message : "Internal error", requestId);
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[02-backend-core] listening on http://localhost:${port}`);
});
