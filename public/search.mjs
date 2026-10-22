export const normalize = (text) => String(text).normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");

export function score(entry, query) {
  const term = normalize(query);
  if (!term) return 1;
  const name = normalize(entry.name);
  const aliases = entry.aliases.map(normalize).filter(Boolean);
  const description = normalize(entry.description);
  let value = name === term ? 100 : aliases.includes(term) ? 90 : name.includes(term) ? 70 : term.length >= 4 && aliases.some((a) => a.includes(term)) ? 60 : description.includes(term) ? 20 : 0;
  if (!value) {
    const words = query.normalize("NFKC").toLowerCase().split(/\s+|→|\s*\bto\b\s*|转(?:换为|换成|成|为)?/u).map(normalize).filter(Boolean);
    if (words.length > 1 && words.every((word) => name.includes(word) || aliases.includes(word) || description.includes(word))) value = 35;
  }
  return value ? value - (entry.kind === "guide" || entry.kind === "directory" ? 8 : 0) : 0;
}

export function search(entries, query = "", { category = "all", site = "all" } = {}) {
  return entries.map((entry, index) => ({ entry, index, score: score(entry, query) }))
    .filter((item) => item.score > 0 && (category === "all" || item.entry.category === category) && (site === "all" || item.entry.site === site))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.entry);
}
