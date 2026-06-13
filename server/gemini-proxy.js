const http = require("http");

const port = Number(process.env.PORT || 8787);
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        reject(new Error("请求内容过长。"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function handleIching(request, response) {
  if (!apiKey) {
    sendJson(response, 500, { error: "后台未设置 GEMINI_API_KEY 环境变量。" });
    return;
  }

  try {
    const body = JSON.parse(await readBody(request));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      sendJson(response, 400, { error: "缺少 prompt。" });
      return;
    }

    async function generateText(contents, maxOutputTokens) {
      const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.65,
            topP: 0.95,
            maxOutputTokens
          }
        })
      }
      );
      const data = await geminiResponse.json();

      if (!geminiResponse.ok) {
        const error = new Error(data.error?.message || "Gemini 请求失败。");
        error.statusCode = geminiResponse.status;
        throw error;
      }

      const candidate = data.candidates?.[0];
      return {
        text: candidate?.content?.parts?.map((part) => part.text || "").join("").trim() || "",
        finishReason: candidate?.finishReason || ""
      };
    }

    let contents = [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];
    const chunks = [];
    let finishReason = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await generateText(contents, attempt === 0 ? 4096 : 2048);
      if (result.text) {
        chunks.push(result.text);
      }
      finishReason = result.finishReason;

      if (finishReason !== "MAX_TOKENS" || !result.text) {
        break;
      }

      contents = [
        ...contents,
        {
          role: "model",
          parts: [{ text: result.text }]
        },
        {
          role: "user",
          parts: [
            {
              text: "请从上一段被截断处继续写，不要重复已经写过的内容，不要重新开头。只补完剩余分析和最终结论，控制在600字以内。"
            }
          ]
        }
      ];
    }

    sendJson(response, 200, {
      text: chunks.join("\n\n").trim(),
      finishReason
    });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error instanceof Error ? error.message : "后台解卦失败。"
    });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "POST" && request.url === "/api/iching") {
    handleIching(request, response);
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Gemini proxy listening on http://0.0.0.0:${port}`);
});
