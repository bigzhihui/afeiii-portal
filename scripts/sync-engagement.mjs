import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = resolve(root, '..');
const source = resolve(root, 'public/engagement');
const data = JSON.parse(await readFile(resolve(root, 'data/tool-catalog.json'), 'utf8'));
const catalog = Object.fromEntries(['portal', 'tools', 'pdf', 'convert', 'resume', 'check'].map(site => [site, { home: '首页' }]));
for (const item of data.entries) {
  const url = new URL(item.url);
  const slug = url.pathname.replace(/^\//, '').replace(/\/$/, '').split('/').at(-1);
  if (catalog[item.site] && slug) catalog[item.site][slug] = item.name;
}
catalog.convert.convert = '文件转换';
catalog.resume.export = '简历导出';
catalog.check.scan = '网站检测';
await writeFile(resolve(source, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
for (const [repo, folder, hook] of [
  ['tools', 'public', 'src/afeiii-usage.ts'],
  ['bentopdf', 'public', 'src/js/afeiii-usage.ts'],
  ['vert', 'static', 'src/lib/afeiii-usage.ts'],
  ['web-check', 'public', 'src/client/afeiii-usage.ts'],
  ['reactive-resume', 'apps/web/public', 'apps/web/src/lib/afeiii-usage.ts'],
]) {
  const target = resolve(workspace, repo, folder, 'engagement');
  await mkdir(target, { recursive: true });
  await cp(source, target, { recursive: true });
  await cp(resolve(root, 'engagement/usage.ts'), resolve(workspace, repo, hook));
}
console.log('Six-site feedback assets, strict registry and operation helpers synchronized.');
