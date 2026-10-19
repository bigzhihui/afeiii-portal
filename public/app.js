const input = document.querySelector('#tool-search');
const buttons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-tool]')];
const result = document.querySelector('#search-result');
let category = 'all';
function filter() {
  const term = input.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const card of cards) {
    card.hidden = !(category === 'all' || card.dataset.category === category) || !card.textContent.toLocaleLowerCase().includes(term);
    if (!card.hidden) count++;
  }
  result.textContent = count ? `找到 ${count} 个入口` : '暂时没有匹配的工具。试试 PDF、图片、JSON 或简历。';
}
input?.addEventListener('input', filter);
for (const button of buttons) button.addEventListener('click', () => {
  category = button.dataset.filter;
  for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
  filter();
});
document.querySelector('#clear-search')?.addEventListener('click', () => {
  input.value = '';
  category = 'all';
  for (const item of buttons) item.setAttribute('aria-pressed', String(item.dataset.filter === 'all'));
  filter(); input.focus();
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault(); input?.focus();
  }
});
