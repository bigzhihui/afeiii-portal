import { search } from "./search.mjs";

const input = document.querySelector("#tool-search");
const buttons = [...document.querySelectorAll("[data-filter]")];
const siteSelect = document.querySelector("#site-filter");
const list = document.querySelector("#tool-list");
const result = document.querySelector("#search-result");
const more = document.querySelector("#show-more");
const empty = document.querySelector("#search-empty");
const entries = JSON.parse(document.querySelector("#tool-catalog").textContent);
const nodes = new Map([...list.children].map((node) => [node.dataset.id, node]));
const pageSize = 12;
let category = "all";
let limit = pageSize;

function filter(reset = true) {
  if (reset) limit = pageSize;
  const matches = search(entries, input.value.trim(), { category, site: siteSelect.value });
  for (const node of nodes.values()) node.hidden = true;
  const fragment = document.createDocumentFragment();
  for (const entry of matches.slice(0, limit)) {
    const node = nodes.get(entry.id);
    node.hidden = false;
    fragment.append(node);
  }
  list.append(fragment);
  result.textContent = matches.length ? `共 ${matches.length} 项，显示 ${Math.min(limit, matches.length)} 项` : "没有匹配的工具";
  empty.hidden = matches.length > 0;
  more.hidden = matches.length <= limit;
  more.textContent = `再显示 ${Math.min(pageSize, matches.length - limit)} 项`;
}

input.addEventListener("input", () => filter());
siteSelect.addEventListener("change", () => filter());
for (const button of buttons) button.addEventListener("click", () => {
  category = button.dataset.filter;
  for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
  filter();
});
more.addEventListener("click", () => {
  const previousLimit = limit;
  limit += pageSize;
  filter(false);
  const matches = search(entries, input.value.trim(), { category, site: siteSelect.value });
  nodes.get(matches[previousLimit]?.id)?.focus();
});
function reset() {
  input.value = "";
  category = "all";
  siteSelect.value = "all";
  for (const item of buttons) item.setAttribute("aria-pressed", String(item.dataset.filter === "all"));
  filter();
  input.focus();
}
document.querySelector("#clear-search").addEventListener("click", reset);
document.querySelector("#clear-empty").addEventListener("click", reset);
input.addEventListener("keydown", (event) => {
  if (event.isComposing) return;
  if (event.key === "Enter") {
    event.preventDefault();
    const first = search(entries, input.value.trim(), { category, site: siteSelect.value })[0];
    if (first) { nodes.get(first.id).scrollIntoView({ block: "center" }); nodes.get(first.id).focus(); }
  }
  if (event.key === "Escape") { input.value = ""; filter(); }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
    event.preventDefault();
    input.focus();
  }
});
filter();
