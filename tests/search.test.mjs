import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { search, normalize } from "../public/search.mjs";
import { validateCatalog, renderCatalog } from "../scripts/catalog.mjs";

const catalog = JSON.parse(await readFile(new URL("../data/tool-catalog.json", import.meta.url), "utf8"));
const entries = catalog.entries;
test("Chinese aliases, English names and full-width inputs find the actual tool first", () => {
  for (const query of ["PDF压缩", "缩小PDF", "Ｃｏｍｐｒｅｓｓ ＰＤＦ", "compress pdf"]) assert.equal(search(entries, query)[0].id, "pdf:compress-pdf");
  for (const query of ["JSON对比", "比较JSON", "json diff"]) assert.equal(search(entries, query)[0].id, "tools:json-diff");
  assert.equal(search(entries, "格式化JSON")[0].id, "tools:json-prettify");
  assert.equal(normalize(" ＪＳＯＮ - Diff "), "jsondiff");
});
test("conversion pair requires both formats and shared entry remains explicit", () => {
  for (const query of ["AVIF转WebP", "PNG to WebP"]) assert.ok(search(entries, query).some((e) => e.id === "convert:image"));
  assert.ok(!search(entries, "PDF转PNG").some((e) => e.site === "convert"));
  assert.ok(!search(entries, "XLS转PDF").some((e) => e.site === "convert"));
  assert.equal(search(entries, "图片转换")[0].kind, "shared");
  assert.equal(entries.find((e) => e.id === "resume:editor").kind, "account");
  assert.equal(entries.find((e) => e.id === "tools:pdf-translate").kind, "external");
});
test("empty query covers all records and combined filters never leak other sites", () => {
  assert.equal(search(entries).length, entries.length);
  const results = search(entries, "PDF", { category: "documents", site: "pdf" });
  assert.ok(results.length > 50);
  assert.ok(results.every((e) => e.site === "pdf" && e.category === "documents"));
  assert.deepEqual(search(entries, "不存在的功能xyz"), []);
  assert.deepEqual(search(entries, "简历", { site: "pdf" }), []);
});
test("catalog includes registered routes, enabled checks and all public guides", () => {
  validateCatalog(catalog);
  for (const id of ["tools:xml-to-json", "pdf:pdf-workflow", "pdf:pdf-multi-tool", "check:dns", "check:ssl", "check:seo", "convert:video"]) assert.ok(entries.some((e) => e.id === id), id);
  assert.equal(entries.filter((e) => e.kind === "guide").length, 5);
  assert.equal(entries.find((e) => e.id === "pdf:bookmark").url, "https://pdf.afeiii.com/bookmark");
  assert.equal(entries.find((e) => e.id === "pdf:compress-pdf").url, "https://pdf.afeiii.com/zh/compress-pdf");
  for (const slug of catalog.excludedPdf) assert.ok(!entries.some((e) => e.site === "pdf" && e.id === `pdf:${slug}`));
});
test("build rejects duplicate identifiers, invalid destinations and missing coverage", () => {
  const clone = () => structuredClone(catalog);
  const duplicate = clone(); duplicate.entries.push(duplicate.entries[0]);
  assert.throws(() => validateCatalog(duplicate), /Duplicate/);
  const invalid = clone(); invalid.entries[0].url = "https://example.org/tool";
  assert.throws(() => validateCatalog(invalid), /destination/);
  const incomplete = clone(); incomplete.entries.pop();
  assert.throws(() => validateCatalog(incomplete), /coverage/);
});
test("static results are available without JavaScript and text cannot inject markup", () => {
  const clone = structuredClone(catalog);
  clone.entries[0].name = '<img src=x onerror="alert(1)">';
  const html = renderCatalog(clone);
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes('<img src=x'));
  assert.equal([...html.matchAll(/class="catalog-item"/g)].length, entries.length);
  assert.ok(html.includes("\\u003cimg"));
});
