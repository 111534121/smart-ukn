const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
    const page=await context.newPage(); const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8000/login');
    await page.locator('#mUsername').fill('demo_assistant_cs');
    await page.locator('#mPassword').fill('123456');
    await page.locator('#loginBtn').click();
    await page.waitForURL('http://127.0.0.1:8000/');
    await page.getByRole('heading',{name:/資訊管理科.*工作區/}).waitFor({timeout:15000});
    await page.getByRole('heading',{name:'行政案件 · 本科'}).waitFor();
    await page.getByRole('heading',{name:'畢業專題進度'}).waitFor();
    const tour = page.getByRole('button',{name:'跳過導覽'});
    if (await tour.isVisible()) await tour.click();
    await page.locator('#megaNav [data-group="學習"]').click();
    assert.equal(await page.locator('#megaPanel').getByText('我的操行',{exact:true}).count(),0);
    await page.getByRole('heading',{name:'畢業進度總表'}).waitFor();
    await page.locator('#assistantGraduationCount').getByText(/顯示 \d+ \/ \d+ 人/).waitFor();
    await page.locator('#assistantGraduationSearch').fill('115534101');
    assert.match(await page.locator('#assistantGraduationCount').innerText(), /顯示 1 \/ \d+ 人/);
    assert.equal(await page.locator('#assistantGraduationTable tbody tr').count(),1);
    await page.locator('#assistantGraduationSearch').fill('');
    const csv = await page.request.get('http://127.0.0.1:8000/api/campus/assistant/graduation-roster.csv');
    assert.equal(csv.status(),200);
    assert.match(csv.headers()['content-type'],/text\/csv/);
    assert.equal(await page.getByRole('link',{name:/開啟行政案件工作台/}).count(),0);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:'evidence/assistant-home-1280.png',fullPage:true});
    await page.goto('http://127.0.0.1:8000/admin-workbench');
    await page.waitForURL('http://127.0.0.1:8000/');
    await context.close();
    console.log('科助校務首頁載入、案件與畢業專題區塊通過');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
