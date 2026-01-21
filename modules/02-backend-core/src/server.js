const http = require("node:http");
const { URL } = require("node:url");

function json(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.end(body);
}

function error(res, statusCode, code, message) {
  json(res, statusCode, { code, message, requestId: null });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return null;
  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text);
}

function requireAuth(req, res) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    error(res, 401, "UNAUTHORIZED", "Missing or invalid Authorization header");
    return false;
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) return error(res, 400, "INVALID_ARGUMENT", "Missing URL");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
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
        return error(res, 400, "INVALID_ARGUMENT", "Missing code");
      }
      return json(res, 200, {
        token: "demo-token",
        expiresIn: 7200,
        userId: "demo-user",
        isNewUser: false
      });
    }

    if (!requireAuth(req, res)) return;

    if (req.method === "GET" && path === "/subjects") {
      return json(res, 200, [{ id: "sub-1", name: "科目A" }]);
    }

    if (req.method === "GET" && path === "/packages") {
      const subjectId = url.searchParams.get("subjectId");
      if (!subjectId) return error(res, 400, "INVALID_ARGUMENT", "Missing subjectId");
      return json(res, 200, [{ id: "pkg-1", subjectId, name: "题库包A" }]);
    }

    if (req.method === "GET" && path === "/chapters") {
      const packageId = url.searchParams.get("packageId");
      if (!packageId) return error(res, 400, "INVALID_ARGUMENT", "Missing packageId");
      return json(res, 200, [{ id: "ch-1", packageId, name: "章节A" }]);
    }

    if (req.method === "GET" && path === "/questions") {
      const chapterId = url.searchParams.get("chapterId");
      if (!chapterId) return error(res, 400, "INVALID_ARGUMENT", "Missing chapterId");
      return json(res, 200, [
        { id: "q-1", chapterId, stem: "示例题目 1", analysis: "示例解析" }
      ]);
    }

    if (req.method === "POST" && path === "/answers/submit") {
      const body = (await readJson(req)) || {};
      if (typeof body.chapterId !== "string" || body.chapterId.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing chapterId");
      }
      if (!Array.isArray(body.answers)) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing answers");
      }
      return json(res, 200, { submitted: body.answers.length });
    }

    if (req.method === "GET" && path === "/videos") {
      const packageId = url.searchParams.get("packageId");
      if (!packageId) return error(res, 400, "INVALID_ARGUMENT", "Missing packageId");
      return json(res, 200, [{ id: "v-1", title: "示例视频 1", url: null }]);
    }

    if (path === "/videos/progress") {
      if (req.method === "GET") {
        const videoId = url.searchParams.get("videoId");
        if (!videoId) return error(res, 400, "INVALID_ARGUMENT", "Missing videoId");
        return json(res, 200, { videoId, progress: 0.25 });
      }
      if (req.method === "POST") {
        const body = (await readJson(req)) || {};
        if (typeof body.videoId !== "string" || body.videoId.length === 0) {
          return error(res, 400, "INVALID_ARGUMENT", "Missing videoId");
        }
        const progress = Number(body.progress);
        if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
          return error(res, 400, "INVALID_ARGUMENT", "Invalid progress");
        }
        return json(res, 200, { videoId: body.videoId, progress });
      }
    }

    if (req.method === "POST" && path === "/svip/bind") {
      const body = (await readJson(req)) || {};
      if (typeof body.code !== "string" || body.code.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing code");
      }
      return json(res, 200, { bound: true });
    }

    if (req.method === "POST" && path === "/activation/redeem") {
      const body = (await readJson(req)) || {};
      if (typeof body.code !== "string" || body.code.length === 0) {
        return error(res, 400, "INVALID_ARGUMENT", "Missing code");
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

    return error(res, 404, "NOT_FOUND", "Not found");
  } catch (e) {
    return error(res, 500, "INTERNAL", e instanceof Error ? e.message : "Internal error");
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[02-backend-core] listening on http://localhost:${port}`);
});
