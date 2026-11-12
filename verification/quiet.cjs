// Quiet chrome pass: fresh profile (no pin) - controls greet, retire to the
// hint tab, wake on hint, and pin persists across reloads.
const pptr=require('puppeteer-core'),assert=require('node:assert/strict'),{spawn}=require('child_process');
(async()=>{let s,b;try{
 s=spawn('python3',['-m','http.server','8799','--bind','127.0.0.1'],{stdio:'ignore'});
 for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:8799/')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 b=await pptr.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 for(const motion of ['reduce','no-preference']){
  const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:motion}]);
  await p.goto('http://127.0.0.1:8799/');
  assert(await p.$eval('.close-button',e=>getComputedStyle(e).visibility)==='visible','chrome greets visible');
  await new Promise(r=>setTimeout(r,3400));
  {const op=await p.$eval('.close-button',e=>getComputedStyle(e).opacity);console.log(motion,'opacity after 3.4s:',op);assert(op==='0','chrome retires');}
  assert(await p.$eval('.chrome-hint',e=>!e.hidden),'hint shows');
  if(motion==='reduce')assert(await p.$eval('.close-button',e=>getComputedStyle(e).transitionDuration)==='0s','reduced motion kills transitions');
  await p.$eval('.chrome-hint',e=>e.dispatchEvent(new MouseEvent('click',{bubbles:true})));
  await new Promise(r=>setTimeout(r,300));
  assert(await p.$eval('.close-button',e=>getComputedStyle(e).opacity)==='1','hint wakes chrome');
  await p.click('#pin-controls');
  await p.reload();await new Promise(r=>setTimeout(r,3400));
  assert(await p.$eval('.close-button',e=>getComputedStyle(e).opacity)==='1','pin persists');
  await ctx.close();
 }

 // Overlap gate: at 320 and 390 the hint rect must not intersect any text or link rect, top and bottom of scroll
 for(const w of [320,390]){
  const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:w,height:844});
  await p.goto('http://127.0.0.1:8799/');
  await new Promise(r=>setTimeout(r,3400));
  const cards=await p.$$('.park-card');await cards[0].click();await p.waitForSelector('#park-detail-screen.visible');
  await p.click('.park-content p');await new Promise(r=>setTimeout(r,3200));
  for(const pos of [0,'end']){
   if(pos==='end')await p.$eval('#park-detail-screen',e=>{e.scrollTop=e.scrollHeight});
   await new Promise(r=>setTimeout(r,300));
   const hits=await p.evaluate(()=>{
    const h=document.querySelector('.chrome-hint').getBoundingClientRect();const bad=[];
    const inter=r=>!(r.right<h.left||r.left>h.right||r.bottom<h.top||r.top>h.bottom);
    const cr=document.querySelector('#park-detail-screen').getBoundingClientRect();
    for(const el of document.querySelectorAll('#park-detail-screen a, #park-detail-screen p, #park-detail-screen h1, #park-detail-screen h2, #park-detail-screen span, #park-detail-screen li')){
     const r=el.getBoundingClientRect();
     const vr={left:Math.max(r.left,cr.left),right:Math.min(r.right,cr.right),top:Math.max(r.top,cr.top),bottom:Math.min(r.bottom,cr.bottom)};
     if(vr.right>vr.left&&vr.bottom>vr.top&&inter(vr)&&getComputedStyle(el).visibility!=='hidden')bad.push(el.tagName+'.'+el.className);
    }
    return bad;
   });
   assert.deepEqual(hits,[],'hint overlap at '+w+' '+pos+': '+hits.join(','));
  }
  await ctx.close();
 }
 console.log('quiet chrome pass OK');}finally{await b?.close();s?.kill();}})().catch(e=>{console.error(e);process.exit(1)});
