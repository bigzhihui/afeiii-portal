import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { renderCatalog } from "./catalog.mjs";
import { guides, guideHomeSection, guideIndex, guideArticle } from "./guides.mjs";

const catalog = JSON.parse(await readFile(new URL("../data/tool-catalog.json", import.meta.url), "utf8"));
const origin = "https://afeiii.com";
const sites = [
  {
    name: "PDF 工具",
    host: "pdf",
    category: "documents",
    icon: "PDF",
    badge: "浏览器本地处理",
    tone: "#aa583a",
    wash: "#fbede4",
    description: "合并、拆分、压缩和整理 PDF。把零散文档，变成一份顺手的文件。",
    tags: ["合并与拆分", "PDF 转图片", "页面整理"],
  },
  {
    name: "格式转换",
    host: "convert",
    category: "media",
    icon: "↔",
    badge: "免注册 · 本地转换",
    tone: "#694b8a",
    wash: "#f1eafa",
    description:
      "转换图片、音频、文档及支持的视频。先查看支持范围，再选择适合文件的格式。",
    tags: ["JPG / PNG / WebP", "音频互转", "DOCX / Markdown"],
  },
  {
    name: "开发工具箱",
    host: "tools",
    category: "development",
    icon: "{ }",
    badge: "开发与日常效率",
    tone: "#396d9b",
    wash: "#eaf2fa",
    description:
      "JSON 格式化、Base64 编解码、哈希与文本处理。打开即用的开发小工具。",
    tags: ["JSON", "编码解码", "文本处理"],
  },
  {
    name: "在线简历",
    host: "resume",
    category: "career",
    icon: "CV",
    badge: "账号保存与管理",
    tone: "#986c26",
    wash: "#faf2df",
    description:
      "从模板开始整理经历，编辑并导出简历。登录后可在不同设备继续修改。",
    tags: ["简历模板", "在线编辑", "PDF 导出"],
  },
  {
    name: "网站检测",
    host: "check",
    category: "development",
    icon: "◎",
    badge: "公开网址检测",
    tone: "#267062",
    wash: "#e5f3ee",
    description:
      "查看 DNS、SSL、HTTP 响应和 SEO 标签，为自己的网站排查基础配置。",
    tags: ["DNS / SSL", "HTTP 响应", "SEO 检查"],
  },
];
const nav = `<a href="/">主站</a>${sites.map((s) => `<a href="https://${s.host}.afeiii.com/">${s.name}</a>`).join("")}`;
const footer = `<footer class="footer"><div class="wrap"><div class="footer-row"><span>© ${new Date().getFullYear()} 十三月 · afeiii.com</span><nav aria-label="网站信息"><a href="/guides/">使用指南</a><a href="/about/">关于</a><a href="/privacy/">隐私说明</a><a href="/terms/">使用条款</a><a href="mailto:support@afeiii.com">联系反馈</a><a href="https://status.afeiii.com/">服务状态</a><a href="https://github.com/bigzhihui/afeiii-portal">本站源码</a></nav></div><p>基于开源工具构建，各项目保留原作者署名与许可证。具体功能及数据处理方式以各站说明为准。</p></div></footer>`;
const token =
  process.env.CF_WEB_ANALYTICS_TOKEN ?? "1de4c686fa1e40889ff348db015c2e5f";
if (token && !/^[a-f0-9]{32}$/i.test(token))
  throw Error("Invalid public Cloudflare Web Analytics token");
const beacon = token
  ? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token })}'></script>`
  : "";
function page(title, description, path, body, script = false, article = null) {
  body = body.replace(/<a\b[^>]*href="https:\/\/(?:pdf|tools|convert|resume|check)\.afeiii\.com(?:\/[^"\s]*)?"[^>]*>/g, (tag) => {
    const clean = tag.replace(/\s(?:target|rel)="[^"]*"/g, "");
    return `${clean.slice(0, -1)} target="_blank" rel="noopener noreferrer"${/\stitle=/.test(clean) ? "" : ' title="在新标签页打开"'}>`;
  });
  const schema = article
    ? { "@context": "https://schema.org", "@type": "Article", headline: title, description, mainEntityOfPage: `${origin}${path}`, image: `${origin}/guides/images/${article.image}.jpg`, datePublished: article.date, dateModified: article.date, author: { "@type": "Organization", name: "十三月维护者", url: `${origin}/about/` }, publisher: { "@type": "Organization", name: "十三月", url: origin } }
    : { "@context": "https://schema.org", "@type": path === "/" ? "WebSite" : "WebPage", name: path === "/" ? "十三月" : title, url: `${origin}${path}`, description };
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · 十三月</title><meta name="description" content="${description}"><link rel="canonical" href="${origin}${path}"><meta property="og:type" content="${article ? "article" : "website"}"><meta property="og:title" content="${title} · 十三月"><meta property="og:description" content="${description}"><meta property="og:url" content="${origin}${path}"><meta name="theme-color" content="#f6f5ef"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">${script ? '<link rel="stylesheet" href="/catalog.css">' : ""}<script type="application/ld+json">${JSON.stringify(schema)}</script>${script ? '<script type="module" src="/app.js"></script>' : ""}</head><body><a class="skip" href="#main">跳到主要内容</a><header><div class="wrap topbar"><a class="brand" href="/" aria-label="十三月首页"><span class="brand-mark" aria-hidden="true">13</span><span>十三月<small>AFEIII.COM</small></span></a><nav class="topnav" aria-label="主导航"><a href="/#tools">全部工具</a><a href="/guides/"${path === "/guides/" ? ' aria-current="page"' : ""}>使用指南</a><a class="about-link" href="/about/">关于十三月</a><a class="status-link" href="https://status.afeiii.com/">服务状态 ↗</a></nav></div></header>${body}${footer}${beacon}</body></html>`;
}
const cards = sites
  .map(
    (s) =>
      `<a class="tool" style="--tone:${s.tone};--wash:${s.wash}" href="https://${s.host}.afeiii.com/"><div class="tool-top"><span class="icon" aria-hidden="true">${s.icon}</span><span class="badge">${s.badge}</span></div><h3>${s.name}</h3><p>${s.description}</p><div class="tags">${s.tags.map((t) => `<span>${t}</span>`).join("")}</div><div class="card-end"><span>${s.host}.afeiii.com</span><strong aria-hidden="true">↗</strong></div></a>`,
  )
  .join("");
const home = `<main id="main" class="wrap"><section class="hero" aria-labelledby="hero-title"><div><span class="eyebrow">A SMALL TOOL FOR EVERYDAY WORK</span><h1 id="hero-title">把手头的事，<br><em>顺手做完。</em></h1><p>处理文件、整理文档、写好简历、检查网站。<br>五个实用工具站，从这里开始。</p><div class="hero-note"><span>开源项目构建</span><span>中文使用体验</span><span>清楚说明数据去向</span></div></div><div class="search-panel"><label for="tool-search">今天想完成什么？</label><div class="search-box"><span aria-hidden="true">⌕</span><input id="tool-search" type="search" placeholder="试试 PDF 压缩、JSON 对比、图片转换…" autocomplete="off" aria-controls="tool-list"><kbd aria-hidden="true">/</kbd></div><p class="search-help">常用：<a href="https://pdf.afeiii.com/zh/merge-pdf">合并 PDF</a> · <a href="https://convert.afeiii.com/">图片转换</a> · <a href="https://tools.afeiii.com/json-prettify">JSON 格式化</a></p><p class="search-local">支持中文名称、英文名称和常用别名，搜索词只在当前浏览器处理。</p></div></section><section id="tools" aria-labelledby="tools-title"><div class="section-head"><div><h2 id="tools-title">找到具体工具，直接开始</h2><p>全部工具与功能入口均可搜索；工具、共用入口和指南分别标明。</p></div><button class="text-button" id="clear-search">重置筛选</button></div><div class="catalog-controls"><div class="filters" role="group" aria-label="按用途筛选"><button data-filter="all" aria-pressed="true">全部</button><button data-filter="documents" aria-pressed="false">PDF 与文档</button><button data-filter="media" aria-pressed="false">图片与音视频</button><button data-filter="development" aria-pressed="false">开发与网站</button><button data-filter="career" aria-pressed="false">求职简历</button></div><label class="site-filter" for="site-filter">所属站点<select id="site-filter"><option value="all">全部站点与指南</option value="pdf">PDF 工具</option><option value="tools">开发工具箱</option><option value="convert">格式转换</option><option value="resume">在线简历</option><option value="check">网站检测</option><option value="portal">使用指南</option></select></label></div>${renderCatalog(catalog)}</section><section class="site-directory" aria-labelledby="sites-title"><div class="section-head"><div><h2 id="sites-title">按站点访问</h2><p>也可以进入各站，浏览完整工具与使用说明。</p></div></div><div class="cards">${cards}</div></section><section class="workflow"><div><span class="eyebrow">QUICK START</span><h2>从一件具体的小事开始</h2><div class="tasks"><a href="https://pdf.afeiii.com/zh/merge-pdf">把多份 PDF 合成一份<small>PDF 工具</small><span aria-hidden="true">↗</span></a><a href="https://convert.afeiii.com/">把图片转换成另一种格式<small>格式转换</small><span aria-hidden="true">↗</span></a><a href="https://tools.afeiii.com/json-prettify">整理一段 JSON 数据<small>开发工具箱</small><span aria-hidden="true">↗</span></a><a href="https://resume.afeiii.com/">从模板开始制作简历<small>在线简历</small><span aria-hidden="true">↗</span></a><a href="https://check.afeiii.com/">看看网站的证书和 DNS<small>网站检测</small><span aria-hidden="true">↗</span></a></div></div><aside class="privacy-box"><span class="eyebrow">YOUR FILES, YOUR CHOICE</span><h2>先了解处理方式，<br>再放心开始。</h2><p>PDF 工具与格式转换在浏览器中处理文件，首次使用需下载引擎。格式和大文件支持受浏览器与设备能力限制。</p><p>简历站提供账号与云端保存；网站检测会由服务器访问你输入的公开网址。不同工具的数据处理方式各有说明。</p><a href="/privacy/">了解各站的数据处理方式 →</a></aside></section>${guideHomeSection()}</main>`;
const articles = {
  about: {
    title: "关于十三月",
    intro: "把分散的实用工具，整理成一个容易找到、容易使用的入口。",
    sections: [
      [
        "我们在做什么",
        "十三月是独立维护的在线工具集合，覆盖 PDF、文件格式转换、开发小工具、在线简历与网站检测。目标是让日常任务更顺手，不为凑数量重复建设工具。",
      ],
      [
        "开源与署名",
        "工具箱基于 IT-Tools（GPL-3.0），PDF 工具基于 BentoPDF（AGPL-3.0），简历站基于 Reactive Resume（MIT），网站检测基于 Web-Check（MIT），格式转换基于 VERT（AGPL-3.0）。感谢各项目作者和贡献者，各站均保留源码与许可入口。",
      ],
      [
        "功能与限制",
        "工具入口已上线。支持格式不等于每个文件都成功；视频、复杂文档与大文件会受设备、浏览器或部署配置限制。重要文件请先备份，处理后检查输出。",
      ],
      [
        "联系反馈",
        "联系 support@afeiii.com。反馈时请提供站点、操作步骤、浏览器及错误信息；请勿发送身份证、个人简历或其他敏感原文件。",
      ],
    ],
  },
  privacy: {
    title: "隐私说明",
    intro: "更新日期：2026-10-19。本页说明主站与五个工具站的数据处理区别。",
    sections: [
      [
        "主站导航与搜索",
        "主站只提供工具入口；搜索与分类在浏览器中完成，不上传搜索词，不需要登录。点击工具入口后，会进入对应子站，适用该站的隐私说明。",
      ],
      [
        "本地文件处理",
        "PDF 工具与格式转换的文件处理在浏览器中进行。引擎、字体与必要静态资源需要通过网络获取；本站没有为这些本地转换提供文件上传后端。某些工具可能涉及联网查询，请以具体工具说明为准。",
      ],
      [
        "简历与网站检测",
        "简历站登录后会将账户与简历保存到服务器，并按分享设置提供公开链接。网站检测会把输入的公开网址发送到检测服务器，由服务器查询 DNS、证书或访问该网站。不要输入内网、含令牌的网址或不希望被访问的地址。",
      ],
      [
        "访问统计",
        token
          ? "主站已启用 Cloudflare Web Analytics，用于了解页面访问、来源与加载性能，不上传待处理文件，不使用统计 Cookie 或跨站广告标识。浏览器与 Cloudflare 会处理必要的请求信息。统计只能反映收到的浏览器事件，不能代表真实人数或任务完成量。"
          : "主站目前未启用浏览器访问统计。托管与网络服务仍会处理传输和安全所需的 IP、路径与浏览器信息。接入统计时会同步更新本说明，不采集文件内容、文件名、搜索输入或个人简历。",
      ],
      [
        "设置与联系方式",
        "各子站可能使用本地存储或必要登录 Cookie 保存偏好和会话。可在浏览器中清除站点数据；账号删除和资料管理请在相应工具站操作。隐私问题请联系 support@afeiii.com。",
      ],
    ],
  },
  terms: {
    title: "使用条款",
    intro: "适用于十三月主站与相关工具入口。具体工具的条款另见各站说明。",
    sections: [
      [
        "使用与输出检查",
        "请使用你有权处理的文件和公开网址。重要文件先备份；下载后检查内容、页数、尺寸或时长。本站按当前状态提供功能，不保证所有格式、浏览器和设备兼容。",
      ],
      [
        "合理使用",
        "不要利用网站检测探测未经授权的目标、内网或敏感服务，不上传或传播违法内容。我们可能为维护服务稳定性限制请求、停用功能或更新软件。",
      ],
      [
        "开源与外部服务",
        "各开源项目遵循各自许可证，本站定制不改变其原有归属。第三方链接由对应运营者提供，跳转后请自行了解其条款与隐私政策。",
      ],
      ["联系", "功能异常或条款问题请联系 support@afeiii.com。"],
    ],
  },
};
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await writeFile(
  "dist/index.html",
  page(
    "实用在线工具集合",
    "PDF 处理、图片音频与文档格式转换、开发工具箱、在线简历和网站检测。十三月为日常工作整理五个实用工具入口。",
    "/",
    home,
    true,
  ),
);
for (const [key, a] of Object.entries(articles)) {
  await mkdir(`dist/${key}`, { recursive: true });
  await writeFile(
    `dist/${key}/index.html`,
    page(
      a.title,
      a.intro,
      `/${key}/`,
      `<main class="wrap" id="main"><article class="article"><span class="eyebrow">THIRTEEN MONTH</span><h1>${a.title}</h1><p>${a.intro}</p>${a.sections.map(([h, p]) => `<section><h2>${h}</h2><p>${p}</p></section>`).join("")}<nav aria-label="工具站导航" style="display:flex;flex-wrap:wrap;gap:18px;margin-top:36px">${nav}</nav></article></main>`,
    ),
  );
}
await mkdir("dist/guides", { recursive: true });
await writeFile(
  "dist/guides/index.html",
  page("使用指南", "图片转换、PDF 处理、JSON 格式化、简历制作和网站检测的实际步骤与常见问题。", "/guides/", guideIndex()),
);
for (const guide of guides) {
  await mkdir(`dist/guides/${guide.slug}`, { recursive: true });
  const image = { "image-format-conversion": "image-convert", "merge-compress-pdf": "pdf-merge", "json-formatting": "json-format", "resume-create-export": "resume-editor", "website-check-report": "website-report" }[guide.slug];
  await writeFile(
    `dist/guides/${guide.slug}/index.html`,
    page(guide.title, guide.description, guide.path, guideArticle(guide), false, { image, date: guide.date }),
  );
}
await writeFile(
  "dist/404.html",
  page(
    "页面未找到",
    "这个页面可能已移动。",
    "/404.html",
    '<main id="main" class="wrap article"><h1>这个页面还没找到。</h1><p>可以回到 <a href="/">工具首页</a>，从五个工具站继续。</p></main>',
  ),
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", "about/", "privacy/", "terms/", "guides/", ...guides.map((g) => `guides/${g.slug}/`)].map((p) => `<url><loc>${origin}/${p}</loc></url>`).join("")}</urlset>`,
);
await mkdir("dist/.well-known", { recursive: true });
await writeFile(
  "dist/.well-known/security.txt",
  "Contact: mailto:support@afeiii.com\nExpires: 2027-10-19T00:00:00Z\nPreferred-Languages: zh, en\n",
);
let revision = "local";
try {
  revision = execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${resolve(".")
        .replaceAll("\\", "/")
        .replace(/^[a-z]:/, (x) => x.toUpperCase())}`,
      "rev-parse",
      "HEAD",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
} catch {}
await writeFile(
  "dist/build-info.json",
  JSON.stringify(
    {
      name: "十三月主站",
      revision,
      catalogEntries: catalog.entries.length,
      analytics: token ? "cloudflare-web-analytics" : "not-configured",
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  `Built portal: homepage, information pages, ${guides.length} guides and guide index, sitemap, security contact and version marker. Analytics:`,
  token ? "enabled" : "not configured",
);
