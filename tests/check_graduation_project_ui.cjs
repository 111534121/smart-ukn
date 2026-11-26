const {chromium} = require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn} = require('node:child_process');
const readline = require('node:readline');
const assert = require('node:assert/strict');

async function check(browser, account, expected, width) {
  const worker = spawn('python', ['tests/mobile_flask_bridge.py', '--saved', `--account=${account}`], {stdio:['pipe','pipe','inherit']});
  const pending = new Map(); let seq = 0;
  readline.createInterface({input:worker.stdout}).on('line', line => {
    try { const data = JSON.parse(line); const item = pending.get(data.id); if (item) {pending.delete(data.id); data.error ? item.reject(Error(data.error)) : item.resolve(data);} } catch {}
  });
  const request = path => new Promise((resolve,reject) => {const id=++seq;pending.set(id,{resolve,reject});worker.stdin.write(JSON.stringify({id,path})+'\n');});
  const context = await browser.newContext({viewport:{width,height:850}, serviceWorkers:'block'});
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    const result = await request(url.pathname + url.search);
    return route.fulfill({status:result.status,contentType:result.type,body:Buffer.from(result.body,'base64')});
  });
  try {
    const page = await context.newPage(); const errors=[]; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8014/graduation-projects');
    await page.getByRole('heading',{name:expected}).waitFor();
    await page.waitForFunction(() => document.querySelector('#teamList').textContent !== '載入中…');
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (account === 'student1') assert.equal(await page.getByText('【資管科示範】智慧校園畢業專題').count(),1);
    if (account === 'teacher1') assert.equal(await page.getByText('我的專題審核待辦').count(),1);
    if (account === 'demo_assistant_cs') assert.equal(await page.getByRole('button',{name:'依志願序一鍵媒合'}).count(),1);
    await page.screenshot({path:`evidence/graduation-project-${account}.png`,fullPage:true});
  } finally { await context.close(); worker.kill(); }
}

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    await check(browser,'student1','我的畢業專題',390);
    await check(browser,'teacher1','我的指導專題',1280);
    await check(browser,'demo_assistant_cs','資管科專題管理',1280);
    console.log('學生手機、老師、科助專題頁載入及寬度檢查通過');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exit(1);});
