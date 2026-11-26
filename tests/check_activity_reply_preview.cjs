const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const readline=require('node:readline');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const role of ['student','teacher']){
 const worker=spawn('python',['tests/mobile_flask_bridge.py','--saved',...(role==='teacher'?['--teacher']:[])],{stdio:['pipe','pipe','inherit']});
 const pending=new Map();let id=0;readline.createInterface({input:worker.stdout}).on('line',l=>{try{const r=JSON.parse(l);pending.get(r.id)?.(r);pending.delete(r.id)}catch{}});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 try{await context.route('**/*',async route=>{const u=new URL(route.request().url());const r=await new Promise(resolve=>{pending.set(++id,resolve);worker.stdin.write(JSON.stringify({id,path:u.pathname+u.search})+'\n')});await route.fulfill({status:r.status,contentType:r.type,body:Buffer.from(r.body,'base64')})});
 const page=await context.newPage();await page.goto('http://127.0.0.1:8014/activities');const card=page.locator('article[data-id="1"]');await card.waitFor();
 if(role==='teacher'){await card.getByRole('button',{name:'查看全班回覆與名單'}).tap();await card.getByText('王小明（S112001）',{exact:true}).waitFor();assert.match(await card.locator('.replies').textContent(),/王小明（S112001）.*參加/);await card.scrollIntoViewIfNeeded();}
 else {await card.getByText('我的回覆：',{exact:false}).waitFor();assert.match(await card.textContent(),/我的回覆：參加/);}
 await page.screenshot({path:`evidence/activity-${role}-confirmed.png`,fullPage:true});console.log(role+' page verified');
 }finally{await context.close();worker.kill();}
 }}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
