// ==UserScript==
// @name         财新文章导出工具
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  导出财新文章为精美的 HTML 文件
// @author       You
// @match        https://*.caixin.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建悬浮按钮
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'caixin-export-btn';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>导出文章</span>
        `;

        // 按钮样式
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #191970 0%, #16213e 100%);
            color: #fff;
            padding: 12px 20px;
            border-radius: 50px;
            cursor: pointer;
            font-family: 'Noto Sans SC', sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        `;

        // 悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.05)';
            button.style.boxShadow = '0 6px 20px rgba(196,18,48,0.4)';
            button.style.borderColor = '#c41230';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            button.style.borderColor = 'transparent';
        });

        // 点击事件
        button.addEventListener('click', exportArticle);

        document.body.appendChild(button);
    }

    // 导出文章功能
    function exportArticle() {
        // 显示加载状态
        const btn = document.getElementById('caixin-export-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> 导出中...`;
        btn.style.pointerEvents = 'none';

        // 滚动到底部加载内容
        window.scrollBy(0, document.body.scrollHeight);

        // 延迟执行以确保内容加载
        setTimeout(() => {
            try {
                performExport();
                btn.innerHTML = `<span>✓</span> 导出成功`;
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.pointerEvents = 'auto';
                }, 2000);
            } catch (error) {
                console.error('导出失败:', error);
                btn.innerHTML = `<span>✗</span> 导出失败`;
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.pointerEvents = 'auto';
                }, 2000);
            }
        }, 500);
    }

    // 执行导出
    function performExport() {
        let content = document.getElementById('the_content'),
            content1 = content.querySelector('div#conTit'),
            content2 = content.querySelector('div.media'),
            content3 = content.querySelector('div#Main_Content_Val'),
            titleText = '',
            subtitleText = '',
            authorName = '',
            authorTitles = [],
            imgUrl = '',
            imgCaption = '',
            paragraphs = [];

        if (content1) {
            let h1Elem = content1.querySelector('h1');
            h1Elem && (titleText = h1Elem.innerText.replace(/文｜/, '').trim());
            let subheadElem = content1.querySelector('div.subhead');
            subheadElem && (subtitleText = subheadElem.innerText.trim());
            let bElems = content1.querySelectorAll('b');
            bElems.length > 0 && (authorName = bElems[0].innerText.replace(/文｜/, '').trim(), authorTitles = Array.from(bElems).slice(1).map(e => e.innerText.trim()));
        }

        if (content2) {
            let imgElem = content2.querySelector('img');
            imgElem && (imgUrl = imgElem.src);
            let captionElem = content2.querySelector('dd');
            captionElem && (imgCaption = captionElem.innerText.trim());
        }

        if (content3) {
            let pElems = content3.querySelectorAll('p');
            pElems.forEach(p => {
                let text = p.innerText.trim();
                text && !text.startsWith('请务必') && !text.includes('文｜') && paragraphs.push(text);
            });
        }

        let authorSection = authorName ? `<div class='author-name'>${authorName}</div>` : '',
            authorTitlesHtml = authorTitles.map(t => `<div class='author-title'>${t}</div>`).join('');

        let beautifiedHTML = `<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'><title>${document.title}</title><link href='https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500&display=swap' rel='stylesheet'><style>:root{--primary-color:#1a1a1a;--accent-color:#c41230;--bg-color:#fafafa}*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}body{font-family:'Noto Serif SC',Georgia,serif;background:var(--bg-color);color:var(--primary-color);line-height:1.8}.progress-container{height:3px;background:transparent;position:fixed;top:0;left:0;z-index:101;width:100%}.progress-bar{height:100%;background:var(--accent-color);width:0%}.header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:1rem 0;box-shadow:0 2px 10px rgba(0,0,0,0.1);position:sticky;top:0;z-index:100}.nav-container{max-width:1200px;margin:0 auto;padding:0 2rem;display:flex;justify-content:space-between;align-items:center}.logo{font-family:'Noto Sans SC',sans-serif;font-size:1.5rem;font-weight:700;color:#fff;letter-spacing:2px}.logo span{color:var(--accent-color)}.container{max-width:800px;margin:0 auto;padding:3rem 2rem}.article-header{text-align:center;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #e8e8e8}.category-tag{display:inline-block;background:var(--accent-color);color:#fff;padding:.3rem 1rem;font-family:'Noto Sans SC',sans-serif;font-size:.75rem;font-weight:500;letter-spacing:2px;margin-bottom:1.5rem;border-radius:2px}h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:700;line-height:1.3;margin-bottom:1.5rem;letter-spacing:-.02em}.subtitle{font-family:'Noto Sans SC',sans-serif;font-size:1.1rem;color:#555;line-height:1.6;max-width:600px;margin:0 auto 2rem}.author-section{display:flex;flex-direction:column;align-items:center;gap:.5rem;margin-top:2rem}.author-name{font-family:'Noto Sans SC',sans-serif;font-size:1rem;font-weight:600}.author-name::after{content:'';display:block;width:40px;height:2px;background:var(--accent-color);margin:.5rem auto}.author-title{font-family:'Noto Sans SC',sans-serif;font-size:.85rem;color:#666}.hero-image{margin:3rem 0;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1)}.hero-image img{width:100%;height:auto;display:block}.image-caption{font-family:'Noto Sans SC',sans-serif;font-size:.8rem;color:#777;padding:1rem 1.5rem;background:#f5f5f5;border-left:3px solid var(--accent-color)}.highlight-box{background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%);border-left:4px solid var(--accent-color);padding:1.5rem 2rem;margin:2.5rem 0;border-radius:0 8px 8px 0;font-family:'Noto Sans SC',sans-serif}.highlight-box p{text-indent:0;margin:0;font-size:1rem;color:#555;font-style:italic;line-height:1.8}.article-content{font-size:1.125rem;line-height:2}.article-content p{margin-bottom:1.8rem;text-align:justify;text-indent:2em}.article-content p:first-of-type{text-indent:0}.article-content p:first-of-type::first-letter{font-size:3.5rem;float:left;line-height:1;padding-right:.5rem;margin-top:-.2rem;font-weight:700;color:var(--accent-color)}.divider{width:60px;height:2px;background:var(--accent-color);margin:3rem auto}.article-footer{margin-top:4rem;padding-top:2rem;border-top:1px solid #e8e8e8;text-align:center}.disclaimer{font-family:'Noto Sans SC',sans-serif;font-size:.8rem;color:#999;line-height:1.6;max-width:600px;margin:0 auto;padding:1.5rem;background:#f8f8f8;border-radius:4px}.disclaimer a{color:var(--accent-color);text-decoration:none}::selection{background:rgba(196,18,48,0.2);color:#000}@media(max-width:768px){.container{padding:2rem 1.5rem}h1{font-size:1.8rem}.article-content{font-size:1rem;line-height:1.8}}@media print{.header,.progress-container{display:none}body{background:#fff}.article-content{font-size:12pt}}</style></head><body><div class='progress-container'><div class='progress-bar' id='progressBar'></div></div><header class='header'><div class='nav-container'><div class='logo'>财新<span>周刊</span></div></div></header><main class='container'><article><header class='article-header'><div class='category-tag'>专栏</div><h1>${titleText}</h1>${subtitleText?`<p class='subtitle'>${subtitleText}</p>`:''}<div class='author-section'>${authorSection}${authorTitlesHtml}<div class='publish-info'>财新网</div></div></header>${imgUrl?`<figure class='hero-image'><img src='${imgUrl}' alt='${imgCaption||''}'/>${imgCaption?`<figcaption class='image-caption'>${imgCaption}</figcaption>`:''}</figure>`:''}${paragraphs.length>0?`<div class='highlight-box'><p>${paragraphs[0]}</p></div>`:''}<div class='article-content'>${paragraphs.slice(1).map(p=>`<p>${p.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`).join('')}</div><div class='divider'></div><footer class='article-footer'><div class='disclaimer'><p>本文内容由 AI 辅助整理，仅供参考。</p></div></footer></article></main><script>window.onscroll=function(){var winScroll=document.body.scrollTop||document.documentElement.scrollTop,height=document.documentElement.scrollHeight-document.documentElement.clientHeight,scrolled=(winScroll/height)*100;document.getElementById('progressBar').style.width=scrolled+'%'}<\/script></body></html>`;

        let blob = new Blob([beautifiedHTML], {type: 'text/html;charset=utf-8'});

        function pad2(n) {
            return String(n).padStart(2, '0');
        }

        let urlPath = window.location.pathname,
            pathParts = urlPath.split('/'),
            datePart = '',
            idPart = '';

        for (let i = 0; i < pathParts.length; i++) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(pathParts[i])) {
                datePart = pathParts[i].replace(/-/g, '');
            }
            if (/^\d+\.html$/.test(pathParts[i])) {
                idPart = pathParts[i].replace('.html', '');
            }
        }

        let safeTitle = document.title.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').replace(/[\\/|*?"<>]/g, '').trim(),
            filename = (datePart || 'unknown') + '_' + (idPart || 'unknown') + '_' + safeTitle + '.html',
            downloadLink = document.createElement('a');

        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        console.log('导出文件名：', filename);
        window.scrollBy(0, -document.body.scrollHeight);
    }

    // 添加旋转动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // 页面加载完成后创建按钮
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
        createFloatingButton();
    }
})();