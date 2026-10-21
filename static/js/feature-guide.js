/* Metadata only: this page never calls a business API or opens application data. */
(() => {
  'use strict';
  const data = window.FEATURE_GUIDE;
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if (!data) { $('detail').textContent = '對照資料載入失敗，請重新整理頁面。'; return; }
  const features = data.features;
  const searchable = new Map(features.map(f => [f.id, JSON.stringify(f).toLowerCase()]));
  let active = null;
  let graphEdges = [];
  let graphFrame = null;
  function scheduleLines() {
    if (graphFrame !== null) cancelAnimationFrame(graphFrame);
    graphFrame = requestAnimationFrame(drawLines);
  }
  function drawLines() {
    graphFrame = null;
    const diagram = $('architecture-diagram'), svg = $('architecture-lines');
    const bounds = diagram.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    svg.replaceChildren();
    for (const edge of graphEdges) {
      const from = document.getElementById(edge.from), to = document.getElementById(edge.to);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const parentA = from.parentElement.getBoundingClientRect(), parentB = to.parentElement.getBoundingClientRect();
      // Independently scrolling columns: never draw lines through clipped cards.
      const ay = a.top + a.height / 2, by = b.top + b.height / 2;
      if (ay < parentA.top || ay > parentA.bottom || by < parentB.top || by > parentB.bottom) continue;
      const x1 = a.right - bounds.left, y1 = ay - bounds.top;
      const x2 = b.left - bounds.left, y2 = by - bounds.top;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${x1 + (x2-x1)/2} ${y1}, ${x1 + (x2-x1)/2} ${y2}, ${x2} ${y2}`);
      path.setAttribute('class', edge.type === 'table' ? 'table-edge' : 'feature-edge');
      svg.append(path);
    }
  }
  function renderGraph(feature) {
    const entries = new Set(feature.routes.map(r => r.file));
    const sqlFiles = new Set(feature.routes.flatMap(r => r.tables.map(t => t.file)));
    const files = [...new Set([...entries, ...sqlFiles])];
    const tables = [...new Set(feature.routes.flatMap(r => r.tables.map(t => t.name)))];
    const storage = [...new Set(feature.routes.flatMap(r => r.storage))];
    $('graph-files').innerHTML = files.map((file, index) => `<div class="graph-node file-node" id="graph-file-${index}"><small>${entries.has(file) ? '後端入口' : 'SQL 輔助程式'}</small><b>${esc(file)}</b></div>`).join('');
    $('graph-tables').innerHTML = tables.map((name, index) => `<div class="graph-node table-node" id="graph-table-${index}"><small>SQL 資料表</small><b>${esc(name)}</b></div>`).join('') || '<p class="empty">此功能未偵測到 SQL 資料表引用，可能使用 JSON、外部服務或間接資料存取。請查看下方說明。</p>';
    if (storage.length) $('graph-tables').insertAdjacentHTML('beforeend', `<div class="graph-storage"><small>其他來源引用（不屬於 SQL 資料表）</small>${storage.map(s => `<div>${esc(s)}</div>`).join('')}</div>`);
    graphEdges = files.map((file, i) => ({from: 'graph-feature-' + feature.id, to: 'graph-file-' + i, type: 'feature'}));
    const pairs = new Set();
    for (const route of feature.routes) for (const table of route.tables) {
      const key = table.file + ':' + table.name;
      if (pairs.has(key)) continue;
      pairs.add(key);
      graphEdges.push({from: 'graph-file-' + files.indexOf(table.file), to: 'graph-table-' + tables.indexOf(table.name), type: 'table'});
    }
    $('graph-status').textContent = `${feature.name}：${files.length} 個程式檔 · ${tables.length} 張已確認引用的 SQL 資料表`;
    $('show-detail').textContent = `查看「${feature.name}」詳細說明 ↓`;
    $('graph-files').scrollTop = 0;
    $('graph-tables').scrollTop = 0;
    const selected = document.getElementById('graph-feature-' + feature.id);
    if (selected) {
      const box = selected.getBoundingClientRect(), rail = $('features').getBoundingClientRect();
      if (box.top < rail.top || box.bottom > rail.bottom) $('features').scrollTop += box.top - rail.top - 12;
    }
    scheduleLines();
  }
  $('stats').innerHTML = `<span><strong>${features.length}</strong>功能主題</span><span><strong>${data.routeCount}</strong>API 對照</span><span><strong>${data.schemaCount}</strong>建表定義</span>`;
  [...new Set(features.map(f => f.group))].forEach(group => { const option = document.createElement('option'); option.value = option.textContent = group; $('group').append(option); });
  function select(id) {
    const feature = features.find(f => f.id === id);
    if (!feature) return;
    active = id;
    history.replaceState(null, '', '#' + encodeURIComponent(id));
    document.querySelectorAll('.feature').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === id)));
    const tables = [...new Set(feature.routes.flatMap(r => r.tables.map(t => t.name)))];
    const storage = [...new Set(feature.routes.flatMap(r => r.storage))];
    const front = [...new Map(feature.frontend.map(r => [r.file, r])).values()];
    $('detail').innerHTML = `<span class="tag">${esc(feature.group)} / 功能對照</span><h2>${esc(feature.name)}</h2><p class="summary">${esc(feature.summary)}</p>
      <h3>01 — 處理流程</h3><ol class="flow"><li><span>STEP 01</span><b>操作網頁</b>使用者選擇功能、輸入條件或送出表單。</li><li><span>STEP 02</span><b>呼叫後端</b>網頁向下方 API 發出請求，進入對應處理函式。</li><li><span>STEP 03</span><b>處理與存取</b>${esc(feature.summary)}</li><li><span>STEP 04</span><b>回傳結果</b>依端點回傳資料、狀態或下載檔案，由網頁呈現。</li></ol>
      <h3>02 — 網頁與資料來源</h3><p class="muted">前端呼叫位置（每個檔案列出一個代表行號）</p>${front.length ? `<ul class="evidence">${front.map(s => `<li class="source">${esc(s.file)}：第 ${s.line} 行</li>`).join('')}</ul>` : '<p class="muted">未找到直接包含 API 路徑的前端呼叫；可能由共用函式或動態路徑呼叫。</p>'}
      <p class="muted">已確認的 SQL 資料表引用</p><div class="chips">${tables.map(t => `<span class="chip">${esc(t)}</span>`).join('') || '<span class="muted">靜態分析未找到 SQL 表名；請查看下方程式與其他資料來源。</span>'}</div>
      ${storage.length ? `<p class="muted">程式引用的 JSON 檔案／儲存區段（是否啟用依執行設定而定）</p><div class="chips">${storage.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
      <h3>03 — API、程式檔與建表位置</h3><p class="muted">點開端點，查看處理函式及資料表引用證據。</p>
      ${feature.routes.map((route, index) => `<details class="endpoint" ${index === 0 ? 'open' : ''}><summary><span class="method">${esc(route.methods.join(' / '))}</span>${esc(route.url)}</summary><div class="endpoint-body"><h4>後端入口</h4><div class="source">${esc(route.file)}：第 ${route.line} 行 → ${esc(route.function)}()</div><h4>資料表與建表定義</h4>${route.tables.length ? `<ul class="evidence">${[...new Map(route.tables.map(t => [t.name, t])).values()].map(t => `<li><b>${esc(t.name)}</b><br><span class="source">SQL 引用：${esc(t.file)}：${t.line}<br>建表：${t.schema.map(s => `${esc(s.file)}：${s.line}`).join('；')}</span></li>`).join('')}</ul>` : '<p class="muted">未偵測到可對應建表定義的 SQL 引用。這不代表執行時不會間接查詢資料。</p>'}${route.storage.length ? `<h4>其他資料來源引用</h4>${route.storage.map(s => `<div class="source">${esc(s)}</div>`).join('')}` : ''}<details class="files"><summary>展開追蹤到的處理函式（${route.files.length}）</summary><ul class="evidence">${route.files.map(s => `<li class="source">${esc(s.file)}：${s.line} → ${esc(s.function)}()</li>`).join('')}</ul></details></div></details>`).join('')}
      <h3>如何核對這份說明？</h3><p class="hint">這是原始碼的靜態對照，不是實際資料庫連線檢測。表名來自 SQL 字串，並追蹤同檔函式、明確匯入函式與 deps 呼叫；動態 SQL、物件方法和部分跨模組呼叫可能未涵蓋。共用函式可能帶入身分驗證或稽核資料表。JSON、記憶體示範資料與外部服務是否啟用，以執行設定為準。行號以產生此頁資料時的程式版本為準。</p>`;
    document.title = feature.name + '｜功能對照說明';
    renderGraph(feature);
  }
  function filter() {
    const query = $('search').value.trim().toLowerCase(), group = $('group').value;
    const visible = features.filter(f => (!group || f.group === group) && (!query || searchable.get(f.id).includes(query)));
    $('count').textContent = `顯示 ${visible.length} / ${features.length} 個功能`;
    $('features').replaceChildren();
    if (!visible.length) {
      $('features').innerHTML = '<p class="empty">找不到符合的功能，請換個關鍵字或選擇所有分類。</p>';
      $('graph-files').replaceChildren(); $('graph-tables').replaceChildren();
      $('graph-status').textContent = '沒有符合搜尋與分類的功能。';
      $('detail').innerHTML = '<p class="empty">找不到符合的功能，請清除搜尋或調整分類。</p>';
      $('show-detail').hidden = true; graphEdges = []; scheduleLines(); return;
    }
    $('show-detail').hidden = false;
    for (const f of visible) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'feature'; button.dataset.id = f.id;
      button.id = 'graph-feature-' + f.id;
      button.setAttribute('aria-pressed', String(active === f.id));
      button.innerHTML = `<small>${esc(f.group)} · ${f.routes.length} 個端點</small><b>${esc(f.name)}</b>`;
      button.addEventListener('click', () => select(f.id)); $('features').append(button);
    }
    select(visible.some(f => f.id === active) ? active : visible[0].id);
  }
  $('search').addEventListener('input', filter); $('group').addEventListener('change', filter);
  $('print').addEventListener('click', () => { document.querySelectorAll('#detail details').forEach(d => d.open = true); window.print(); });
  for (const id of ['features', 'graph-files', 'graph-tables']) $(id).addEventListener('scroll', scheduleLines, {passive: true});
  window.addEventListener('resize', scheduleLines);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(scheduleLines).observe($('architecture-diagram'));
  function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; } }
  $('show-detail').addEventListener('click', event => { event.preventDefault(); $('detail').scrollIntoView({behavior:'smooth', block:'start'}); });
  window.addEventListener('hashchange', () => { const id = hashId(); if (features.some(f => f.id === id)) { $('search').value = ''; $('group').value = ''; active = id; filter(); } });
  const initial = hashId(); active = features.some(f => f.id === initial) ? initial : features[0].id;
  filter(); select(active);
})();
