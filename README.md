# 十三月主站

公开工具矩阵入口：<https://afeiii.com>。独立静态主站，连接开发工具、PDF、简历、网站检测和格式转换五个子站。

## 开发与发布

Node 24，无构建依赖：

```sh
npm run check
npm run build
```

`public/` 为静态资产；`scripts/build.mjs` 生成首页、关于、隐私、条款、404、robots、站点地图和版本标记。搜索与筛选仅在浏览器中执行；不提交搜索词，不需要账号。`dist/` 可重建，不纳入源码。

Oracle 仅提供静态资源：`/opt/apps/afeiii-portal/releases/<revision>`，`current` 为当前版本链接。`deploy/Caddyfile` 仅是本站片段，不能覆盖服务器完整 Caddy 配置。发布前核对现有配置、备份、校验并热加载；所有文件校验 SHA256 后切换目录。主域名与 www 需要正确的 DNS 记录；www 永久跳转到主域名。错误路径保持 HTTP 404。

## 访问统计

已使用所有者提供的公开 beacon 标识启用六站统一基础统计；主站不使用统计 Cookie。可通过公开的 `CF_WEB_ANALYTICS_TOKEN`（32 位十六进制 beacon 标识，**不是 Cloudflare API Token**）后构建。生成页面会加入官方脚本，隐私页同步说明。没有标识时保持关闭，不用占位值伪装已接入。

Cloudflare 官方设置入口：账户级 Web Analytics → Add a site → Manage site → JS snippet。主域名标识可覆盖同一主域名下的子域名；橙云站通过 no-transform 禁止自动重复注入。简历与转换站仅在公开说明页直接加载，并禁用 SPA 路由跟踪。统计仅反映收到的浏览器访问事件，不能当作真实用户数或转换成功量。不能采集文件名、文件内容、搜索输入或个人简历。

## 维护

各子站通过“十三月工具导航”互链。导航链接变化时同步五个仓库。现有格式转换与 PDF 站的限制在各站说明，不宣传为全格式转换。主站不加载第三方字体或图片。

本项目代码使用 MIT 许可证；各工具保留各自上游许可证与署名。反馈：support@afeiii.com。
