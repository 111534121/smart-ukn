// Explicit real-data demo: #55 final review, certificate download and verification.
const {chromium}=require('C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');const readline=require('node:readline');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const worker=spawn('python',['tools/case55_preview_bridge.py','--case55-demo'],{stdio:['pipe','pipe','inherit'],env:{...process.env,PYTHONPATH:'C:/Users/Lulu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/Lib/site-packages'}});const pending=new Map();let seq=0;
readline.createInterface({input:worker.stdout}).on('line',line=>{try{const r=JSON.parse(line);const p=pending.get(r.id);if(p){pending.delete(r.id);r.error?p.reject(Error(r.error)):p.resolve(r)}}catch{}});
const send=req=>new Promise((resolve,reject)=>{pending.set(++seq,{resolve,reject});worker.stdin.write(JSON.stringify({id:seq,...req})+'\n')});
const api=async(path,as='student1')=>{const r=await send({path,as});assert.equal(r.status,200);return JSON.parse(Buffer.from(r.body,'base64')).data;};
let actor='demo_office_academic';let item=await api('/api/campus/admin-cases/55',actor);assert.equal(item.workflow_index,1);assert(['處理中','已完成'].includes(item.status));
fs.mkdirSync('evidence/browser-downloads',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,downloadsPath:require('node:path').resolve('evidence/browser-downloads')});try{
 const context=await browser.newContext({viewport:{width:1024,height:850},serviceWorkers:'block',acceptDownloads:true});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.hostname!=='127.0.0.1')return route.fulfill({contentType:u.hostname==='cdn.tailwindcss.com'?'application/javascript':'text/css',body:u.hostname==='cdn.tailwindcss.com'?'window.tailwind={};':''});const r=await send({path:u.pathname+u.search,method:req.method(),body:req.postDataBuffer()?.toString('base64'),contentType:req.headers()['content-type'],as:actor});return route.fulfill({status:r.status,contentType:r.type,headers:r.headers,body:Buffer.from(r.body,'base64')});});
 const page=await context.newPage();await page.goto('http://127.0.0.1:8014/admin-workbench');await page.getByRole('button',{name:'#55 ·',exact:false}).click();
 if (!item.certificate) {
 await page.getByRole('checkbox',{name:'確認成績單內容',exact:true}).check();await page.getByRole('checkbox',{name:'記錄交付方式',exact:true}).check();
 await page.getByRole('combobox',{name:'辦理動作',exact:true}).selectOption('complete');
 await page.getByRole('checkbox',{name:'我已核對本版本申請內容、補件與附件，同意以本人帳號留下線上簽核紀錄。',exact:true}).check();
 await page.getByRole('textbox',{name:'辦理原因／轉交說明／結案結果',exact:true}).fill('【示範線上簽核】已核對目前版本的成績單申請用途、份數、補件與附件。核准示範申辦並完成交付登錄；僅產生專題示範完成證明，不製發正式成績單。');
 await page.locator('#detail').screenshot({path:'evidence/case55-signoff-before-approval.png'});
 await page.getByRole('button',{name:'確認執行',exact:true}).click();
 }
 await page.getByRole('link',{name:'下載示範證明 PDF',exact:true}).waitFor();
 item=await api('/api/campus/admin-cases/55',actor);assert.equal(item.status,'已完成');assert(item.certificate.integrity_ok);assert.equal(item.signoffs.at(-1).actor_username,'demo_office_academic');
 console.log('APPROVED',item.certificate.serial);
 actor='student1';await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8014/?preview=55&case=55#checklist');await page.addStyleTag({content:'.hidden{display:none!important}'});
 const skip=page.getByRole('button',{name:'跳過導覽',exact:true});try{await skip.waitFor({state:'visible',timeout:2500});await skip.click();await page.locator('#footerCol1').getByRole('button',{name:'線上申辦與進度',exact:true}).click();}catch(e){if(!String(e).includes('Timeout'))throw e;}
 const detail=page.locator('#studentCaseDetail');await detail.getByRole('link',{name:'下載示範證明 PDF',exact:true}).waitFor();assert.match(await detail.textContent(),/已完成/);assert.equal(await page.locator('#studentSupplementForm').count(),0);
 await detail.locator('[aria-label="可追溯線上簽核"]').screenshot({path:'evidence/case55-student-certificate.png'});
 fs.mkdirSync('output/pdf',{recursive:true});const downloaded=page.waitForEvent('download');await detail.getByRole('link',{name:'下載示範證明 PDF',exact:true}).click();const download=await downloaded;const pdfPath='output/pdf/'+download.suggestedFilename();let downloadTransport='browser download';try{await download.saveAs(pdfPath);}catch(error){const response=await send({path:item.certificate.download_url,as:'student1'});assert.equal(response.status,200);fs.writeFileSync(pdfPath,Buffer.from(response.body,'base64'));downloadTransport='Authenticated Flask download response; isolated Chromium canceled saving';}assert(fs.readFileSync(pdfPath).subarray(0,4).equals(Buffer.from('%PDF')));
 await page.goto('http://127.0.0.1:8014'+item.certificate.verification_path);await page.getByText('核發紀錄有效（專題示範）',{exact:true}).waitFor();assert(!((await page.textContent('body')).includes('王小明')));await page.screenshot({path:'evidence/case55-certificate-verification.png',fullPage:true});
 fs.writeFileSync('evidence/case55-signoff-verification.json',JSON.stringify({case:55,status:item.status,serial:item.certificate.serial,reviewer:item.signoffs.at(-1).actor_username,case_revision:item.signoffs.at(-1).case_revision,pdf:pdfPath,download_transport:downloadTransport,certificate:item.certificate,signoffs:item.signoffs,transport:'Real persisted Flask responses; reviewer and student UI browser automation; local demo URL only'},null,2));
 console.log('PASS: version confirmation, staff approval, closed state, student download, private certificate and verification page');await context.close();
}finally{await browser.close();worker.kill();}})().catch(e=>{console.error(e);process.exit(1)});
