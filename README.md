# 易经占卜

这是一个 iPhone-ready 的 Expo 应用，基于传统《易经》64卦与三枚铜钱法起卦。应用会自下而上生成六爻，标记变爻，并显示本卦与之卦的中文解读。

起完六爻后，可以进入“Gemini 解卦页”。应用会把用户问题、本卦、之卦、变爻和铜钱记录发送到你自己的后台，由后台连接 Gemini 并返回实时中文解读。Gemini API Key 不会保存在 App 内。

Gemini 返回后会自动进入“完整解卦结果”页面，长篇内容会在独立页面中滚动显示。

体育赛事类问题会使用额外的解卦框架：先按方位、主客场或颜色绑定五行，再分析本卦当前局势、变爻转折和之卦终局，最后给出明确倾向。此功能只作传统文化娱乐推演，不提供下注建议。

Gemini 后台参数当前设置为 `temperature: 0.65`、`maxOutputTokens: 2400`，用于让回答保持生动但不跑题，并降低回答被截断的概率。

如果 Gemini 返回 `MAX_TOKENS`，后台会自动继续请求最多 2 次，把续写内容拼接后再返回给 App。

## 在 iPhone 上运行

1. 安装依赖：

   ```bash
   npm install
   ```

2. 启动 Expo：

   ```bash
   npm start
   ```

3. 在 iPhone 上用 Expo Go 扫描二维码。

## 启动 Gemini 后台

后台通过环境变量读取 Gemini API Key。

PowerShell:

```powershell
$env:GEMINI_API_KEY="你的 Gemini API Key"
npm run server
```

修改后台文件后，请停止并重新运行 `npm run server`，否则新的输出长度设置不会生效。

macOS/Linux:

```bash
GEMINI_API_KEY="你的 Gemini API Key" npm run server
```

默认后台地址是：

```text
http://localhost:8787/api/iching
```

如果用 iPhone 真机测试，`localhost` 会指向手机本身。请把 [App.tsx](</C:/Users/hangc/OneDrive/Documents/New project/iching-fortune-app/App.tsx>) 里的 `geminiBackendUrl` 改成电脑的局域网 IP，例如：

```ts
const geminiBackendUrl = "http://192.168.1.25:8787/api/iching";
```

## 构建 iOS 应用

使用 Expo Application Services：

```bash
npm install -g eas-cli
eas build -p ios
```
