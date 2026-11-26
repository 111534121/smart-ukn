const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const context=await browser.newContext({serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8000/login');
    await page.locator('#mUsername').fill('demo_assistant_cs');
    await page.locator('#mPassword').fill('123456');
    await page.locator('#loginBtn').click();
    await page.waitForURL('http://127.0.0.1:8000/');
    await page.goto('http://127.0.0.1:8000/activities');
    await page.getByRole('heading',{name:'建立新活動'}).waitFor();
    assert.equal(await page.locator('input[name="location"]').count(),1);
    assert.equal(await page.locator('input[name="visitor_allowed"]').count(),1);
    const card=page.locator('article').filter({hasText:'【流程示範】資管科機器人體驗賽'});
    await card.waitFor();
    assert.match(await card.innerText(),/示範資訊教室/);
    await card.getByRole('button',{name:'顯示簽到 QR'}).click();
    await card.locator('img[alt="現場簽到 QR Code"]').waitFor();
    const qr=await page.request.get(new URL(await card.locator('img[alt="現場簽到 QR Code"]').getAttribute('src'),page.url()).href);
    assert.equal(qr.status(),200);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:'evidence/activity-flow-demo.png',fullPage:true});
    console.log('活動建立欄位、示範活動、共用名額與 QR 顯示通過');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
