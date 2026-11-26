// Operates the explicitly authorized local demo #55, not a disposable fixture.
const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const readline=require('node:readline');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const worker=spawn('python',['tools/case55_preview_bridge.py','--case55-demo'],{stdio:['pipe','pipe','inherit']});const pending=new Map();let seq=0;
readline.createInterface({input:worker.stdout}).on('line',l=>{try{const r=JSON.parse(l);const p=pending.get(r.id);if(p){pending.delete(r.id);r.error?p.reject(Error(r.error)):p.resolve(r)}}catch{}});
const send=req=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});worker.stdin.write(JSON.stringify({id:seq,...req})+'\n')});
const api=async(path,method='GET',json,as='student1')=>{const r=await send({path,method,json,as});const b=JSON.parse(Buffer.from(r.body,'base64'));assert.equal(r.status,200,JSON.stringify(b));return b.data;};
const history=[];let item=await api('/api/campus/admin-cases/55');assert.equal(item.status,'待補件','Demo already operated: do not reset or resubmit it automatically');
const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname!=='127.0.0.1')return route.fulfill({contentType:u.hostname==='cdn.tailwindcss.com'?'application/javascript':'text/css',body:u.hostname==='cdn.tailwindcss.com'?'window.tailwind={};':''});const r=await send({path:u.pathname+u.search,method:req.method(),body:req.postDataBuffer()?.toString('base64'),contentType:req.headers()['content-type']});return route.fulfill({status:r.status,contentType:r.type,body:Buffer.from(r.body,'base64')});});
 const page=await context.newPage();await page.goto('http://127.0.0.1:8014/?preview=54&case=55#checklist');await page.addStyleTag({content:'.hidden{display:none!important}'});
 const skip=page.getByRole('button',{name:'跳過導覽',exact:true});try{await skip.waitFor({state:'visible',timeout:2500});await skip.click();await page.locator('#footerCol1').getByRole('button',{name:'線上申辦與進度',exact:true}).click();}catch(e){if(!String(e).includes('Timeout'))throw e;}
 for(const kind of ['請假申請','成績單申請','場地借用','設備報修申請'])assert.equal(await page.locator(`[data-new-service="${kind}"]`).count(),1);
 const detail=page.locator('#studentCaseDetail');await detail.getByText('待補件',{exact:true}).first().waitFor();history.push({status:item.status,step:item.progress.current_step,next:item.progress.next_action});
 for(const required of item.requirements)await detail.getByLabel(required,{exact:true}).check();
 await detail.getByLabel('補件說明',{exact:true}).fill('【示範補件】用途：申請校內獎學金；可聯絡時段：週三下午；領取方式：教務處櫃檯領取。資料均為虛構，不代表正式成績單申請。');
 await detail.getByLabel('補件附件（選填）',{exact:true}).setInputFiles({name:'demo-transcript-supplement.txt',mimeType:'text/plain',buffer:Buffer.from('【專題示範】成績單用途：校內獎學金；聯絡時段：週三下午；櫃檯領取。不含真實成績或身分資料。')});
 await page.locator('#studentCasesSection').screenshot({path:'evidence/case55-before-resubmit.png'});
 await detail.getByRole('button',{name:'補件完成，重新送審',exact:true}).tap();await detail.getByText('重新送審',{exact:true}).first().waitFor();assert.equal(await page.locator('#studentSupplementForm').count(),0);assert.match(await detail.textContent(),/等待承辦單位受理/);
 item=await api('/api/campus/admin-cases/55');history.push({status:item.status,step:item.progress.current_step,next:item.progress.next_action});await detail.screenshot({path:'evidence/case55-resubmitted.png'});
 const act=async(action,extra={})=>{item=await api('/api/campus/admin-cases/55','POST',{action,revision:item.revision,...extra},'demo_office_academic');};
 const refresh=async()=>{await page.getByRole('button',{name:'更新進度',exact:true}).tap();await page.waitForFunction(expected=>document.querySelector('#studentCaseDetail strong')?.textContent===expected,item.status);};
 await act('start');await refresh();assert.match(await detail.textContent(),/等待承辦審核/);history.push({status:item.status,step:item.progress.current_step,next:item.progress.next_action});await detail.screenshot({path:'evidence/case55-under-review.png'});
 await act('advance',{checked_steps:item.workflow[0].checks,note:'【示範審核】補件內容已齊全，申請用途與份數核對完成，送成績單製發與交付。'});await refresh();history.push({status:item.status,step:item.progress.current_step,next:item.progress.next_action});
 await act('start');await refresh();await page.waitForFunction(()=>document.querySelector('#studentCaseDetail').textContent.includes('成績單製發與交付'));
 assert.equal(await page.locator('#studentSupplementForm').count(),0);assert.match(await detail.textContent(),/等待承辦審核/);
 await detail.getByText('查看處理紀錄與結果',{exact:true}).click();assert.match(await detail.textContent(),/補件重新送審/);assert.match(await detail.textContent(),/完成步驟：成績單資料核對/);
 history.push({status:item.status,step:item.progress.current_step,next:item.progress.next_action});await detail.screenshot({path:'evidence/case55-review-next-stage.png'});
 fs.writeFileSync('evidence/case55-flow-verification.json',JSON.stringify({case:55,transport:'real persisted Flask data via stdio; mobile browser UI; external CDN unavailable',reviewer:'demo_office_academic',states:history,files:item.files.map(f=>f.name),final:item.progress},null,2));console.log(JSON.stringify({case:55,states:history,files:item.files.map(f=>f.name)}));
 await context.close();
}finally{await browser.close();worker.kill();}})().catch(e=>{console.error(e);process.exit(1)});
