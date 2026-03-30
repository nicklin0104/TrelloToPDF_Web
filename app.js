document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. Configure marked.js (matches Python behavior) ----
    marked.setOptions({
        breaks: true, // translate newlines to <br> to match Trello behavior
        gfm: true
    });

    // ---- 2. DOM Elements ----
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const sectionUpload = document.getElementById('upload-section');
    const sectionSelection = document.getElementById('selection-section');
    const boardNameDisplay = document.getElementById('board-name-display');
    const listsContainer = document.getElementById('lists-container');
    const btnSelectAll = document.getElementById('btn-select-all');
    const btnDeselectAll = document.getElementById('btn-deselect-all');
    const btnGenerate = document.getElementById('btn-generate');
    const btnReset = document.getElementById('btn-reset');

    // ---- 3. State Variables ----
    let parsedData = null;
    let extractedLists = {};
    let extractedLabels = {};
    let boardName = '';

    // ---- 4. Drag & Drop Upload Logic ----
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // ---- 5. File Processing ----
    function handleFile(file) {
        if (!file.name.endsWith('.json')) {
            alert('錯誤: 請上傳副檔名為 .json 的 Trello 匯出檔！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                parsedData = JSON.parse(e.target.result);
                processParsedData();
            } catch (error) {
                alert('解析 JSON 失敗，檔案可能已損壞！\n錯誤: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // ---- 6. Parsing logic & UI Rendering ----
    function processParsedData() {
        if (!parsedData || !parsedData.lists) {
            alert('這不是標準的 Trello 匯出檔，找不到可用的列表資料。');
            return;
        }

        boardName = parsedData.name || 'Trello 看板';
        boardNameDisplay.textContent = '看板名稱：' + boardName;

        // Parse Lists (exclude closed)
        extractedLists = {};
        parsedData.lists.forEach(lst => {
            if (!lst.closed) {
                extractedLists[lst.id] = lst.name;
            }
        });

        if (Object.keys(extractedLists).length === 0) {
            alert('該 JSON 檔案中沒有找到任何可用的列表。');
            return;
        }

        // Parse Labels
        extractedLabels = {};
        if (parsedData.labels) {
            parsedData.labels.forEach(label => {
                if (label.name) {
                    extractedLabels[label.id] = label.name;
                }
            });
        }

        renderListsUI();
        
        // Show next screen
        sectionUpload.classList.remove('active');
        sectionSelection.classList.add('active');
    }

    function renderListsUI() {
        listsContainer.innerHTML = '';
        Object.keys(extractedLists).forEach(id => {
            const name = extractedLists[id];
            
            // Create clickable row container for better UX
            const labelEl = document.createElement('label');
            labelEl.className = 'list-item';
            
            labelEl.innerHTML = `
                <input type="checkbox" value="${id}" checked>
                <span>${escapeHtml(name)}</span>
            `;
            listsContainer.appendChild(labelEl);
        });
    }

    // ---- 7. Navigation Buttons ----
    btnSelectAll.addEventListener('click', () => {
        listsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });

    btnDeselectAll.addEventListener('click', () => {
        listsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    btnReset.addEventListener('click', () => {
        parsedData = null;
        fileInput.value = '';
        sectionSelection.classList.remove('active');
        sectionUpload.classList.add('active');
    });

    btnGenerate.addEventListener('click', () => {
        const checkboxes = listsContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedListIds = Array.from(checkboxes).map(cb => cb.value);

        if (selectedListIds.length === 0) {
            alert('請至少選擇一個列表再進行匯出！');
            return;
        }

        generatePrintableHTMLAndOpen(selectedListIds);
    });

    // ---- 8. Utilities ----
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function formatTime(isoString) {
        const dt = new Date(isoString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    }

    // ---- 9. Print HTML Generation (The Core Architecture Transformation) ----
    function generatePrintableHTMLAndOpen(selectedListIds) {
        const selectedListsDict = {};
        selectedListIds.forEach(id => { selectedListsDict[id] = extractedLists[id]; });

        // Map Cards
        const cards = {};
        if (parsedData.cards) {
            parsedData.cards.forEach(card => {
                if (card.closed) return;
                const listId = card.idList;
                if (!selectedListsDict[listId]) return;

                let cardLabels = [];
                if (card.idLabels) {
                    cardLabels = card.idLabels.map(l_id => extractedLabels[l_id]).filter(Boolean);
                }
                const labelsText = cardLabels.length > 0 ? cardLabels.join('、') : '無';

                cards[card.id] = {
                    name: card.name,
                    desc: card.desc || '無簡介',
                    labels: labelsText,
                    list_id: listId,
                    comments: []
                };
            });
        }

        // Map Comments
        if (parsedData.actions) {
            parsedData.actions.forEach(action => {
                if (action.type === 'commentCard' || action.type === 'copyCommentCard') {
                    const cardId = action.data.card.id;
                    if (cards[cardId]) {
                        cards[cardId].comments.push({
                            text: action.data.text || '',
                            dateStr: action.date,
                            dateFmt: formatTime(action.date)
                        });
                    }
                }
            });
        }

        // Build HTML Result Structure
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(boardName)}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, 'Microsoft JhengHei', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #34495e; padding-bottom: 10px; }
                h2 { color: #2980b9; margin-top: 30px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
                h3 { color: #e67e22; margin-bottom: 5px; }
                .card { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; word-break: break-word; overflow-wrap: break-word; }
                .meta { font-size: 0.9em; color: #7f8c8d; margin-bottom: 10px; }
                .desc { margin-bottom: 15px; color: #333; }
                .comments { background: #fff; padding: 10px 20px; border-left: 4px solid #3498db; }
                .comment { margin-bottom: 15px; }
                .time { font-weight: bold; color: #34495e; font-size: 0.85em; background: #ecf0f1; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px; }
                .comment-text { padding-left: 2px; color: #2c3e50; }
                
                /* Markdown Rendering Aesthetics */
                .markdown { word-break: break-word; overflow-wrap: break-word; font-size: 0.95em; }
                .markdown p { margin-top: 0; margin-bottom: 10px; }
                .markdown ul, .markdown ol { margin-top: 0; margin-bottom: 10px; padding-left: 20px; }
                .markdown ol { list-style-type: decimal; }
                .markdown ol ol { list-style-type: lower-alpha; }
                .markdown ol ol ol { list-style-type: lower-roman; }
                .markdown code { background: #eee; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                .markdown pre { background: #eee; padding: 10px; border-radius: 5px; overflow-x: auto; font-family: monospace; white-space: pre-wrap; }
                .markdown blockquote { border-left: 4px solid #ccc; margin: 0 0 10px 0; padding-left: 10px; color: #666; }
                a { color: #3498db; text-decoration: none; }
                
                /* TOC and Print Constraints */
                .toc { background: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                .toc h2 { margin-top: 0; border-bottom: none; color: #2c3e50; }
                .toc ul { list-style-type: none; padding-left: 0; }
                .toc li { margin-bottom: 8px; font-size: 1.1em; }
                .toc a { color: #2980b9; font-weight: bold; text-decoration: none; display: block; padding: 8px; border-radius: 4px; transition: background 0.2s; }
                .toc a:hover { background: #bdc3c7; }
                
                @media print {
                    body { background: #fff; }
                    .card { box-shadow: none; border: 1px solid #ccc; }
                    .toc { page-break-after: always; }
                    h2.list-title { page-break-before: always; margin-top: 0; }
                }
            </style>
        </head>
        <body>
            <h1>🗂️ 看板名稱：${escapeHtml(boardName)}</h1>
        `;

        // Bucket cards into their respective lists
        const cardsByList = {};
        selectedListIds.forEach(id => cardsByList[id] = []);
        Object.values(cards).forEach(card => {
            if (cardsByList[card.list_id]) {
                cardsByList[card.list_id].push(card);
            }
        });

        // 1. Render Index / TOC
        htmlContent += '<div class="toc"><h2>📑 目錄</h2><ul>\n';
        selectedListIds.forEach(listId => {
            if (cardsByList[listId].length > 0) {
                htmlContent += `<li><a href="#${listId}">📋 ${escapeHtml(selectedListsDict[listId])}</a></li>\n`;
            }
        });
        htmlContent += '</ul></div>\n';

        // 2. Render Checkboxed Lists
        selectedListIds.forEach(listId => {
            const listCards = cardsByList[listId];
            if (listCards.length === 0) return;

            htmlContent += `<h2 id="${listId}" class="list-title">📋 列表：${escapeHtml(selectedListsDict[listId])}</h2>\n`;

            listCards.forEach((card, i) => {
                const descParsedHTML = marked.parse(card.desc);
                
                htmlContent += `
                <div class="card">
                    <h3>${i+1}. ${escapeHtml(card.name)}</h3>
                    <div class="meta"><strong>🏷️ 標籤：</strong>${escapeHtml(card.labels)}</div>
                    <div class="desc"><strong>📖 簡介：</strong><div class="markdown">${descParsedHTML}</div></div>
                `;

                if (card.comments.length > 0) {
                    htmlContent += '<div class="comments"><strong>💡 心得筆記：</strong><ul>';
                    
                    // Sort primarily by date asc
                    card.comments.sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));
                    
                    card.comments.forEach(comment => {
                        const commentParsedHTML = marked.parse(comment.text);
                        htmlContent += `
                        <li class="comment">
                            <div class="time">${comment.dateFmt}</div>
                            <div class="comment-text markdown">${commentParsedHTML}</div>
                        </li>`;
                    });
                    
                    htmlContent += '</ul></div>';
                }
                htmlContent += "</div>\n";
            });
        });

        // Add auto-print script
        htmlContent += `
        <script>
            window.addEventListener('load', function() {
                setTimeout(function(){ window.print(); }, 500);
            });
        </script>
        </body></html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        
        if (!win) {
            alert('彈出視窗被瀏覽器阻擋了！\n請允許本網頁彈出視窗，以正常顯示 PDF 開啟畫面。');
        }
    }
});
