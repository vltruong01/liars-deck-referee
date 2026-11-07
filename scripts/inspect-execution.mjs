import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {appendFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createMatch,KEY} from '../src/engine.js';
const out=resolve('docs/execution-qa');mkdirSync(out,{recursive:true});const log=join(out,'agent-browser.jsonl');writeFileSync(log,'');
const cli=join(process.env.APPDATA,'npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
function run(...args){const result=execFileSync(cli,['--session','qa-execution','--headed','--executable-path','C:/Program Files/Google/Chrome/Application/chrome.exe',...args],{encoding:'utf8',timeout:45000});appendFileSync(log,JSON.stringify({args,result})+'\n');return result;}
const evaluate=code=>run('eval','-b',Buffer.from(code).toString('base64'));
run('open','http://127.0.0.1:4173/');
const fixture=createMatch([{name:'Raven',skin:'raven',appearance:{hat:'top-hat',mouth:'cigar',outfit:'vest'}},{name:'Fox',skin:'fox',appearance:{hat:'cowboy',mouth:'cigarette',outfit:'western'}},{name:'Hare',skin:'hare'},{name:'Bear',skin:'bear'}],()=>0);
evaluate(`localStorage.setItem(${JSON.stringify(KEY)},${JSON.stringify(JSON.stringify(fixture))})`);run('reload');run('snapshot','-i');run('click','[data-execute="p1"]');
run('wait','--fn','document.querySelector("#execution").dataset.phase === "ready"');run('snapshot','-i');run('screenshot',join(out,'agent-ready.png'));run('click','#fire-button');
run('wait','--fn','document.querySelector("#execution").dataset.outcome === "fatal" && getComputedStyle(document.querySelector("#result")).opacity === "1"');run('snapshot','-i');run('screenshot',join(out,'agent-death.png'));
run('wait','--fn','document.querySelector("#execution").hidden');run('snapshot','-i');run('screenshot',join(out,'agent-return.png'));evaluate('({viewport:[innerWidth,innerHeight],camera:getComputedStyle(document.querySelector(".room-camera")).transform,arms:document.querySelector("#execution-portrait").querySelectorAll("[data-arm]").length})');run('errors');run('close');
console.log('Headed agent-browser execution recorded.');
