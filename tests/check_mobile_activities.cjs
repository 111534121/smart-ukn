// Focused browser integration: real Flask routes and real application scripts.
// External CDN is unavailable here; only utility CSS needed by navigation is supplied.
const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
const readline=require('node:readline');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const worker=spawn('python',['tests/mobile_flask_bridge.py'],{stdio:['pipe','pipe','inherit']});
 const pending=new Map(); let seq=0;
 readline.createInterface({input:worker.stdout}).on('line',line=>{try{const r=JSON.parse(line); const p=pending.get(r.id);if(p){pending.delete(r.id);r.error?p.reject(Error(r.error)):p.resolve(r);}}catch{}});
 const request=path=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});worker.stdin.write(JSON.stringify({id,path})+'\n');});
 const browser=await chromium.launch({channel:'chrome',headless:true}); const results=[];
 try {
  for(const width of [360,390,430]) {
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='127.0.0.1') {const r=await request(url.pathname+url.search);return route.fulfill({status:r.status,contentType:r.type,body:Buffer.from(r.body,'base64')});}
    if(url.hostname==='cdn.tailwindcss.com') return route.fulfill({contentType:'application/javascript',body:'window.tailwind={};'});
    return route.fulfill({contentType:'text/css',body:''});
   });
   const page=await context.newPage();
   console.log('width',width,'opening home');
   await page.goto('http://127.0.0.1:8014/?preview=53#home');
   await page.addStyleTag({content:'.hidden{display:none!important}#megaNav{display:none}#mobileMenu{max-height:75vh;overflow-y:auto}#mobileMenu .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}'});
   await page.waitForFunction(()=>document.querySelector('#mobileMenu button[data-tab="tab-activities"]'));
   assert.equal(await page.locator('#mobileMenu button[data-tab="tab-activities"]').count(),1);

   const skip = page.getByRole('button',{name:'跳過導覽',exact:true});
   await skip.waitFor({state:'visible'}); await skip.tap();
   await page.getByRole('button',{name:'開啟選單',exact:true}).tap();
   await page.locator('#mobileMenu').getByText('校園生活',{exact:true}).waitFor({state:'visible'});
   const link=page.locator('#mobileMenu button[data-tab="tab-activities"]');
   assert.equal(await link.textContent(),'🎯 活動與比賽');
   console.log('width',width,'tapping activity link');
   await link.tap();
   await page.locator('#tab-activities #pageTitle').waitFor({state:'visible'});
   await page.locator('#tab-activities #listTitle').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('#activityList').textContent!=='載入中…');
   assert.equal(new URL(page.url()).pathname,'/');
   assert.equal(new URL(page.url()).hash,'#activities');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('#activityMessage').textContent(),'');
   await page.screenshot({path:`evidence/mobile-activities-${width}.png`,fullPage:true});
   results.push({width,status:'passed',path:'/#activities',horizontalOverflow:false});
   await context.close();
  }
  fs.writeFileSync('evidence/mobile-activities-check.json',JSON.stringify({mode:'isolated Flask transport; navigation utility CSS supplied because external CDN is blocked',results},null,2));
  console.log(JSON.stringify(results));
 } finally {await browser.close();worker.kill();}
})().catch(e=>{console.error(e);process.exit(1)});
