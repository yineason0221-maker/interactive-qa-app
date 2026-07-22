# 🌐 神秘互動問答網站 - 無冷啟動雲端部署教學 (免自訂網址)

本手冊專為**追求秒開（無冷啟動休眠問題）**且**直接使用平台免費預設網址**的使用者設計。

---

## � 為什麼不使用 Render？
Render 的免費方案在無人造訪 15 分鐘後會自動進入休眠 (Spin Down)，當朋友點開網址時需要等待 30~50 秒冷啟動。

為確保朋友點開網址時能**毫無延遲、秒開體驗**，我們推薦採用**完全不休眠**的部署平台。

---

## 🚀 推薦首選 1：Zeabur (極速秒開、亞洲節點、預設免費子網域)

[Zeabur](https://zeabur.com) 是一個非常適合 Node.js 專案的雲端平台，提供免費額度且**伺服器完全不休眠**，點開網址秒開啟！

### 部署步驟：

1. **將專案推送到 GitHub**：
   在 GitHub 上建立一個新的儲存庫 (Repository)，例如 `my-interactive-qa`，將專案推上 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-interactive-qa.git
   git push -u origin main
   ```

2. **登入 Zeabur 並匯入 GitHub**：
   * 前往 [Zeabur 官網](https://zeabur.com)，使用 GitHub 帳號一鍵登入。
   * 點擊 **"Create Project" (建立專案)**，選擇距離最近的區域（例如 `Tokyo` 或 `Singapore`）。
   * 點擊 **"Deploy Service"**，選擇 **"Git Provider"** 並選取你的 `my-interactive-qa` 儲存庫。

3. **設定構建與啟動指令**：
   Zeabur 會自動偵測 Node.js 專案，在服務的 **Settings (設定)** 頁面確認：
   * **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   * **Start Command**:
     ```bash
     cd backend && node server.js
     ```

4. **一鍵生成免費網址 (無須自訂網址)**：
   * 在服務頁面切換至 **"Domain" (網域)** 頁籤。
   * 點擊 **"Generate Domain" (生成網域)**，選擇 **`*.zeabur.app`**。
   * 例如系統會為你生成 `https://my-qa-story.zeabur.app`。
   * 部署完成後，朋友點開此網址即可**秒開體驗，完全無休眠等待**！

---

## 🚀 推薦首選 2：Koyeb (免費、24h 不休眠、秒開)

[Koyeb](https://www.koyeb.com) 提供免費微型 Instance，同樣**完全不會進入休眠**。

### 部署步驟：
1. 登入 [Koyeb.com](https://www.koyeb.com)，選擇 **"Create App"**。
2. 選擇 **"GitHub"**，選取你的專案儲存庫 `my-interactive-qa`。
3. 設定：
   * **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   * **Run Command**: `cd backend && node server.js`
   * **Port**: `5000`
4. 部署完成後，Koyeb 會自動提供一個 `https://<app-name>.koyeb.app` 預設網址，複製網址即可傳給朋友！

---

## � 推薦首选 3：Railway (不休眠、穩定性極高)

[Railway.app](https://railway.app) 提供不休眠容器服務：
1. 登入 Railway，點擊 **"New Project"** -> **"Deploy from GitHub repo"**。
2. 設定：
   * **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   * **Start Command**: `cd backend && node server.js`
3. 在 **Networking** 中點擊 **"Generate Domain"**，即可獲得 `https://<app-name>.up.railway.app` 免費秒開網址。

---

## � 總結說明

* **無需花錢買網址**：上述平台 (Zeabur / Koyeb / Railway) 皆會免費提供官方子網域（如 `.zeabur.app` / `.koyeb.app` / `.up.railway.app`），直接複製分享給朋友即可。
* **零冷啟動**：伺服器 24 小時在線，朋友隨時點開都是極速載入！
