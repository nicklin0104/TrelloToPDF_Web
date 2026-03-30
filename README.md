# TrelloToPDF Web App 🇦🇷

[English](#english) | [繁體中文](#繁體中文)

---

<h2 id="english">English</h2>

A beautifully designed, premium web application that perfectly converts Trello JSON exports into well-formatted, print-friendly PDF HTML reports. 

### ✨ Features
* **100% Client-Side**: No backend servers required. Files are processed entirely in your local browser emphasizing privacy and security.
* **Argentina Aesthetics**: A premium UI inspired by the FIFA Argentina National Team (La Albiceleste) featuring sky blue, white, and sun gold accents.
* **Native Markdown Support**: Automatically parses Trello's Markdown (lists, formatting, quotes) into pristine HTML elements *before* you print.
* **Smart PDF Pagination**: Automatically generates a clickable Table of Contents (TOC), and ensures each Trello List starts on a brand-new page (using `page-break`).
* **One-Click Print Flow**: Generates the document in a new tab and automatically triggers your browser's print dialog.

### 🚀 Usage (GitHub Pages Ready)
1. Export your Trello board: `Board Menu` > `More` > `Print and Export` > `Export as JSON`.
2. Open the [TrelloToPDF Web App](#) (Replace `#` with your GitHub Pages URL after deployment).
3. Drag & Drop your JSON file into the upload zone.
4. Select the specific lists you want to export.
5. Click **Generate PDF**, and use your browser's "Save as PDF" function on the print pop-up.

### 🛠️ Development
Since this is a static web app consisting only of HTML, CSS, and JS, no build step (`npm`) is required. Simply git clone the repository and open `index.html` in any modern browser.
* `index.html` - Core App DOM Structure.
* `styles.css` - Premium styling, UI layout and responsive design.
* `app.js` - Core logic handling data extraction, marked.js compilation, and string rendering.

---

<h2 id="繁體中文">繁體中文</h2>

這是一款純前端、具備高級質感介面的網頁工具，能將 Trello 匯出的 JSON 檔案，無損且完美地轉換為適合列印與 PDF 保存的報告格式。

### ✨ 核心功能
* **純前端運作**：無需後端伺服器！檔案完全在你的瀏覽器本地解析，保證資料隱私與絕對安全。
* **阿根廷國家隊美學**：以 FIFA 阿根廷主場球衣配色 (天空藍、全白、五月太陽金) 為靈感，打造充滿 Premium 質感的流暢操作介面。
* **原生 Markdown 渲染**：自動將 Trello 本身的 Markdown 語法 (列表層級、粗斜體、引言) 預先編譯成完美的網頁排版。
* **智慧列印排版**：自動產出可點擊跳轉的「章節目錄 (TOC)」，並確保每一個 Trello 列表 (List) 在列印時都會從全新的一頁開始印。
* **自動觸發列印**：產生報告後自動開啟純淨背景分頁，並立即觸發瀏覽器的列印視窗，無縫「另存為 PDF」。

### 🚀 使用方式 (支援 GitHub Pages)
1. 在 Trello 開啟你的看板 -> 右側選單 -> 更多 -> 列印與匯出 -> **匯出為 JSON**。
2. 開啟 [TrelloToPDF Web App](#) (部署後請替換為你的 GitHub Pages 網址)。
3. 將剛剛下載的 JSON 檔案拖曳進網頁的標誌性上傳區。
4. 勾選你想要留下的列表。
5. 點擊 **產生並預覽 PDF**，並在自動彈出的列印視窗中使用現代瀏覽器的「另存為 PDF」。

### 🛠️ 開發說明
本專案為靜態網頁架構 (Static Web App)，無需任何 `npm` 或 Node.js 後端建置指令。只需下載專案全目錄，並點兩下用流覽器開啟 `index.html` 即可執行。
* `index.html` - 主網頁骨架。
* `styles.css` - 質感樣式與排版佈局。
* `app.js` - 處理資料萃取、分組以及 marked.js 的動態渲染核心邏輯。
