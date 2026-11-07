// Real agent-browser exploration of the running HTTP app. Test state lives only
// in the isolated qa-audit browser session; no production hooks or RNG changes.
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { mkdirSync, appendFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { createMatch, KEY } from '../src/engine.js';

const out=resolve('docs/qa-audit');mkdirSync(out,{recursive:true});
const cli=process.env.AGENT_BROWSER_BIN||join(process.env.APPDATA,'npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
const log=join(out,'agent-commands.jsonl');if(existsSync(log)&&!existsSync(join(out,'initial-agent-commands.jsonl')))copyFileSync(log,join(out,'initial-agent-commands.jsonl'));writeFileSync(log,'');
const session=process.env.QA_SESSION||'qa-final';
const recordTrace=process.env.QA_RECORD_AGENT_TRACE==='1';
function run(...args){
  const result=execFileSync(cli,['--session',session,'--headed','--executable-path','C:/Program Files/Google/Chrome/Application/chrome.exe',...args],{encoding:'utf8',timeout:45000,stdio:['ignore','pipe','pipe']});
  appendFileSync(log,JSON.stringify({time:new Date().toISOString(),args,result})+'\n');return result.trim();
}
const evaluate=code=>run('eval','-b',Buffer.from(code).toString('base64'));
const players=[{name:'Alexandria Longname XXIV',skin:'wolf'},{name:'Fox',skin:'fox'},{name:'Hare',skin:'hare'},{name:'Bear',skin:'bear'}];
const measurements=[];
run('open','http://127.0.0.1:4173/');
try{
  for(const [width,height] of [[667,375],[844,390],[932,430],[1366,768]]){
    // In headed mode viewport changes can reset navigation: always open AFTER.
    run('set','viewport',String(width),String(height));run('open','http://127.0.0.1:4173/');
    if(recordTrace)run('trace','start');
    evaluate('navigator.userAgent');
    for(const fatal of [false,true]){
      const fixture=createMatch(players,()=>fatal?0:5);
      evaluate(`localStorage.setItem(${JSON.stringify(KEY)},${JSON.stringify(JSON.stringify(fixture))});localStorage.setItem('liars-deck.settings',JSON.stringify({volume:.12,reducedFlashing:false,reducedMotion:false}));`);
      run('reload');run('snapshot','-i');
      if(!fatal)run('screenshot',join(out,`table-${width}x${height}.png`));
      run('find','first','.seat:not(:disabled)','click');
      run('wait','--fn','document.getElementById("execution").dataset.phase === "ready"');run('snapshot','-i');
      if(!fatal)run('screenshot',join(out,`execution-${width}x${height}.png`));
      run('click','#fire-button');
      // A duplicate DOM click must not consume another chamber.
      evaluate('document.getElementById("fire-button").click()');
      run('wait','--fn','document.getElementById("execution").dataset.phase === "result" && Number(getComputedStyle(document.getElementById("result")).opacity) > .99 && !document.getElementById("return-button").hidden');
      run('screenshot',join(out,`${fatal?'elimination':'survival'}-${width}x${height}.png`));
      run('snapshot','-i');
      const code=`JSON.stringify({viewport:[innerWidth,innerHeight],document:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],phase:document.getElementById('execution').dataset.phase,result:document.getElementById('result').innerText,shots:JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})).players[0].shots,dead:JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})).players[0].dead,returnBox:document.getElementById('return-button').getBoundingClientRect().toJSON()})`;
      measurements.push({width,height,fatal,result:evaluate(code)});
      writeFileSync(join(out,'measurements.json'),JSON.stringify(measurements,null,2));
      // The normal automatic return remains enabled; wait for it rather than
      // racing a return button against that transition while collecting data.
      run('wait','--fn','document.getElementById("execution").hidden');
      run('snapshot','-i');
      if(fatal)run('screenshot',join(out,`after-elimination-${width}x${height}.png`));
      console.log(`${width}x${height} ${fatal?'ELIMINATED':'SURVIVED'}: captured and returned`);
    }
    try {if(recordTrace)run('trace','stop',join(out,`agent-trace-${width}x${height}.zip`));}
    catch(error){appendFileSync(log,JSON.stringify({traceExport:'FAILED',width,height,error:error.message})+'\n');}
  }
  run('errors');run('console');
}finally{
  writeFileSync(join(out,'measurements.json'),JSON.stringify(measurements,null,2));
}
