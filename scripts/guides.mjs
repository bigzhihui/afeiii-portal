const date = "2026-10-19";

function figure(name, alt, caption) {
  return `<figure class="guide-figure"><img src="/guides/images/${name}.jpg" width="1280" height="${name === "json-format" ? 1400 : 900}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${caption}</figcaption></figure>`;
}

function faq(items) {
  return `<div class="guide-faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>`;
}

export const guides = [
  {
    slug: "image-format-conversion",
    title: "JPG、PNG、WebP 怎么选？图片格式转换指南",
    shortTitle: "把图片转成合适的格式",
    category: "图片转换",
    description: "用透明 PNG 样例演示图片转换：选择 JPG、PNG 或 WebP，下载后检查尺寸与背景，理解体积变化和画质限制。",
    summary: "先选适合用途的格式，再按步骤转换。附透明图片样例、实际界面和结果检查方法。",
    tool: "十三月格式转换",
    toolUrl: "https://convert.afeiii.com/",
    contents: [["choose", "选哪种格式"], ["steps", "转换步骤"], ["check", "检查下载结果"], ["faq", "常见问题"]],
    body: `
<section id="choose"><h2>先按用途选格式</h2><p>格式转换适合解决“接收方不支持这个格式”一类问题。先查看对方要求的扩展名、尺寸和文件大小，再决定目标格式。</p><div class="guide-table"><table><caption>三种常见静态图片格式</caption><thead><tr><th scope="col">格式</th><th scope="col">适合什么</th><th scope="col">需要留意</th></tr></thead><tbody><tr><th scope="row">JPG / JPEG</th><td>照片，以及要求 JPG 的提交页面</td><td>有损压缩，不支持透明背景</td></tr><tr><th scope="row">PNG</th><td>透明图标、界面截图、文字边缘</td><td>无损编码；照片类内容的文件可能较大</td></tr><tr><th scope="row">WebP</th><td>支持 WebP 的网页与应用</td><td>支持透明、有损与无损编码；先确认接收方兼容</td></tr></tbody></table></div><p>这些是格式本身的特点。本站具体可转换的范围见<a href="https://convert.afeiii.com/formats/">支持范围与实测结果</a>；列表中的每一种格式组合并未全部验证。</p></section>
<section id="steps"><h2>跟着样例：PNG 转 WebP</h2><p>可以先下载这张 <a href="/guides/examples/sample-transparent.png" download>480 × 320 透明 PNG 样例</a>。它只含演示图形与文字，不含个人信息。</p><ol class="guide-steps"><li><strong>添加图片。</strong>打开<a href="https://convert.afeiii.com/">格式转换工具</a>，点击“拖放或点击以转换”，或把样例拖到选择区域。添加后进入转换页面。</li><li><strong>选择目标格式。</strong>点击文件卡片中的目标格式下拉框，搜索并选择 <code>.webp</code>。需要 JPG 时选择 <code>.jpg</code>；选好后点击菜单外的空白处收起菜单。这里是在选择输出格式，不是修改原文件名。</li><li><strong>开始转换。</strong>点击该文件的转换按钮，等待状态完成。首次使用可能需要下载转换引擎，速度与网络、设备有关。</li><li><strong>下载并打开。</strong>点击下载按钮保存结果，使用浏览器或图片查看器打开，确认能正常显示后再提交或分享。</li></ol>${figure("image-convert", "十三月格式转换中，透明 PNG 样例已选择 WebP 并完成转换", "实际操作截图：透明 PNG 转 WebP。按钮位置以当前页面为准。")}</section>
<section id="check"><h2>下载后检查三个地方</h2><ul><li><strong>像素尺寸：</strong>本页样例应仍为 480 × 320。改变格式不等于改变分辨率，也不会自动满足证件照或平台尺寸要求。</li><li><strong>背景：</strong>转 WebP 后检查透明区域；转 JPG 后透明区域会变成不透明背景。底色是否符合要求，需要打开输出文件确认。</li><li><strong>体积与细节：</strong>比较字边、细线、颜色和文件大小。转换后可能变大；已经丢失的细节不会因为转成 PNG 而恢复。</li></ul><aside class="guide-note"><strong>文件在哪处理？</strong><p>图片在当前浏览器中转换，本站不提供文件上传或远程转换后端。网页和引擎资源仍需联网下载；大图与批量处理会占用设备内存。</p></aside></section>
<section id="faq"><h2>常见问题</h2>${faq([
      ["把 .png 后缀改成 .jpg 就可以了吗？", "不可以。修改文件名不会改变内部编码。请使用转换工具生成新文件，再检查能否打开。"],
      ["为什么转成 JPG 后背景变了？", "JPG 不支持透明通道。透明部分需要被填成不透明颜色，转换后的底色不一定符合你的用途；需要透明时优先保留 PNG，或使用支持透明的 WebP。"],
      ["为什么转换后没有明显变小？", "体积取决于原图内容、原有压缩和输出编码。转换并不保证压缩比例；想满足某个平台的上限，需要以下载文件的实际字节数为准。"],
      ["转换失败或一直等待怎么办？", "先用本页的小样例重试，确认网络能加载引擎；再尝试较小的单张图片或更新的桌面浏览器。若仍失败，记录输入与目标格式、浏览器和错误提示，通过页面底部邮箱反馈。"],
    ])}</section><section class="guide-sources"><h2>参考与验证范围</h2><p>格式特点参考 <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types">MDN 图片格式指南</a>。本页步骤基于当前正式工具与演示样例核对；不能推断所有图片、色彩配置、浏览器或设备都兼容。</p></section>`,
  },
  {
    slug: "merge-compress-pdf",
    title: "PDF 怎么合并和压缩？顺序、清晰度与下载检查",
    shortTitle: "把 PDF 合好，再按需压缩",
    category: "PDF 文档",
    description: "使用两份演示文档合并 PDF，确认页序，再选择压缩方式。说明 Photon 的文字与链接限制、引擎配置提示和输出检查。",
    summary: "从两份文档合成一份开始，检查页序，再根据文件内容选择压缩方式。",
    tool: "十三月 PDF 工具",
    toolUrl: "https://pdf.afeiii.com/zh/merge-pdf",
    contents: [["merge", "合并与页序"], ["compress", "选择压缩方式"], ["check", "检查输出"], ["faq", "常见问题"]],
    body: `
<section id="merge"><h2>先合并：顺序以列表为准</h2><p>准备两份不含隐私的样例：<a href="/guides/examples/chapter-a.pdf" download>第一份 Chapter A（1 页）</a>和<a href="/guides/examples/chapter-b.pdf" download>第二份 Chapter B（1 页）</a>。按 A、B 顺序合并，预期得到 2 页文档。</p><ol class="guide-steps"><li><strong>选择文件。</strong>打开<a href="https://pdf.afeiii.com/zh/merge-pdf">合并 PDF</a>，添加两份 PDF。请以列表显示顺序为准，必要时拖动文件调整。</li><li><strong>确认页码范围。</strong>“File Mode（文件模式）”适合整份拼接；页码范围留空表示保留全部页面。只要部分页面时可填写 <code>1-3, 5</code>，页码从 1 开始。</li><li><strong>需要交错页面时再切换模式。</strong>“Page Mode（页面模式）”允许拖动缩略图重排。完成排列后再执行合并，避免重复封面或遗漏附件。</li><li><strong>合并并保存。</strong>点击“Merge PDFs（合并 PDF）”，保存下载的文件。先打开检查 A 在前、B 在后，再继续压缩。</li></ol>${figure("pdf-merge", "PDF 合并工具中已按 Chapter A 和 Chapter B 顺序添加两份单页样例", "实际操作截图：文件模式下，列表顺序决定整份文件的拼接顺序。")}</section>
<section id="compress"><h2>再压缩：先看文档里装的是什么</h2><p>合并只是把页面放到一起，不会自动让体积大幅减小。确有大小限制时，再把合并结果添加到<a href="https://pdf.afeiii.com/zh/compress-pdf">压缩 PDF</a>。</p><div class="guide-table"><table><caption>压缩页面的两种方式</caption><thead><tr><th scope="col">方式</th><th scope="col">适用情形</th><th scope="col">代价或条件</th></tr></thead><tbody><tr><th scope="row">Condense</th><td>希望优化结构和图片，并保留文字层的文档</td><td>依赖 PyMuPDF 与 Ghostscript 引擎；未配置时会提示设置</td></tr><tr><th scope="row">Photon</th><td>可以接受页面变成图片的扫描件、图片类 PDF</td><td>不保留可选择的文字和可点击链接；体积也可能增加</td></tr></tbody></table></div><p>本页演示使用 <strong>Photon + Balanced（均衡）</strong>：添加文档后，在算法下拉框选择 Photon，压缩等级选择 Balanced，再点击“Compress PDF（压缩 PDF）”保存结果。先从较温和的设置开始，只有清晰度允许时才逐步提高压缩程度。</p><aside class="guide-note"><strong>出现引擎配置提示时</strong><p>Condense 需要的引擎可能尚未在当前浏览器配置。不要把这个提示当作文件损坏；可以返回工具设置了解要求。若不能接受文字和链接丢失，请保留原文档，勿仅为完成操作而改用 Photon。</p></aside>${figure("pdf-compress", "PDF 压缩工具选择 Photon 算法与 Balanced 等级，界面显示页面将转为图片的提示", "实际操作截图：Photon 把页面渲染成图片，适合能够接受这一变化的文件。")}</section>
<section id="check"><h2>大小合格以后，还要检查内容</h2><ul><li><strong>页数和页序：</strong>两份单页样例合并后应有 2 页，Chapter A 在前，Chapter B 在后。</li><li><strong>文字与图片：</strong>放大检查小字、表格、印章和线条；屏幕上可读不代表打印后仍满足要求。</li><li><strong>可用功能：</strong>如果需要搜索、复制文字、点击链接或保留表单交互，请逐项测试。Photon 输出不保留原文字层及链接。</li><li><strong>实际体积：</strong>按目标平台要求检查下载文件，而不是只看压缩等级。已经很小的文字 PDF，变成图片后反而可能更大。</li></ul><p>合并和压缩会重新生成 PDF，可能影响原文件的<a href="https://helpx.adobe.com/acrobat/desktop/e-sign-documents/learn-about-signatures/signed-pdf-limitations.html">数字签名</a>。需要验证签名的文件，请保留原件并按接收方要求处理。</p></section>
<section id="faq"><h2>常见问题</h2>${faq([
      ["能保证压到 200 KB 或 1 MB 以下吗？", "不能保证。页数、图片内容和可接受的清晰度都会影响结果。文件太大时，可调整等级、按需拆分页，或询问接收方是否允许其他提交方式。"],
      ["为什么压缩后不能复制文字了？", "如果使用 Photon，页面已被渲染为图片，原有文字层不会保留。这是该算法的处理方式。需要复制和搜索文字时，应保留原文件或选择适合的结构优化方式，并检查输出。"],
      ["合并后的纸张尺寸为什么不一致？", "不同尺寸或方向的原页面可以合并在同一个文档中。合并并不自动统一纸张；下载后检查每页，确有需要再使用页面尺寸或旋转工具。"],
      ["PDF 会传到服务器吗？", "本站合并与压缩在浏览器中运行；网页、字体和必要引擎需要通过网络加载。文件较大时受设备内存限制。演示样例可以先帮助你确认当前浏览器能完成操作。"],
    ])}</section><section class="guide-sources"><h2>验证说明</h2><p>本页使用本站提供的两份单页演示 PDF 核对合并顺序，并验证 Photon 均衡压缩的下载结果。引擎与算法说明对应<a href="https://github.com/bigzhihui/bentopdf/blob/main/src/js/logic/compress-pdf-page.ts">本站压缩实现</a>。这不覆盖所有字体、加密文件、表单与数字签名。</p></section>`,
  },
  {
    slug: "json-formatting",
    title: "JSON 怎么格式化？缩进、语法排查与数据注意事项",
    shortTitle: "把一行 JSON 整理清楚",
    category: "开发工具",
    description: "用可复制的中文 JSON 样例演示实时格式化、缩进与键名排序，说明 JSON5 兼容、语法排查、大整数和浏览器本地保存。",
    summary: "用一段中文样例看懂缩进与键名排序，同时了解 JSON5、数字精度和本地保存。",
    tool: "JSON 美化与格式化",
    toolUrl: "https://tools.afeiii.com/json-prettify",
    contents: [["steps", "格式化步骤"], ["example", "输入与输出"], ["errors", "语法排查"], ["faq", "常见问题"]],
    body: `
<section id="steps"><h2>粘贴后实时得到结果</h2><p>查看接口返回或配置文件时，一整行 JSON 很难阅读。格式化能把对象与数组展开，让字段关系更清楚，但不会替你判断业务数据是否正确。</p><ol class="guide-steps"><li><strong>打开工具。</strong>进入<a href="https://tools.afeiii.com/json-prettify">JSON 美化与格式化</a>，把下方样例粘贴到“原始 JSON 内容”。</li><li><strong>设置缩进。</strong>将“缩进空格数”设为 <strong>2</strong>，右侧或下方会实时显示“格式化后的 JSON 结果”，无需点击提交。</li><li><strong>决定是否排序。</strong>本页示例关闭“按键名排序”，便于按输入顺序核对。开启后会调整对象键名的顺序，数组元素顺序保持原样。</li><li><strong>检查并复制。</strong>确认文字、数值与数组后，使用结果区的复制按钮；粘贴回目标系统前再次检查。</li></ol>${figure("json-format", "JSON 格式化工具显示中文样例，缩进为两个空格，键名排序已关闭", "实际操作截图：输入变化后自动更新结果。样例中的订单编号作为字符串保留。")}</section>
<section id="example"><h2>可以直接使用的样例</h2><p>下面只有演示字段。订单编号使用字符串，避免它被当作超出安全范围的数值处理。也可<a href="/guides/examples/sample.json" download>下载样例 JSON</a>。</p><h3>原始输入</h3><pre><code>{"site":"十三月","orderId":"9007199254740993","items":[{"name":"图片转换","enabled":true},{"name":"PDF 合并","enabled":false}]}</code></pre><h3>2 空格缩进，关闭排序后的结果</h3><pre><code>{
  "site": "十三月",
  "orderId": "9007199254740993",
  "items": [
    {
      "name": "图片转换",
      "enabled": true
    },
    {
      "name": "PDF 合并",
      "enabled": false
    }
  ]
}</code></pre><p>格式化前后核对字段、数组顺序和数值，不能只看排版。带重复键的对象可能在解析时覆盖早先的值，不适合用格式化来保留原始文本证据。</p></section>
<section id="errors"><h2>提示格式无效时，按这个顺序检查</h2><ol><li><strong>括号是否成对：</strong>对象用 <code>{ }</code>，数组用 <code>[ ]</code>，字符串的引号也需要闭合。</li><li><strong>键和值之间是否有冒号：</strong><code>"name": "demo"</code>。</li><li><strong>字段之间是否缺少逗号：</strong><code>{"a": 1 "b": 2}</code> 缺少逗号，应为 <code>{"a": 1, "b": 2}</code>。</li><li><strong>是否混入其他内容：</strong>去掉代码围栏、HTTP 响应头或日志前缀。HTML 错误页不能通过调整缩进变成 JSON。</li></ol><aside class="guide-note"><strong>解析成功，不等于输入符合严格 JSON</strong><p>本站使用 JSON5 解析器，可以接受注释、单引号和末尾逗号等写法；普通 JSON 接口未必接受。标准 JSON 要求字符串与对象键使用双引号，并且不含注释和末尾逗号。复制格式化后的结果后，仍需按接收系统要求校验。</p></aside></section>
<section id="faq"><h2>常见问题</h2>${faq([
      ["会把我输入的数据上传吗？", "格式化在浏览器中完成，不需要向服务器提交内容。但当前工具会把输入和选项保存在浏览器本地存储，刷新后可能恢复。共享设备用完请清空输入；需要彻底移除时，在浏览器中清除此站点数据。"],
      ["为什么排序后看起来与原文不同？", "排序会递归调整对象键名的顺序，数组内元素的先后不变。若你需要按接口返回顺序阅读，可以关闭“按键名排序”。这不是逐字保留原文的工具。"],
      ["大整数可以直接格式化吗？", "工具使用 JavaScript 数值解析。超过安全整数范围的数字可能发生精度变化，不能假定格式化后仍准确。订单号、账号和其他无需计算的标识，请在生成数据时使用带引号的字符串。"],
      ["注释为什么消失了？", "输入允许 JSON5，但输出通过 JSON 序列化生成，注释不会保留。只用于排版、需要完整保留注释的配置文件，应使用对应格式的编辑器。"],
    ])}</section><section class="guide-sources"><h2>参考与验证范围</h2><p>标准语法参考 <a href="https://www.rfc-editor.org/rfc/rfc8259">RFC 8259</a>；本站解析、排序与输出方式见<a href="https://github.com/bigzhihui/it-tools/blob/main/src/tools/json-viewer/json.models.ts">JSON 格式化实现</a>。本页以演示样例核对实时输出、无效输入提示和本地保存；大文件、所有 JSON5 扩展及业务规则不在本页验证范围。</p></section>`,
  },
].map((guide) => ({ ...guide, path: `/guides/${guide.slug}/`, date }));

export function guideCards() {
  return `<div class="guide-cards">${guides.map((g, i) => `<a class="guide-card" href="${g.path}"><span class="guide-category">${g.category}<span aria-hidden="true">0${i + 1}</span></span><h3>${g.shortTitle}</h3><p>${g.summary}</p><span class="guide-card-end">阅读指南 <span aria-hidden="true">→</span></span></a>`).join("")}</div>`;
}

export function guideHomeSection() {
  return `<section class="guide-home" aria-labelledby="guide-heading"><div class="section-head"><div><span class="eyebrow">使用指南</span><h2 id="guide-heading">需要一点说明？跟着样例试一遍。</h2><p>从选择格式到检查结果，把每一步讲清楚。</p></div><a class="section-link" href="/guides/">全部指南 →</a></div>${guideCards()}</section>`;
}

export function guideIndex() {
  return `<main id="main" class="wrap"><section class="guide-index"><nav class="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span aria-hidden="true">/</span><span aria-current="page">使用指南</span></nav><span class="eyebrow">一步一步，把事情做完</span><h1>使用指南</h1><p class="guide-intro">带着具体问题开始，用样例走完操作，最后检查输出。这里整理图片转换、PDF 处理和开发工具的使用方法。</p>${guideCards()}<aside class="guide-note"><strong>第一次使用，先试样例</strong><p>指南中的示例不含个人信息。各工具的数据处理方式不同，开始前可以先看<a href="/privacy/">隐私说明</a>，具体支持范围以对应工具页为准。</p></aside></section></main>`;
}

export function guideArticle(g) {
  return `<main id="main" class="wrap"><article class="article guide-article"><nav class="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span aria-hidden="true">/</span><a href="/guides/">使用指南</a><span aria-hidden="true">/</span><span aria-current="page">${g.category}</span></nav><span class="eyebrow">${g.category} · 使用指南</span><h1>${g.title}</h1><p class="guide-intro">${g.description}</p><p class="guide-meta">十三月维护者 · 更新于 <time datetime="${g.date}">${g.date}</time></p><a class="guide-cta" href="${g.toolUrl}">打开${g.tool} <span aria-hidden="true">↗</span></a><nav class="guide-toc" aria-label="本页目录"><strong>本页内容</strong>${g.contents.map(([id, title]) => `<a href="#${id}">${title}</a>`).join("")}</nav>${g.body}<section class="guide-next"><h2>继续使用</h2><a class="guide-cta" href="${g.toolUrl}">打开${g.tool} <span aria-hidden="true">↗</span></a><nav aria-label="其他指南">${guides.filter((other) => other.slug !== g.slug).map((other) => `<a href="${other.path}">${other.shortTitle} →</a>`).join("")}<a href="/guides/">查看全部使用指南 →</a></nav></section></article></main>`;
}
