# 神秘互動問答網站 (Interactive Q&A & Story Application)

這是一個以**極簡黑底白字風格**打造的沉浸式互動問答網站，專為與朋友分享、收集真心地話與創造驚喜而設計。採用前後端分離架構，所有設定、關卡問題、影片音樂與使用者回答紀錄皆完整儲存於資料庫中。

---

## 🌟 核心特色與功能

1. **黑底白字放大風格 & 強制全螢幕體驗**：
   - 簡約大字視覺，專注於問答與敘事體驗。
   - 支援一鍵進入全螢幕模式，提供極致沉浸感。



3. **靈活流程與內容編輯器 (Flow & Content Editor)**：
   - **字幕與問題分離**：字幕可單獨設定顯示文字、持續時間、淡入與淡出時間。
   - **特效關卡 (Effects)**：內建多款獨立特效，可隨意插入流程中：
     - 絢麗煙火 (Fireworks)
     - 電視故障雜訊 (Glitch)
     - 駭客代碼雨 (Matrix Rain)
     - 畫面震撼抖動 (Screen Shake)
     - 閃光頻閃 (Flash)
   - **影片關卡 (Video)**：可在任意階段插入 MP4 影片播映。
   - **背景音樂 (BGM)**：支援 MP3 上傳與全域背景播放。
   - **順序調整**：自由上下移動問題與關卡，即時儲存生效。

---

## 📁 專案結構

```
interactive-qa-app/
├── backend/                  # Node.js + Express 後端 API
│   ├── database.js           # SQLite 資料庫初始化與資料表設計
│   ├── database.sqlite       # 資料庫檔案 (自動生成)
│   ├── middleware/
│   │   └── auth.js           # JWT 管理員驗證 Middleware
│   ├── routes/
│   │   ├── auth.js           # 登入與密碼修改 API
│   │   ├── flow.js           # 關卡流程與問題 CRUD API
│   │   ├── responses.js      # 使用者回答、停留時間與數據分析 API
│   │   └── upload.js         # MP3 / MP4 媒體檔案上傳 API
│   ├── uploads/              # 媒體檔案儲存目錄
│   └── server.js             # Express 伺服器主入口
│
├── frontend/                 # React + Vite + Tailwind CSS 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminAnalytics.jsx   # 數據與停留時間統計面板
│   │   │   ├── AdminFlowEditor.jsx  # 關卡與問題內容編輯器
│   │   │   ├── AdminModal.jsx       # 隱藏管理員彈窗
│   │   │   ├── AdminSettings.jsx    # 密碼修改與全域設定
│   │   │   ├── AudioPlayer.jsx      # 背景音樂播放控制器
│   │   │   ├── EffectsCanvas.jsx    # Canvas 特效 (煙火/Glitch/Matrix)
│   │   │   └── PlayerView.jsx       # 前端問答與沉浸體驗引擎
│   │   ├── App.jsx                  # 前端主入口與快捷鍵監聽
│   │   ├── index.css                # Tailwind 與自訂動畫樣式
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── DEPLOYMENT_GUIDE.md        # 詳細雲端部署與網址設定教學手冊
```

---

## 🚀 本地開發與運行步驟

### 1. 啟動後端 API 伺服器 (Port 5000)

```bash
cd backend
npm install
node server.js
```

### 2. 啟動前端開發伺服器 (Port 3000)

開啟另一個終端機視窗：

```bash
cd frontend
npm install
npm run dev
```

開啟瀏覽器造訪 `http://localhost:3000` 即可體驗！

---

## 🔑 管理員登入與操作說明

1. 在體驗網頁中按下快捷鍵 `Ctrl + Shift + A` (Mac 使用者為 `Cmd + Shift + A`)。
2. 輸入預設密碼 `admin` 即可解鎖管理員後台。
3. 可點選上方頁籤切換：
   - **回答與停留時間紀錄**：檢視所有受訪者停留秒數與每一題的答題細節，亦可點擊「一鍵清空所有紀錄」。
   - **流程與問題內容編輯器**：輕鬆新增、編輯、刪除字幕與問題，調整關卡順序。
   - **密碼與系統設定**：修改預設密碼、上傳背景音樂 MP3 或影片 MP4。

---

## 🌐 雲端公開部署教學 (無冷啟動休眠、使用平台免費預設網址)

本專案排除有冷啟動休眠等待問題的平台 (如 Render)，推薦採用 **Zeabur**、**Koyeb** 或 **Railway** 部署：
- ⚡ **零冷啟動**：伺服器 24 小時在線，朋友點開網址直接秒開。
- 🔗 **免買自訂網址**：直接使用平台提供的免費官方子網域（如 `*.zeabur.app` 或 `*.koyeb.app`）。

詳細操作步驟請參閱專案目錄下的 [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)。
