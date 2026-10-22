import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Read the existing registries without executing code from the tool sites.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFile(resolve(root, path), "utf8");
const unquote = (value) => {
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
  if (/^[>|]/.test(value)) throw Error("Multiline YAML scalar needs explicit support");
  return value.trim();
};
function toolTranslations(source) {
  const result = {};
  const section = source.slice(source.indexOf("\ntools:\n") + 1).replaceAll("\r", "");
  let key;
  for (const line of section.split("\n")) {
    const heading = line.match(/^  ([\w-]+):$/);
    if (heading) { key = heading[1]; result[key] = {}; }
    const field = line.match(/^    (title|description): (.+)$/);
    if (field && key) result[key][field[1]] = unquote(field[2]);
  }
  return result;
}
const aliases = {
  "json-prettify": ["格式化JSON", "JSON格式化", "JSON美化", "整理JSON", "json format"],
  "json-diff": ["JSON对比", "比较JSON", "JSON比较", "比较两份JSON", "json diff"],
  "merge-pdf": ["PDF合并", "合并PDF", "拼接PDF", "多份PDF合成一份"],
  "compress-pdf": ["PDF压缩", "压缩PDF", "缩小PDF", "减小PDF体积", "PDF瘦身"],
  "split-pdf": ["拆分PDF", "PDF拆分", "分割PDF"],
  "pdf-to-jpg": ["PDF转图片", "PDF转JPG", "PDF转照片"],
  "pdf-to-png": ["PDF转PNG"],
  "jpg-to-pdf": ["图片转PDF", "照片转PDF", "JPG转PDF"],
  "rotate-pdf": ["PDF旋转", "旋转PDF"],
  "text-diff": ["文本对比", "比较文本", "文字比较"],
  "date-converter": ["时间戳", "时间戳转换", "Unix时间"],
  "url-encoder": ["URL编码", "URL解码", "网址编码", "网址解码"],
  "base64-string-converter": ["Base64编码", "Base64解码"],
};
const entries = [];
function add(entry) {
  if (!entry.name || !entry.description) throw Error(`Missing text: ${entry.id}`);
  entry.aliases = [...new Set([...(entry.aliases ?? []), ...(aliases[entry.id.split(":")[1]] ?? [])])];
  entries.push(entry);
}

const registry = await read("tools/src/tools/index.ts");
const zh = toolTranslations((await read("tools/locales/zh.yml")).replaceAll("\r", ""));
const en = toolTranslations((await read("tools/locales/en.yml")).replaceAll("\r", ""));
const imports = new Map([...registry.matchAll(/import \{ tool as (\w+) \} from '\.\/([^']+)';/g)].map((m) => [m[1], m[2]]));
const registered = [...registry.matchAll(/components:\s*\[([^\]]+)\]/g)].flatMap((m) => m[1].split(",").map((s) => s.trim()).filter(Boolean));
for (const variable of new Set(registered)) {
  const folder = imports.get(variable);
  if (!folder) throw Error(`Unknown registered tool: ${variable}`);
  const source = await read(`tools/src/tools/${folder}/index.ts`);
  const path = source.match(/\bpath:\s*'([^']+)'/)?.[1];
  const key = source.match(/name:\s*translate\('tools\.([^']+)\.title'\)/)?.[1] ?? folder;
  if (!path || !key || !zh[key]?.title || !zh[key]?.description) throw Error(`Unparsed tool: ${folder}`);
  const keywords = [...(source.match(/keywords:\s*\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/'([^']+)'/g)].map((m) => m[1]);
  add({ id: `tools:${path.slice(1)}`, site: "tools", category: path.includes("pdf") ? "documents" : /qr-code|camera|svg-placeholder/.test(path) ? "media" : "development", name: zh[key].title, description: zh[key].description, url: `https://tools.afeiii.com${path}`, aliases: [en[key]?.title ?? "", path.slice(1).replaceAll("-", " "), ...keywords], kind: path === "/pdf-translate" ? "external" : path === "/more-pdf-tools" ? "directory" : "tool" });
}

const config = JSON.parse(await read("bentopdf/cloudflare/pages-config.json"));
const excluded = new Set(`${config.DISABLE_TOOLS},${config.EXCLUDE_PAGES}`.split(","));
const pdfZh = JSON.parse(await read("bentopdf/public/locales/zh/tools.json"));
const pdfSource = await read("bentopdf/src/js/config/tools.ts");
const pdfSlugs = [...new Set([...pdfSource.matchAll(/href:\s*import\.meta\.env\.BASE_URL\s*\+\s*'([^']+)\.html'/g)].map((m) => m[1]))].filter((slug) => !excluded.has(slug));
for (const slug of pdfSlugs) {
  const html = await read(`bentopdf/src/pages/${slug}.html`);
  const key = html.match(/data-i18n="tools:([\w]+)\.name"/)?.[1] ?? slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (!key || !pdfZh[key]?.name || !pdfZh[key]?.subtitle) throw Error(`Untranslated PDF tool: ${slug}`);
  const english = pdfSource.match(new RegExp(`href:[^\\n]+?'${slug}\\.html',[\\s\\S]*?name:\\s*'([^']+)'`))?.[1] ?? slug.replaceAll("-", " ");
  // The PDF page generator uses the camel-case slug to decide whether the
  // localized URL is self-canonical. Some UI keys differ from that slug.
  const localized = Boolean(pdfZh[slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]);
  add({ id: `pdf:${slug}`, site: "pdf", category: "documents", name: pdfZh[key].name, description: pdfZh[key].subtitle, url: `https://pdf.afeiii.com/${localized ? "zh/" : ""}${slug}`, aliases: [english, slug.replaceAll("-", " ")], kind: "tool" });
}

for (const [id, name, files, words, description] of [
  ["image", "图片格式转换", ["magick/magick.svelte.ts", "magick/magick-automated.ts"], ["图片转换", "照片格式", "PNG转WebP", "WebP转PNG", "JPG转PNG", "HEIC", "image converter"], "转换图片格式。进入后上传图片并选择目标格式；部分格式仅支持输入，输出能力以工具内列表为准。"],
  ["audio", "音频格式转换", ["ffmpeg/ffmpeg.svelte.ts"], ["音频转换", "音乐格式", "WAV转MP3", "MP3转WAV", "audio converter"], "转换音频格式。进入后选择文件和目标格式；文件在浏览器中处理。"],
  ["video", "视频格式转换", ["mediabunny/mediabunny.svelte.ts"], ["视频转换", "MP4转WebM", "MP4转MKV", "MKV转MP4", "video converter"], "转换受支持的视频格式。进入后选择文件和目标格式；编码兼容性受浏览器与设备限制。"],
  ["document", "文档格式转换", ["pandoc/pandoc.svelte.ts"], ["文档转换", "Markdown转DOCX", "DOCX转Markdown", "Markdown转HTML", "EPUB", "document converter"], "转换 Markdown、DOCX、HTML 等文档。进入后选择文件和目标格式；JSON 仅指 Pandoc 文档结构，格式方向以工具内列表为准。"],
]) {
  const sources = await Promise.all(files.map((f) => read(`vert/src/lib/converters/${f}`)));
  const formats = sources.flatMap((s) => [...s.replace(/^\s*\/\/.*$/gm, "").matchAll(/new FormatInfo\("([^"]+)"/g)].map((m) => m[1]));
  if (id === "video") formats.push(...[...sources[0].matchAll(/private formats: string\[\] = \[([\s\S]*?)\]/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((f) => f[1])));
  add({ id: `convert:${id}`, site: "convert", category: id === "document" ? "documents" : "media", name, description, url: "https://convert.afeiii.com/", aliases: [...words, ...formats], kind: "shared" });
}
add({ id: "resume:editor", site: "resume", category: "career", name: "在线简历制作与 PDF 导出", description: "从模板开始编辑、保存并导出简历；创建和管理简历需要登录账号。", url: "https://resume.afeiii.com/", aliases: ["简历", "简历模板", "制作简历", "简历编辑", "简历下载", "简历导出", "CV", "resume"], kind: "account" });
add({ id: "check:website", site: "check", category: "development", name: "网站综合检测", description: "输入公开网址，检查 DNS、SSL 证书、HTTP、SEO、安全头和网站配置。", url: "https://check.afeiii.com/", aliases: ["网站检测", "域名检测", "证书查询", "SSL检查", "DNS查询", "HTTP响应头", "robots", "robots.txt", "SEO", "HSTS", "CAA", "sitemap", "安全头", "重定向", "邮件配置", "IP查询", "网站性能", "website check"], kind: "shared" });

const checkConfig = JSON.parse(await read("web-check/site-config.json"));
const checkText = await read("web-check/src/data/afeiii.ts");
for (const slug of checkConfig.checks) {
  const match = checkText.match(new RegExp(`(?:'${slug}'|${slug}): \\['([^']+)', '([^']+)'\\]`));
  if (!match) throw Error(`Missing enabled check: ${slug}`);
  add({ id: `check:${slug}`, site: "check", category: "development", name: match[1], description: match[2], url: `https://check.afeiii.com/${slug}`, aliases: [slug.replaceAll("-", " "), `${match[1]}检测`, `${match[1]}查询`], kind: "tool" });
}
const checkCategories = await read("web-check/src/data/categories.ts");
for (const match of checkCategories.matchAll(/^  (\w+): \['([^']+)', '([^']+)', '([^']+)'\]/gm)) {
  add({ id: `check:${match[1]}`, site: "check", category: "development", name: match[3], description: match[4], url: `https://check.afeiii.com/${match[1]}`, aliases: [match[2], match[1]], kind: "tool" });
}
const { guides } = await import("./guides.mjs");
for (const guide of guides) {
  add({ id: `guide:${guide.slug}`, site: "portal", category: guide.slug.includes("pdf") ? "documents" : guide.slug.includes("image") ? "media" : guide.slug.includes("resume") ? "career" : "development", name: guide.title, description: guide.description, url: `https://afeiii.com${guide.path}`, aliases: ["教程", "使用指南"], kind: "guide" });
}
const catalog = { version: 1, coverage: { tools: new Set(registered).size, pdf: pdfSlugs.length, convert: 4, resume: 1, check: entries.filter((e) => e.site === "check").length, guides: guides.length }, excludedPdf: [...excluded].sort(), entries };
const output = `${JSON.stringify(catalog, null, 2)}\n`;
const target = resolve(root, "portal/data/tool-catalog.json");
if (process.argv.includes("--check")) {
  if (await readFile(target, "utf8") !== output) throw Error("Catalog differs from source registries. Run npm run catalog:sync.");
} else {
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output);
}
console.log(`Catalog: ${entries.length} entries. ${JSON.stringify(catalog.coverage)}`);
