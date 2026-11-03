const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
const el = id => { if(!elements.has(id)) elements.set(id,{innerHTML:'',textContent:'',value:'',hidden:false,classList:{toggle(name,on){this[name]=on}},setAttribute(){},addEventListener(){},focus(){}}); return elements.get(id); };
const audienceSection = {hidden:false};
const ctx = vm.createContext({console, URL, location:{origin:'http://localhost'}, currentUser:{role:'學生'}, isStaff:()=>false,
 document:{getElementById:el,querySelector:selector=>selector==='.portal-audiences'?audienceSection:el('portalLogin')}, isLoggedIn:()=>true, escapeHtml:s=>String(s??'').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
 FEATURES:[{key:'rules',tab:'tab-ai',name:'請假規章',desc:'申請請假',icon:'',group:'校務'}], newsTab:'ann',homeNewsError:false,homeAnnouncements:[],
 featureByKey:key=>ctx.FEATURES.find(f=>f.key===key), api:async url=>url==='/api/search'?{matched:true,answer:'<script>bad</script>',source_doc:'學則'}:{data:[]},switchTab(){},renderHomeNews(){}
});
vm.runInContext(fs.readFileSync('static/js/home-portal.js','utf8'),ctx);
(async()=>{
 ctx.initHomePortal(); assert.equal(audienceSection.hidden,true);
 ctx.currentUser.role='訪客';ctx.isLoggedIn=()=>false;
 ctx.initHomePortal(); assert.equal(audienceSection.hidden,false);
 ctx.isLoggedIn=()=>true;
 ctx.currentUser.role='老師'; ctx.isStaff=()=>true;
 ctx.initHomePortal(); assert.equal(audienceSection.hidden,true);
 assert.equal(el('tab-home').classList['teacher-home'],true);
 ctx.currentUser.role='學生'; ctx.isStaff=()=>false;
 assert.equal(ctx.portalNewsCategory({title:'清寒助學金申請'}),'獎助學金');
 assert.equal(ctx.portalNewsCategory({title:'新生入學公告'}),'招生');
 assert.equal(ctx.portalNewsCategory({title:'期末考試公告'}),'課務');
 assert.equal(ctx.portalNewsCategory({title:'圖書館利用講習開放報名'}),'活動');
 assert.equal(ctx.portalSafeUrl('javascript:alert(1)'),null);
 assert.equal(ctx.portalSafeUrl('https://www.ukn.edu.tw/'),'https://www.ukn.edu.tw/');
 ctx.selectPortalAudience('staff'); assert.equal(ctx.currentUser.role,'學生');
 el('portalQuery').value='請假'; await ctx.searchPortal();
 assert.match(el('portalResultList').innerHTML,/請假規章/);
 assert.match(el('portalResultList').innerHTML,/&lt;script&gt;/);
 assert.doesNotMatch(el('portalResultList').innerHTML,/<script>/);
 ctx.api=async()=>{throw Error('offline')}; await ctx.searchPortal();
 assert.match(el('portalSearchStatus').textContent,/暫時無法載入/);
 assert.match(el('portalResultList').innerHTML,/請假規章/);
 ctx.homeAnnouncements=[{title:'註冊',publish_date:'2026-01-01'},{title:'課程',publish_date:'2026-10-01'}];
 assert.equal(ctx.filterPortalNews(ctx.homeAnnouncements)[0].title,'課程');
 vm.runInContext("portalCategory='獎助學金'",ctx);assert.equal(ctx.filterPortalNews(ctx.homeAnnouncements).length,0);
 const pending=[];ctx.api=url=>new Promise(resolve=>pending.push(resolve));
 const oldSearch=ctx.searchPortal();
 ctx.api=async()=>({data:[],matched:false});el('portalQuery').value='無結果';await ctx.searchPortal();
 const latest=el('portalSearchStatus').textContent;
 pending.forEach(resolve=>resolve({data:[],matched:true,answer:'過期回應'}));await oldSearch;
 assert.equal(el('portalSearchStatus').textContent,latest);
 assert.doesNotMatch(el('portalResultList').innerHTML,/過期回應/);
 console.log('首頁入口、分類排序、搜尋整合、失敗提示、權限與內容跳脫測試通過。');
})().catch(e=>{console.error(e);process.exitCode=1});
