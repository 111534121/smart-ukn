const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const readline=require('node:readline');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const worker=spawn('python',['tests/unified_browser_bridge.py','--saved'],{stdio:['pipe','pipe','inherit'],env:{...process.env,PYTHONPATH:require('node:path').resolve('.preview-deps')}});const pending=new Map();let seq=0;
readline.createInterface({input:worker.stdout}).on('line',line=>{try{const r=JSON.parse(line);const p=pending.get(r.id);if(p){pending.delete(r.id);r.error?p.reject(Error(r.error)):p.resolve(r)}}catch{}});
const send=req=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});worker.stdin.write(JSON.stringify({id:seq,...req})+'\n')});
const browser=await chromium.launch({channel:'chrome',headless:true});const checks=[];try{
 for(const width of [360,390,430]){
 let failTransport=false,failPersonal=false;
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname!=='127.0.0.1')return route.fulfill({contentType:u.hostname==='cdn.tailwindcss.com'?'application/javascript':'text/css',body:u.hostname==='cdn.tailwindcss.com'?'window.tailwind={};':''});
 if((u.pathname==='/api/student/lobby' && failPersonal)||(u.pathname==='/api/campus/transport' && failTransport))return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({status:'error',message:'simulated offline'})});
 const r=await send({path:u.pathname+u.search,method:req.method(),body:req.postDataBuffer()?.toString('base64'),contentType:req.headers()['content-type']});return route.fulfill({status:r.status,contentType:r.type,body:Buffer.from(r.body,'base64')});});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8014/?preview=57#home');await page.addStyleTag({content:'.hidden{display:none!important}'});
 const skip=page.getByRole('button',{name:'跳過導覽',exact:true});try{await skip.waitFor({state:'visible',timeout:2000});await skip.click();}catch(e){if(!String(e).includes('Timeout'))throw e;}
 await page.locator('#lobbyUpdated').filter({hasText:'已更新'}).waitFor();
 assert.equal(await page.locator('#heroSection').isVisible(),false);assert.equal(await page.locator('.portal-welcome').isVisible(),false);
 assert.equal(await page.locator('#lobbyServiceButtons button').count(),4);assert.match(await page.locator('#lobbyTransportMode').textContent(),/示範資料/);assert.match(await page.locator('#lobbyScheduleSource').textContent(),/示範課表/);
 const lobby=page.locator('#studentLobby');assert.equal(await lobby.evaluate(el=>el.scrollWidth>el.clientWidth),false);await lobby.screenshot({path:`evidence/student-lobby-${width}.png`,style:'body > header, #annivBar{visibility:hidden!important}'});
 for(const [kind,name] of [['請假申請','請假'],['成績單申請','成績單'],['場地借用','場地借用'],['設備報修申請','設備報修']]){
  await page.locator(`[data-lobby-service="${kind}"]`).click();await page.getByRole('button',{name:`送出${kind==='設備報修申請'?'設備報修':kind}`,exact:true}).waitFor();assert.equal(new URL(page.url()).hash,'#checklist');await page.getByRole('button',{name:'取消填寫',exact:true}).click();
  await page.goto('http://127.0.0.1:8014/?preview=57#home');await page.addStyleTag({content:'.hidden{display:none!important}'});await page.locator('#lobbyUpdated').filter({hasText:'已更新'}).waitFor();
 }
 const task=page.locator('[data-lobby-case]').first();const id=await task.getAttribute('data-lobby-case');await task.click();await page.locator('#studentCaseDetail h3').filter({hasText:'#'+id+' '}).waitFor();assert.equal(await page.locator('#studentSupplementForm').count(),1);
 await page.goto('http://127.0.0.1:8014/?preview=57#home');await page.addStyleTag({content:'.hidden{display:none!important}'});await page.locator('#lobbyUpdated').filter({hasText:'已更新'}).waitFor();
 await page.locator('[data-lobby-room]').first().click();await page.locator('#mapSearch').waitFor({state:'visible'});assert.equal(await page.locator('#mapSearch').inputValue(),'A305');
 await page.goto('http://127.0.0.1:8014/?preview=57#home');await page.addStyleTag({content:'.hidden{display:none!important}'});await page.locator('#lobbyUpdated').filter({hasText:'已更新'}).waitFor();
 failTransport=true;await page.getByRole('button',{name:'更新今日資訊',exact:true}).click();await page.locator('#lobbyTransportMode').filter({hasText:'載入失敗'}).waitFor();assert.match(await page.locator('#lobbySchedule').textContent(),/物件導向程式設計/);assert.equal(await page.locator('#lobbyServiceButtons button:disabled').count(),0);
 failTransport=false;failPersonal=true;await page.getByRole('button',{name:'更新今日資訊',exact:true}).click();await page.locator('#lobbySchedule').getByText('今日課表載入失敗，請按更新重試。',{exact:true}).waitFor();
 failPersonal=false;await page.getByRole('button',{name:'更新今日資訊',exact:true}).click();await page.locator('#lobbyUpdated').filter({hasText:'已更新'}).waitFor();
 await page.getByRole('button',{name:'搜尋服務與公告',exact:true}).click();assert.equal(await page.locator('#portalQuery').isVisible(),true);
 assert.deepEqual(errors,[]);checks.push({width,services:4,taskNavigation:true,classroomMap:true,partialFailure:true,retry:true,search:true,overflow:false});await context.close();
 }
 fs.writeFileSync('evidence/student-lobby-browser-checks.json',JSON.stringify({transport:'Real Flask responses with saved demo data; external CDN blocked, .hidden utility supplied',checks},null,2));console.log(JSON.stringify(checks));
}finally{await browser.close();worker.kill();}})().catch(e=>{console.error(e);process.exit(1)});
