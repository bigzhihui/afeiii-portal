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
    ])}</section><section class="guide-sources"><h2>验证说明</h2><p>本页使用本站提供的两份单页演示 PDF，实测文件拖动、页码范围与 Page Mode 排列，下载后逐页渲染核对顺序；另验证 Photon 均衡压缩的下载结果。引擎与算法说明对应<a href="https://github.com/bigzhihui/bentopdf/blob/main/src/js/logic/compress-pdf-page.ts">本站压缩实现</a>。Condense 与外部引擎配置未在本页实测；验证也不覆盖所有字体、加密文件、表单与数字签名。</p></section>`,
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
    ])}</section><section class="guide-sources"><h2>参考与验证范围</h2><p>标准语法参考 <a href="https://www.rfc-editor.org/rfc/rfc8259">RFC 8259</a>；本站解析、排序与输出方式见<a href="https://github.com/bigzhihui/it-tools/blob/main/src/tools/json-viewer/json.models.ts">JSON 格式化实现</a>。本页以演示样例核对实时输出、复制、键名排序、数组顺序、无效输入提示和本地保存；大文件、所有 JSON5 扩展及业务规则不在本页验证范围。</p></section>`,
  },
  {
    slug: "resume-create-export",
    title: "在线简历怎么制作并导出 PDF？从建档到分享",
    shortTitle: "做好简历，检查后再投递",
    category: "求职简历",
    description: "了解十三月简历的账号保存、创建文档、内容编辑、模板排版、PDF 导出与分享设置，按清单检查中文、分页和联系方式。",
    summary: "从账号和第一份简历开始，整理经历、调整版式，再检查下载与分享设置。",
    tool: "十三月简历",
    toolUrl: "https://resume.afeiii.com/",
    contents: [["start", "创建第一份简历"], ["write", "填写与排版"], ["export", "导出与分享"], ["faq", "常见问题"]],
    body: `
<section id="start"><h2>先创建一份可继续编辑的简历</h2><p>准备好目标岗位、联系方式、教育与项目经历。第一次使用可以先用虚构内容熟悉编辑器，确认保存和导出正常后，再整理正式版本。</p><ol class="guide-steps"><li><strong>进入简历站。</strong>打开<a href="https://resume.afeiii.com/">十三月简历</a>，点击“建立你的简历”。尚未登录时会进入登录页面；已有账号可直接登录，新用户点击“现在就创建一个”并填写注册资料。注册后会看到邮箱验证提示，建议按邮件链接确认邮箱；该页也提供“继续”入口。</li><li><strong>创建文档。</strong>首次进入文档页，可以直接点击“开始空白”。也可点击侧栏的“新的”，在“新文件”对话框中选择“开始空白”，随即进入编辑器。已有材料也可查看导入选项；导入后仍需逐项校对。</li><li><strong>命名并区分用途。</strong>点击编辑器顶部的文档名，选择“重命名...”；在弹窗的“姓名”字段填写文档名称，例如“前端开发—通用版”，点击“保存更改”。这里修改的是文档名称；正文中的真实姓名在“撰写”区域单独填写。针对不同职位修改时，保留一份通用版本。</li><li><strong>确认保存状态。</strong>编辑器会显示保存进度。准备离开页面前，确认状态已保存；若显示离线或未保存，先恢复网络、重试并核对内容。</li></ol>${figure("resume-editor", "十三月简历实际编辑器，虚构样例已命名并保存，显示撰写、设计和下载入口", "使用虚构资料的实际编辑器。图中的姓名与邮箱仅供演示；文档名、保存状态和下载入口位于顶部。")}<aside class="guide-note"><strong>简历保存在哪里？</strong><p>账号和保存的简历会存储在本站服务器，方便登录后继续编辑。请先了解<a href="https://resume.afeiii.com/privacy">简历站隐私说明</a>，根据实际用途填写必要信息。</p></aside></section>
<section id="write"><h2>先把内容写清楚，再调整版式</h2><p>可以从联系方式、教育、工作或项目经历、技能这几部分开始。学生也可以用课程项目、实习和社团任务描述自己实际做过的工作。</p><h3>用具体动作和可核实的结果描述经历</h3><p>以下是虚构的写法示例，只演示表达结构：</p><pre><code>项目：课程资料整理工具
职责：设计文件分类与搜索页面，编写使用说明
做法：将资料按课程与日期整理，并邀请 5 位同学试用
结果：根据反馈补充空结果提示和操作说明</code></pre><p>把“做了什么、如何完成、带来什么结果”说清楚。数字和项目事实应来自自己的经历；没有可靠统计时，用具体交付物描述结果。</p><ol><li>先在“撰写”区域补齐主要经历，统一日期和职位写法。</li><li>到“设计”区域选择模板，调整字体、颜色、字号和间距。</li><li>查看完整页面，处理标题与内容分离、末页只剩少量文字等分页问题。</li><li>再次检查姓名、邮箱、电话、作品链接及目标岗位，移除演示占位内容。</li></ol><p>优先保证正文可读。模板适配和自动检查可以辅助排版，接收方的要求仍需逐项确认。</p></section>
<section id="export"><h2>导出 PDF 后，再检查一次</h2><p>编辑器提供“下载为 PDF 文档”入口；也可打开“分享和导出”的下载区域，选择 PDF。手机上的部分操作会显示为图标，可打开相应菜单查看。</p><ul><li><strong>打开实际下载文件：</strong>不要只看编辑预览，确认下载的 PDF 能正常打开。</li><li><strong>检查中文与分页：</strong>确认没有方块、问号、文字截断、意外空白页或错位。</li><li><strong>试着选择文字：</strong>如果接收方需要文本解析，确认姓名和正文能被选择、复制，检查阅读顺序。</li><li><strong>核对投递信息：</strong>检查联系方式、文件名和职位版本。对方要求 Word 等其他格式时，按其要求选择并单独检查排版。</li></ul><h3>下载文件与公开链接分别设置</h3><p>如果通过邮箱或招聘平台发送文件，可以保持在线简历私密。需要链接分享时，再到“分享”区域开启公共链接，按需要设置密码和访客下载权限，并用未登录窗口验证访问效果。</p>${figure("resume-download", "十三月简历实际分享和导出窗口，下载区域提供 PDF 等格式", "实际编辑器的“分享和导出”窗口。下载文件与开启公共链接分别设置，请按接收方要求检查输出。")}<p>关闭在线链接后，已经被接收方下载的文件仍由对方持有。分享前请检查正文、备注和链接中是否包含不打算公开的信息。</p></section>
<section id="faq"><h2>常见问题</h2>${faq([
      ["一定需要账号才能制作和保存简历吗？", "创建、保存和继续编辑自己的简历需要登录。首页的功能展示可以直接查看；若只是查看公开工具的说明，无需创建账号。"],
      ["编辑后可以马上关闭页面吗？", "先看保存状态。显示已保存后再离开；离线或保存失败时，恢复网络并重试，必要时保留一份自己的内容备份。不同设备同步以服务器成功保存的版本为准。"],
      ["导出的 PDF 中文异常或分页不合适怎么办？", "先尝试能覆盖所需中文的字体，并适当调整字号、间距和页面布局；等待字体资源加载后重新导出。打开新文件检查，避免继续投递旧版本。仍有问题可提供浏览器、操作步骤和脱敏截图反馈。"],
      ["需要把简历设成公开才能下载 PDF 吗？", "自己的下载操作与链接分享是独立用途。可以保持私密并下载文件；需要给别人访问在线链接时，再确认公共链接、密码和下载权限的设置。"],
    ])}</section><section class="guide-sources"><h2>继续了解</h2><p>账号、云端保存与公开分享的数据处理方式见<a href="https://resume.afeiii.com/privacy">简历站隐私说明</a>。本页依据实际界面核对；在与正式站使用相同镜像的独立实例中，用虚构账号实测创建、重命名、编辑保存、刷新恢复、PDF 下载与链接分享。截图来自该演示实例；没有使用真实用户简历。这不覆盖全部模板、导入格式或设备。</p></section>`,
  },
  {
    slug: "website-check-report",
    title: "网站检测报告怎么看？DNS、SSL、HTTP 与配置提醒",
    shortTitle: "看懂网站检测，找到排查顺序",
    category: "网站检测",
    description: "用自有工具站演示公开网站检测，理解检测成功、配置提醒和跳过项，再按 DNS、证书、HTTP 与抓取规则逐步核对。",
    summary: "从一个公开网址开始，读懂结果与配置提醒，安排下一步排查和复测。",
    tool: "十三月网站检测",
    toolUrl: "https://check.afeiii.com/",
    contents: [["start", "开始检测"], ["read", "读懂结果"], ["order", "安排排查顺序"], ["faq", "常见问题"]],
    body: `
<section id="start"><h2>从一个你管理的公开网址开始</h2><p>打开<a href="https://check.afeiii.com/">十三月网站检测</a>，输入域名或完整 HTTP/HTTPS 网址，点击“开始检测”。例如，本页用自有工具站 <code>https://tools.afeiii.com/</code> 演示。</p><ol class="guide-steps"><li><strong>核对地址。</strong>确认拼写、子域名和协议正确。主站、www 和工具子域名可能有不同的记录与页面。</li><li><strong>等待结果。</strong>各项检测会陆续显示。通过“查看检测进度”了解成功、失败或跳过的项目。</li><li><strong>查看配置建议。</strong>展开“待核对项”“提醒”“参考信息”和“已通过”，再结合下方具体结果阅读。</li><li><strong>保存和复测。</strong>需要留档时点击“下载 JSON”；修改配置后，可单项重试或点击“重新检测当前网站”。</li></ol><aside class="guide-note"><strong>检测从哪里发出？</strong><p>网址会发送到检测服务器，由服务器查询 DNS、证书并访问公开网页。请使用你有权检测的公开地址，输入时避免带上登录令牌或其他秘密参数。内网和部分保留地址不在支持范围内。</p></aside></section>
<section id="read"><h2>先区分进度状态与配置建议</h2><p>“检测成功”表示该项成功取得了数据；配置是否合适，需要继续查看建议与结果卡片。例如，成功取得 HTTP 响应头后，仍可能发现某个策略头尚未设置。</p><div class="guide-table"><table><caption>报告中几类常见提示</caption><thead><tr><th scope="col">提示</th><th scope="col">说明</th><th scope="col">接下来怎么做</th></tr></thead><tbody><tr><th scope="row">待核对项</th><td>值得进一步确认的配置或响应</td><td>打开对应卡片，结合实际业务检查</td></tr><tr><th scope="row">提醒</th><td>可能有优化空间，或需要按用途选择</td><td>确认适用条件，评估修改影响</td></tr><tr><th scope="row">参考信息</th><td>供了解公开配置与服务特征</td><td>按需记录，结合其他信息判断</td></tr><tr><th scope="row">已通过</th><td>符合当前检测规则的项目</td><td>保留配置，变更后再复测</td></tr><tr><th scope="row">跳过 / 失败</th><td>没有完成该项，或没有取得可用数据</td><td>查看具体原因，再决定是否重试</td></tr></tbody></table></div>${figure("website-report", "十三月网站检测对自有工具站展示检测进度、配置建议及结果卡片", "实际报告示例。检测时间、网络位置、缓存和网站配置会影响结果，数值以你本次查询为准。")}<p>缺少某个安全响应头通常需要按页面依赖和业务用途评估。以 Content-Security-Policy 为例，它控制页面能加载哪些资源；配置前要了解脚本、字体等来源，并在变更后检查页面功能。相关含义可参考 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy">MDN 的 CSP 说明</a>。</p></section>
<section id="order"><h2>按访问链路安排排查顺序</h2><ol class="guide-steps"><li><strong>先看 DNS。</strong>出现找不到域名或 <code>ENOTFOUND</code> 时，先核对输入拼写、域名状态与解析记录，再继续看网页内容。CDN 或代理的公网地址可能与源站 IP 不同。</li><li><strong>再看 SSL 证书。</strong>核对是否受信任、证书覆盖的域名和到期日期。子域名不匹配、证书过期等问题，需要在对应服务或代理层处理。</li><li><strong>查看 HTTP 状态和跳转。</strong>200 表示本次请求得到成功响应，还要查看是否是预期页面；HTTP 转 HTTPS、www 转主域名可能是有意设置的跳转。</li><li><strong>查看标题、canonical、robots 与 sitemap。</strong>确认网页描述和规范网址符合用途，抓取规则允许访问需要公开的页面，站点地图使用实际存在的地址。</li><li><strong>最后评估安全头和其他建议。</strong>按实际需要逐项修改、测试和复测。HSTS 的子域名或预加载选项等设置，需先确认整个相关范围都支持 HTTPS。</li></ol><p>允许抓取、能读取 sitemap，只说明提供了访问和发现入口。搜索引擎的实际收录与展示还需要在相应站长平台查看。<a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro?hl=zh-cn">Google 的 robots.txt 说明</a>也区分了抓取控制与搜索结果处理。</p></section>
<section id="faq"><h2>常见问题</h2>${faq([
      ["我的浏览器能打开，为什么检测端失败？", "你的设备与检测服务器可能处在不同网络位置。DNS、访问限制、超时或站点防护都可能影响结果。记录网址、时间和失败项目，再结合服务日志或其他网络位置检查。"],
      ["提醒很多，是否说明网站已经被入侵？", "报告基于公开响应和规则生成配置建议。确认入侵需要其他证据；本工具也不覆盖源码审计、登录后的权限或全部漏洞检查。先看每条说明，再按实际情况排查。"],
      ["为什么修改后看到的记录还没变化？", "DNS、CDN、服务器和浏览器都可能有缓存。先确认配置保存到正确的域名与环境，再等待对应缓存更新并重新检测。保留前后结果，便于对照。"],
      ["下载 JSON、在线查看和第三方工具有什么区别？", "下载 JSON 是把本次检测数据保存到本地；在线查看使用第三方 JSON Hero。下方工具卡片也会打开其他网站，部分会带入当前域名。选择外部服务前，请了解它的数据处理方式。"],
    ])}</section><section class="guide-sources"><h2>继续排查</h2><p>可查看<a href="https://check.afeiii.com/faq">检测站使用说明</a>，或在自己的环境修改后再次检测。本页以本站工具域名实测网址输入、检测进度、建议展开、JSON 下载、单项重试和重新检测；第三方工具与所有网络故障类型未逐项验证。记录本次目标、检测时间、改动与复测结果，更容易确认问题发生在哪一步。</p></section>`,
  },
].map((guide) => ({ ...guide, path: `/guides/${guide.slug}/`, date }));

export function guideCards(level = 3) {
  return `<div class="guide-cards">${guides.map((g, i) => `<a class="guide-card" href="${g.path}"><span class="guide-category">${g.category}<span aria-hidden="true">0${i + 1}</span></span><h${level}>${g.shortTitle}</h${level}><p>${g.summary}</p><span class="guide-card-end">阅读指南 <span aria-hidden="true">→</span></span></a>`).join("")}</div>`;
}

export function guideHomeSection() {
  return `<section class="guide-home" aria-labelledby="guide-heading"><div class="section-head"><div><span class="eyebrow">使用指南</span><h2 id="guide-heading">需要一点说明？跟着样例试一遍。</h2><p>从选择格式到检查结果，把每一步讲清楚。</p></div><a class="section-link" href="/guides/">全部指南 →</a></div>${guideCards()}</section>`;
}

export function guideIndex() {
  return `<main id="main" class="wrap"><section class="guide-index"><nav class="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span aria-hidden="true">/</span><span aria-current="page">使用指南</span></nav><span class="eyebrow">一步一步，把事情做完</span><h1>使用指南</h1><p class="guide-intro">带着具体问题开始，用样例走完操作，最后检查输出。这里整理图片转换、PDF 处理、开发工具、简历制作和网站检测的使用方法。</p>${guideCards(2)}<aside class="guide-note"><strong>第一次使用，先试样例</strong><p>指南中的示例不含个人信息。各工具的数据处理方式不同，开始前可以先看<a href="/privacy/">隐私说明</a>，具体支持范围以对应工具页为准。</p></aside></section></main>`;
}

export function guideArticle(g) {
  return `<main id="main" class="wrap"><article class="article guide-article"><nav class="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span aria-hidden="true">/</span><a href="/guides/">使用指南</a><span aria-hidden="true">/</span><span aria-current="page">${g.category}</span></nav><span class="eyebrow">${g.category} · 使用指南</span><h1>${g.title}</h1><p class="guide-intro">${g.description}</p><p class="guide-meta">十三月维护者 · 更新于 <time datetime="${g.date}">${g.date}</time></p><a class="guide-cta" href="${g.toolUrl}">打开${g.tool} <span aria-hidden="true">↗</span></a><nav class="guide-toc" aria-label="本页目录"><strong>本页内容</strong>${g.contents.map(([id, title]) => `<a href="#${id}">${title}</a>`).join("")}</nav>${g.body}<section class="guide-next"><h2>继续使用</h2><a class="guide-cta" href="${g.toolUrl}">打开${g.tool} <span aria-hidden="true">↗</span></a><nav aria-label="其他指南">${guides.filter((other) => other.slug !== g.slug).map((other) => `<a href="${other.path}">${other.shortTitle} →</a>`).join("")}<a href="/guides/">查看全部使用指南 →</a></nav></section></article></main>`;
}
