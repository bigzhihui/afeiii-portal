/* Shared-component contract tests, not a substitute for each application's workflow tests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../tools/node_modules/@playwright/test'));
const source = path.resolve(__dirname, '../public/engagement');
const hosts = ['afeiii.com', 'tools.afeiii.com', 'pdf.afeiii.com', 'convert.afeiii.com', 'resume.afeiii.com', 'check.afeiii.com'];
const secret = 'PRIVATE_FILE_RESUME_INPUT_TOKEN_8472';
const fixture = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/engagement/feedbackfin.css"><script defer src="/engagement/feedbackfin.js"></script></head><body><main><h1>组件隔离验收</h1><label>私有测试输入<input value="${secret}"></label></main></body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  let checks = 0;
  try {
    for (const width of [1440, 375]) for (const host of hosts) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      const bodies = [];
      let feedbackStatus = 500;
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await context.route('**/*', async route => {
        const request = route.request(); const url = new URL(request.url());
        if (url.pathname.startsWith('/engagement/v1/')) {
          const data = request.postDataJSON(); bodies.push({url:url.pathname, data, headers:request.headers()});
          const status = url.pathname.endsWith('/events') ? 200 : feedbackStatus;
          return route.fulfill({status, contentType:'application/json', headers:{'Access-Control-Allow-Origin': 'https://' + host}, body:JSON.stringify(status < 400 ? {received:true,id:data.id} : {error:'模拟服务失败'})});
        }
        if (url.pathname.startsWith('/engagement/')) {
          const filename = path.basename(url.pathname);
          const type = filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'application/json';
          return route.fulfill({status:200, contentType:type, body:fs.readFileSync(path.join(source, filename))});
        }
        return route.fulfill({status:200, contentType:'text/html', headers:{'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://afeiii.com; form-action 'none'"}, body:fixture});
      });
      const privatePath = host.startsWith('resume.') ? '/resume/' + secret : host.startsWith('check.') ? '/check/' + secret : host.startsWith('convert.') ? '/convert/?name=' + secret : '/?query=' + secret;
      await page.goto('https://' + host + privatePath);
      await page.getByRole('button', {name:'反馈问题', exact:true}).click();
      assert.equal(bodies.length, 0, 'default-off emits no analytics');
      await page.getByLabel('问题描述（必填）').fill('这是隔离验收的测试问题。');
      await page.getByRole('button', {name:'发送反馈', exact:true}).click();
      await page.getByRole('status').filter({hasText:'发送未确认'}).waitFor();
      assert.equal(await page.getByLabel('问题描述（必填）').inputValue(), '这是隔离验收的测试问题。');
      const firstId = bodies[0].data.id;
      feedbackStatus = 201;
      await page.getByRole('button', {name:'发送反馈', exact:true}).click();
      await page.getByRole('status').filter({hasText:'已收到反馈'}).waitFor();
      assert.equal(bodies[1].data.id, firstId, 'retry reuses id');
      await page.getByLabel('允许匿名操作统计', {exact:false}).check();
      const site = hosts.indexOf(host);
      const tool = site === 3 ? 'convert' : site === 4 ? 'export' : site === 5 ? 'scan' : 'home';
      await page.evaluate(({tool,secret}) => {
        const id = crypto.randomUUID();
        for (const phase of ['start','success','download']) document.dispatchEvent(new CustomEvent('afeiii:usage', {detail:{id,phase,tool,filename:secret,content:secret,url:location.href}}));
      }, {tool,secret});
      await page.waitForTimeout(150);
      assert.ok(bodies.some(item=>item.data.phase==='success'));
      assert.ok(!JSON.stringify(bodies).includes(secret), 'no input, file name, private path, query or referrer');
      assert.ok(bodies.every(item=>!item.headers.referer));
      const count = bodies.length;
      await page.getByLabel('允许匿名操作统计', {exact:false}).uncheck();
      await page.evaluate(tool => document.dispatchEvent(new CustomEvent('afeiii:usage', {detail:{id:crypto.randomUUID(),phase:'failure',tool}})), tool);
      await page.waitForTimeout(100);
      assert.equal(bodies.length, count, 'revocation stops new events');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
      assert.deepEqual(errors, []);
      if (process.env.SCREENSHOTS && host === 'afeiii.com') {
        fs.mkdirSync(process.env.SCREENSHOTS, {recursive:true});
        await page.screenshot({path:path.join(process.env.SCREENSHOTS, 'feedback-' + width + '.png')});
      }
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('dialog').evaluate(el=>el.open), false);
      assert.equal(await page.getByRole('button', {name:'反馈问题', exact:true}).evaluate(el=>el===document.activeElement), true);
      checks++;
      await context.close();
    }
    for (const signal of ['doNotTrack', 'globalPrivacyControl']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      let posts = 0;
      await context.addInitScript(signal => {
        localStorage.setItem('afeiii-anonymous-usage', 'yes');
        Object.defineProperty(navigator, signal, {value:signal==='doNotTrack'?'1':true});
      }, signal);
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (route.request().method()==='POST') {posts++;return route.fulfill({status:200,body:'{"received":true}'});}
        if (url.pathname.startsWith('/engagement/')) {
          const filename=path.basename(url.pathname);
          return route.fulfill({status:200,contentType:filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':'application/json',body:fs.readFileSync(path.join(source,filename))});
        }
        return route.fulfill({status:200,contentType:'text/html',body:fixture});
      });
      await page.goto('https://afeiii.com/');
      await page.getByRole('button',{name:'反馈问题',exact:true}).click();
      assert.ok(await page.getByLabel('允许匿名操作统计',{exact:false}).isDisabled());
      await page.evaluate(()=>document.dispatchEvent(new CustomEvent('afeiii:usage',{detail:{id:crypto.randomUUID(),phase:'start',tool:'home'}})));
      await page.waitForTimeout(100);
      assert.equal(posts,0,signal+' overrides stored opt-in');
      await context.close();
    }
    console.log(JSON.stringify({shared_component_cases:checks, privacy_signal_cases:2, desktop:1440, mobile:375, privacy:'passed', http_failure_and_retry:'passed', production:false}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
