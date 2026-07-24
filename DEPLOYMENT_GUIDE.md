# Cloudflare 部署指南

這個副本是為了把專案搬到 **Cloudflare Workers + D1 + 靜態資源**。

這樣的組合適合你的專案，因為：

1. 前端可以直接當靜態站台部署。
2. API 可以直接在 Worker 內處理。
3. SQLite 型資料改用 D1，資料不會放在本機磁碟。
4. 音樂與影片改成外部網址，或部署前放進 `frontend/public/uploads/`。

## 你需要準備

1. 一個 GitHub repo。
2. 一個 Cloudflare 帳號。
3. 一個 D1 資料庫。
4. 一個 `JWT_SECRET` secret。

## 部署步驟

### 1. 建立 D1 資料庫

先登入 Cloudflare，再建立 D1 database。

可用 CLI：

```bash
npx wrangler login
npx wrangler d1 create interactive-qa-app2
```

建立完成後，Cloudflare 會給你一個 `database_id`。

### 2. 準備媒體檔案（選用）

如果你要用本機音訊或影片，請把檔案放到：

```text
frontend/public/uploads/
```

部署後就可以直接用這種路徑：

```text
/uploads/檔名.mp3
/uploads/檔名.mp4
```

如果你都用外部網址，可以直接跳過這一步。

### 3. 設定 JWT Secret

這個專案用 `JWT_SECRET` 來簽管理員 token，也會用來加密備份檔。

```bash
npx wrangler secret put JWT_SECRET
```

### 4. 編輯 `wrangler.jsonc`

把以下欄位改成你的實際設定：

1. `d1_databases[0].database_id`
2. `vars.ADMIN_PASSWORD` 如果你想自訂初始密碼

### 5. 連接 GitHub 自動部署

到 Cloudflare Workers 頁面，選擇：

1. `Create application`
2. `Workers`
3. `Connect to Git`
4. 選你的 GitHub repo

Cloudflare 會在你每次 push 後自動部署。

如果你是把整個 `interactive-qa-app` 倉庫連上去，而 Cloudflare 真正要部署的是 `cloudflare-migration` 這個子資料夾，請到 `Settings > Build` 把 `Root directory` 改成 `cloudflare-migration`。Workers Builds 會在那個資料夾裡尋找 `wrangler.jsonc`，並在那裡執行 build / deploy。

### 6. Build 設定

這個副本的 build 目標是先把前端打包，再交給 Workers 提供靜態檔。

注意：Cloudflare Workers Builds 會依照這個專案的 `package.json` 安裝 `wrangler`。這個副本已經把 `wrangler` 提升到 `^3.91.0`，因為 `wrangler.jsonc` 需要這個版本以上才正式支援。
如果你在 Cloudflare 後台把 Deploy command 設成 `npm run deploy`，現在這個腳本會自動改用 `npx wrangler deploy --yes`，比較不會卡在本機安裝版。

建議 build command：

```bash
cd frontend && npm ci && npm run build
```

Root 的 `package.json` 已經預設好：

```bash
npm run build
```

### 7. 部署

部署後，Cloudflare 會提供：

1. `*.workers.dev` 預設網址
2. 你自己的自訂網域

對外分享時，直接使用這個網址即可。

## 本機開發

在這個副本裡，建議從根目錄啟動：

```bash
npm install
npm run dev
```

`wrangler dev` 會啟動 Worker 與 D1 的本機模擬環境。

## 舊資料搬移

如果你原本有 Railway 版本的備份：

1. 先在舊版本匯出 ZIP 備份。
2. 到這個 Cloudflare 版本的管理後台使用「還原備份 (ZIP)」。

這個副本保留了 `backup.json.enc` 的相容性，但 ZIP 內只會還原 steps / settings / 管理員密碼，不會自動還原媒體檔案。

如果你要匯入舊站輸出的 ZIP，請盡量把 Cloudflare 這邊的 `JWT_SECRET` 設成和舊站相同，這樣加密備份才能順利解開。若你原本把 MP3 / MP4 放在舊站的上傳區，請另外把那些檔案複製到 `frontend/public/uploads/` 再重新部署。
