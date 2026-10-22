export const siteNames = { pdf: "PDF 工具", tools: "开发工具箱", convert: "格式转换", resume: "在线简历", check: "网站检测", portal: "使用指南" };
export const kinds = { tool: "打开工具", shared: "进入操作入口", account: "需要登录", guide: "阅读指南", external: "第三方服务说明", directory: "工具导航" };
export const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export function validateCatalog(catalog) {
  const ids = new Set();
  for (const entry of catalog.entries) {
    if (ids.has(entry.id)) throw Error(`Duplicate catalog id: ${entry.id}`);
    ids.add(entry.id);
    const url = new URL(entry.url);
    if (!siteNames[entry.site] || !kinds[entry.kind] || !["documents", "media", "development", "career"].includes(entry.category) || !entry.name || !entry.description || !Array.isArray(entry.aliases) || !entry.aliases.every((v) => typeof v === "string")) throw Error(`Invalid catalog entry: ${entry.id}`);
    const host = entry.site === "portal" ? "afeiii.com" : `${entry.site}.afeiii.com`;
    if (url.protocol !== "https:" || url.hostname !== host || url.port || url.username || url.password || url.search || url.hash) throw Error(`Invalid tool destination: ${entry.id}`);
    if (entry.site === "pdf" && (catalog.excludedPdf.includes(url.pathname.split("/").pop()) || !/^\/(zh\/)?[a-z0-9-]+$/.test(url.pathname))) throw Error(`Unavailable PDF entry: ${entry.id}`);
  }
  for (const [site, count] of Object.entries(catalog.coverage)) {
    if (catalog.entries.filter((e) => e.site === (site === "guides" ? "portal" : site)).length !== count) throw Error(`Catalog coverage mismatch: ${site}`);
  }
}
export function renderCatalog(catalog) {
  validateCatalog(catalog);
  const popular = ["pdf:merge-pdf", "pdf:compress-pdf", "tools:json-prettify", "convert:image", "resume:editor", "check:website", "pdf:split-pdf", "tools:json-diff", "convert:audio", "tools:date-converter", "pdf:pdf-to-jpg", "convert:document"];
  const entries = [...catalog.entries].sort((a, b) => (popular.includes(a.id) ? popular.indexOf(a.id) : 999) - (popular.includes(b.id) ? popular.indexOf(b.id) : 999));
  const cards = entries.map((entry) => `<a class="catalog-item" data-id="${escapeHtml(entry.id)}" href="${escapeHtml(entry.url)}"><div class="catalog-meta"><span>${siteNames[entry.site]}</span><span>${kinds[entry.kind]} ↗</span></div><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.description)}</p></a>`).join("");
  return `<p class="catalog-count" id="search-result" role="status" aria-live="polite">共 ${entries.length} 项工具、功能入口与指南</p><div id="tool-list" class="catalog-list">${cards}</div><div id="search-empty" class="catalog-empty" hidden><h3>暂时没找到</h3><p>试试简短的工具名称，如“PDF 压缩”“JSON 对比”或“图片转换”，也可以清除筛选查看全部入口。</p><button id="clear-empty" class="text-button">清除筛选</button></div><div class="catalog-more"><button id="show-more" hidden>显示更多</button></div><noscript><p>当前展示完整目录。启用 JavaScript 后可在本机搜索和筛选。</p></noscript><script type="application/json" id="tool-catalog">${JSON.stringify(entries).replaceAll("<", "\\u003c")}</script>`;
}
