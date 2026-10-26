# 十三月主站

公开工具矩阵入口：<https://afeiii.com>。独立静态主站，连接开发工具、PDF、简历、网站检测和格式转换五个子站。

## 开发与发布

Node 24，无构建依赖：

```sh
npm run check
npm run build
```

`public/` 为静态资产；`scripts/build.mjs` 生成首页、关于、隐私、条款、使用指南目录和五篇指南、404、robots、站点地图和版本标记。搜索与筛选仅在浏览器中执行；不提交搜索词，不需要账号。`dist/` 可重建，不纳入源码。

Oracle 仅提供静态资源：`/opt/apps/afeiii-portal/releases/<revision>`，`current` 为当前版本链接。`deploy/Caddyfile` 仅是本站片段，不能覆盖服务器完整 Caddy 配置。发布前核对现有配置、备份、校验并热加载；所有文件校验 SHA256 后切换目录。主域名与 www 需要正确的 DNS 记录；www 永久跳转到主域名。错误路径保持 HTTP 404。

## 访问统计

### 主动反馈与匿名操作统计

六站使用本地托管的 Feedback Fin 适配版（Apache-2.0，源码与许可在 `public/engagement/`）。`node scripts/sync-engagement.mjs` 从公开工具目录生成白名单，并同步共享资源与事件助手；随后按各仓库规范格式化、检查和发布。禁止接入第三方录屏或采集输入、文件名、检测目标、账户、简历内容及私有网址。同步不会自动发布。

反馈发送至 `https://afeiii.com/engagement/v1/feedback`；仅用户主动填写的类型、描述、可选邮箱与固定工具标识进入队列。只有本地持久化并返回匹配编号后才显示收到；HTTP 失败保留内容，原内容重试复用同一编号。邮件独立发送至现有所有者通知邮箱，SMTP 接收不代表收件箱投递。浏览器不自动收集设备或错误堆栈。

匿名操作统计默认关闭，在反馈窗口自愿开启，可随时关闭；遵循 DNT/GPC。只接收白名单工具标识与固定阶段，不使用用户ID、Cookie或会话回放。偏好仅在当前站点浏览器中保存一个开关，不跨站同步。随机编号仅对应单次操作，服务器保留24小时去重摘要，长期只存按北京时间汇总的计数。最多保留90天，后台展示含当天的近28日；计数不是人数或文件保存成功量。

首批结果钩子覆盖工具箱共用复制；PDF 合并、压缩与共用下载；VERT 逐次转换及下载；简历文件生成和快捷下载；Web-Check 单项检测任务。入口与结果分开，不以页面访问或点击代替处理成功；未接入、取消、跳过和未收到数据不补零，不据此计算全站成功率。

接收服务 `engagement/server.py` 使用独立用户、SQLite与回环端口18767；运行单元为 `engagement/afeiii-engagement.service`。安装时将白名单固定复制为 `/opt/apps/afeiii-engagement/catalog.json`，状态目录 `/var/lib/afeiii-engagement` 为服务所有、`afeiii-search`组只读，数据库0600，私有报告0640。邮件配置独立放 `/etc/afeiii-engagement/mail.json`，0600，仅复用原发件账户与已确认收件地址，不能公开原搜索授权。保留90天的业务数据不含网络日志；反向代理不得记录提交正文。

只在主站 Caddy 导入 `engagement/engagement.caddy`；服务不公开管理接口。原认证后台通过 `--engagement-state /var/lib/afeiii-engagement` 读取报告，仍禁止写入。其他站仅为 `connect-src` 添加精确 `https://afeiii.com`；不放宽脚本来源、不改账户认证。上线前先备份现有 Caddy，校验完整配置，逐站验证反馈与数据边界后热加载；停止可停用接收服务并回退网站版本，不动业务数据库。

验证：`python -B -m unittest discover -s engagement -p test_server.py -q` 覆盖持久化、幂等、并发去重、字段拒绝、限流、保留期及SMTP失败；`node engagement/browser-check.cjs` 使用真实Chrome但隔离页面/模拟接口，验证六域名1440/375组件交互、失败重试和隐私边界，不能代替各应用实际功能与正式站验收。

已使用所有者提供的公开 beacon 标识启用六站统一基础统计；主站不使用统计 Cookie。可通过公开的 `CF_WEB_ANALYTICS_TOKEN`（32 位十六进制 beacon 标识，**不是 Cloudflare API Token**）覆盖默认标识后构建。生成页面会加入官方脚本，隐私页同步说明。没有标识时保持关闭，不用占位值伪装已接入。

Cloudflare 官方设置入口：账户级 Web Analytics → Add a site → Manage site → JS snippet。主域名标识可覆盖同一主域名下的子域名。IT-Tools 与 BentoPDF 的 Pages 项目已在 Metrics → Web Analytics 关闭原自动注入，修改开关后须重新部署。`Cache-Control: no-transform` 仅防护边缘内容转换，不能替代 Pages 项目开关。简历与转换站仅在公开说明页直接加载，并禁用 SPA 路由跟踪。统计仅反映收到的浏览器访问事件，不能当作真实用户数或转换成功量。不能采集文件名、文件内容、搜索输入或个人简历。

## 使用指南

`/guides/` 为指南目录，现覆盖图片格式转换、PDF 合并压缩、JSON 格式化、简历制作与 PDF 导出、网站检测报告解读五个主题。内容和更新日期维护在 `scripts/guides.mjs`，同源截图与原创演示文件在 `public/guides/`。新增或更新指南时，逐步按实际界面操作，核对按钮、可见状态、样例输入和下载文件；区分源码核对、浏览器实测与尚未覆盖的功能，同步日期、截图、相关链接和限制。简历的注册、创建、删除等测试只在与线上同镜像的独立实例使用虚构账号进行，不使用生产账号或真实简历；不能用公开首页的演示图替代编辑器流程验收。构建自动生成目录、首页卡片、文章元数据和站点地图链接。

指南中的事实边界：图片转换不承诺压缩比例；PDF Photon 会将页面转成图片，Condense 依赖单独的引擎配置；JSON 工具使用 JSON5 解析，并会将输入保存在浏览器本地；简历需要账号和服务器保存，公开首页的功能演示不代表已创建私人简历；网站检测成功表示取得数据，配置建议需要结合业务判断。文章结构化数据只是内容描述，不表示 Google 已收录或会给予特殊展示。

## 维护

### 发布前结构与链接检查

CI 在构建后使用固定版本 lychee 0.24.2 和 Nu Html Checker 26.10.12 检查 `dist`，工具下载校验失败也会阻止通过。离线检查覆盖本地文件、静态路由和页内锚点；站外 HTTP、真实文件处理与性能由独立检查负责。

```sh
python3 scripts/check_generated_quality.py --bootstrap --root dist --baseline scripts/quality-baseline.json --output /tmp/portal-quality.json
```

主站 HTML 错误基线为零，失效本地链接必须为零。新增错误类别、既有类别数量增长或 HTML 产物明显缺失会阻止发布；不在普通 CI 中更新基线。基线仅能在人工核对具体存量问题后，以 `--capture-baseline-reason` 明确说明理由再提交。裸百度验证令牌文件单独识别，不作为普通 HTML 文档。

### 全站工具搜索

`data/tool-catalog.json` 是随源码发布的完整目录快照，独立构建与 CI 不依赖其他仓库。`npm run catalog:sync` 从同级 `tools`、`bentopdf`、`vert`、`web-check` 的实际注册表、中文文案及启用配置生成目录，并加入简历公共入口和本站五篇指南；`npm run catalog:check` 检查快照是否与这些源码一致。工具站增加、下架或改路径后，重新同步、检查公开入口并提交快照，再构建发布主站。不要把上游未启用工具、语言镜像或私人编辑页面当成新工具。

首页支持名称、英文别名、格式名称、用途及所属站点筛选，默认每次显示 12 项，搜索始终覆盖完整目录。共享入口、登录要求、第三方服务说明和指南显式标注；格式名称表示入口可发现，不承诺任意输入输出组合可用。目录在构建时生成可爬取的静态链接，禁用 JavaScript 仍可访问；搜索不写入网址、不保存到本地存储、不发送到服务器或统计服务。`npm run check` 包含搜索匹配、目录完整性、目的域名及内容转义检查，发布时仍需浏览器核对桌面/手机、筛选、分页和实际入口。

各子站通过“十三月工具导航”互链。导航链接变化时同步五个仓库。现有格式转换与 PDF 站的限制在各站说明，不宣传为全格式转换。主站不加载第三方字体或图片。

本项目代码使用 MIT 许可证；各工具保留各自上游许可证与署名。反馈：support@afeiii.com。
